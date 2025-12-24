import sqlite3
import json
import os
import re # Para extrair números e nomes dos ficheiros

# --- Configuração ---
db_file = 'simulados_itil.db' # Nome do ficheiro do banco de dados SQLite
json_files = [
    # Simulados Completos
    'perguntas1.json', 'perguntas2.json', 'perguntas3.json', 'perguntas4.json',
    'perguntas5.json', 'perguntas6.json', 'perguntas7.json', 'perguntas8.json',
    # Simulados por Tópico
    'perguntas_conceitos.json', 'perguntas_principios.json', 'perguntas_dimensoes.json',
    'perguntas_svs.json', 'perguntas_cvs.json',
    # Blocos de Práticas
    'perguntas_praticas_1.json', 'perguntas_praticas_2.json',
    'perguntas_praticas_3.json', 'perguntas_praticas_4.json'
]
# --- Fim da Configuração ---

def extrair_info_ficheiro(nome_ficheiro):
    """
    Extrai a fonte do simulado e o tópico com base no nome do ficheiro.
    Retorna (fonte_simulado, topico)
    """
    if nome_ficheiro.startswith('perguntas') and nome_ficheiro[9].isdigit():
        match = re.search(r'perguntas(\d+)\.json', nome_ficheiro)
        if match:
            numero = match.group(1)
            return f'Simulado {numero}', 'Geral'
    elif nome_ficheiro.startswith('perguntas_'):
        if '_praticas_' in nome_ficheiro:
            match = re.search(r'perguntas_praticas_(\d+)\.json', nome_ficheiro)
            if match:
                bloco = match.group(1)
                simulados = {
                    '1': '1 e 2', '2': '3 e 4',
                    '3': '5 e 6', '4': '7 e 8'
                }
                return f'Praticas Bloco {bloco} (Simulados {simulados.get(bloco, "?")})', 'Práticas'
        else:
            match = re.search(r'perguntas_(.+)\.json', nome_ficheiro)
            if match:
                topico_bruto = match.group(1).replace('_', ' ').title()
                # Mapeamento para nomes mais descritivos
                mapa_topicos = {
                    'Conceitos': 'Conceitos Chave',
                    'Principios': 'Princípios Orientadores',
                    'Dimensoes': '4 Dimensões',
                    'Svs': 'SVS',
                    'Cvs': 'CVS'
                }
                topico_final = mapa_topicos.get(topico_bruto, topico_bruto)
                return f'Tópico: {topico_final}', topico_final

    return 'Desconhecido', 'Desconhecido' # Fallback

def limpar_opcao(texto_opcao):
    """Remove o prefixo 'A) ', 'B) ', etc. se existir."""
    match = re.match(r'^[A-D]\)\s*(.*)', texto_opcao)
    if match:
        return match.group(1).strip()
    return texto_opcao.strip()

def obter_indice_resposta(resposta_letra, opcoes):
    """Converte a letra da resposta (A, B, C, D) para o índice (0, 1, 2, 3)."""
    letras = ['A', 'B', 'C', 'D']
    try:
        return letras.index(resposta_letra.upper())
    except ValueError:
        print(f"AVISO: Resposta inválida '{resposta_letra}' encontrada. Usando índice 0 como padrão.")
        return 0 # Retorna 0 como fallback

# --- Lógica Principal ---
conn = None
try:
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    print(f"Ligado ao banco de dados: {db_file}")

    total_perguntas_inseridas = 0
    total_opcoes_inseridas = 0

    for ficheiro in json_files:
        if not os.path.exists(ficheiro):
            print(f"AVISO: Ficheiro '{ficheiro}' não encontrado. A saltar.")
            continue

        fonte_simulado, topico = extrair_info_ficheiro(ficheiro)
        print(f"\nA processar ficheiro: {ficheiro} (Fonte: {fonte_simulado}, Tópico: {topico})")

        try:
            with open(ficheiro, 'r', encoding='utf-8') as f:
                perguntas_data = json.load(f)

            perguntas_no_ficheiro = 0
            for pergunta_obj in perguntas_data:
                texto_pergunta = pergunta_obj.get('pergunta')
                opcoes_lista = pergunta_obj.get('opcoes')
                resposta_valor = pergunta_obj.get('resposta_correta') # Pode ser letra ou número

                if not texto_pergunta or not opcoes_lista or resposta_valor is None:
                    print(f"AVISO: Pergunta inválida ou incompleta no ficheiro {ficheiro}. A saltar: {pergunta_obj}")
                    continue

                # Determina o índice correto da resposta
                if isinstance(resposta_valor, str):
                    # Se for letra, converte para índice
                    resposta_idx = obter_indice_resposta(resposta_valor, opcoes_lista)
                elif isinstance(resposta_valor, int) and 0 <= resposta_valor < len(opcoes_lista):
                    # Se já for um índice válido
                    resposta_idx = resposta_valor
                else:
                    print(f"AVISO: Valor de 'resposta_correta' inesperado ({resposta_valor}) na pergunta: '{texto_pergunta[:50]}...'. Usando índice 0.")
                    resposta_idx = 0

                # Inserir na tabela Perguntas
                cursor.execute("""
                    INSERT INTO Perguntas (texto_pergunta, resposta_correta_idx, fonte_simulado, topico)
                    VALUES (?, ?, ?, ?)
                """, (texto_pergunta, resposta_idx, fonte_simulado, topico))

                pergunta_id = cursor.lastrowid # Obter o ID da pergunta acabada de inserir
                perguntas_no_ficheiro += 1
                total_perguntas_inseridas += 1

                # Inserir na tabela Opcoes
                for i, opcao_texto_raw in enumerate(opcoes_lista):
                    opcao_texto_limpo = limpar_opcao(opcao_texto_raw) # Limpa "A) ", etc.
                    cursor.execute("""
                        INSERT INTO Opcoes (pergunta_id, indice_opcao, texto_opcao)
                        VALUES (?, ?, ?)
                    """, (pergunta_id, i, opcao_texto_limpo))
                    total_opcoes_inseridas += 1

            print(f" -> {perguntas_no_ficheiro} perguntas inseridas.")

        except json.JSONDecodeError:
            print(f"ERRO: Ficheiro '{ficheiro}' não contém JSON válido.")
        except Exception as e:
            print(f"ERRO ao processar o ficheiro '{ficheiro}': {e}")

    # Confirmar (gravar) as alterações no banco de dados
    conn.commit()
    print(f"\n--- Processo Concluído ---")
    print(f"Total de perguntas inseridas: {total_perguntas_inseridas}")
    print(f"Total de opções inseridas: {total_opcoes_inseridas}")

except sqlite3.Error as e:
    print(f"Erro ao interagir com o banco de dados: {e}")
    if conn:
        conn.rollback() # 
finally:
    if conn:
        conn.close()
        print("Ligação ao banco de dados fechada.")