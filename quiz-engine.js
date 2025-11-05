document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO HTML ---
    const pageTitle = document.querySelector('title');
    const quizTitleEl = document.getElementById('quiz-title');
    const questionEl = document.getElementById('question');
    const optionsContainerEl = document.getElementById('options-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const quizContainerEl = document.getElementById('quiz-container');
    const resultContainerEl = document.getElementById('result-container');
    const scoreEl = document.getElementById('score');
    const percentageEl = document.getElementById('percentage');
    const progressBarEl = document.getElementById('progress-bar');
    const backLink = document.querySelector('.back-to-menu a');

    // --- VARIÁVEIS DE ESTADO 
    let questions = [];
    let currentQuestionIndex = 0;
    let questionStates = [];
    
    // --- MAPA DE CONFIGURAÇÃO DE TODOS OS SIMULADOS 
    const quizConfig = {
        '1': { title: 'Simulado 1 ITIL 4 fundamentos', file: 'perguntas1.json', back: 'index.html' },
        '2': { title: 'Simulado 2 ITIL 4 fundamentos', file: 'perguntas2.json', back: 'index.html' },
        '3': { title: 'Simulado 3 ITIL 4 fundamentos', file: 'perguntas3.json', back: 'index.html' },
        '4': { title: 'Simulado 4 ITIL 4 fundamentos', file: 'perguntas4.json', back: 'index.html' },
        '5': { title: 'Simulado 5 ITIL 4 fundamentos', file: 'perguntas5.json', back: 'index.html' },
        '6': { title: 'Simulado 6 ITIL 4 fundamentos', file: 'perguntas6.json', back: 'index.html' },
        '7': { title: 'Simulado 7 ITIL 4 fundamentos', file: 'perguntas7.json', back: 'index.html' },
        '8': { title: 'Simulado 8 ITIL 4 fundamentos', file: 'perguntas8.json', back: 'index.html' },
        '9': { title: 'Simulado 9 ITIL 4 fundamentos', file: 'perguntas9.json', back: 'index.html' }, 
        'conceitos': { title: 'Simulado por Tópico: Conceitos Chave', file: 'perguntas_conceitos.json', back: 'index.html' },
        'principios': { title: 'Simulado por Tópico: 7 Princípios Orientadores', file: 'perguntas_principios.json', back: 'index.html' },
        'dimensoes': { title: 'Simulado por Tópico: 4 Dimensões', file: 'perguntas_dimensoes.json', back: 'index.html' },
        'svs': { title: 'Simulado por Tópico: Sistema de Valor de Serviço (SVS)', file: 'perguntas_svs.json', back: 'index.html' },
        'cvs': { title: 'Simulado por Tópico: Cadeia de Valor de Serviço (CVS)', file: 'perguntas_cvs.json', back: 'index.html' },
        'praticas_1': { title: 'Simulado de Práticas (Questões dos Simulados 1 e 2)', file: 'perguntas_praticas_1.json', back: 'menu_praticas.html' },
        'praticas_2': { title: 'Simulado de Práticas 2 (Questões dos Simulados 3 e 4)', file: 'perguntas_praticas_2.json', back: 'menu_praticas.html' },
        'praticas_3': { title: 'Simulado de Práticas 3 (Questões dos Simulados 5 e 6)', file: 'perguntas_praticas_3.json', back: 'menu_praticas.html' },
        'praticas_4': { title: 'Simulado de Práticas 4 (Questões dos Simulados 7 e 8)', file: 'perguntas_praticas_4.json', back: 'menu_praticas.html' }
    };

    // --- LÓGICA DE INICIALIZAÇÃO ---
    function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('id');
        const config = quizConfig[quizId];

        if (config) {
            pageTitle.textContent = config.title;
            quizTitleEl.textContent = config.title;
            backLink.href = config.back;
            if (config.back === 'menu_praticas.html') {
                backLink.innerHTML = '&larr; Voltar para Blocos de Práticas';
            } else {
                backLink.innerHTML = '&larr; Voltar ao Menu Principal';
            }
            loadQuestions(config.file);
        } else {
            quizTitleEl.textContent = 'Erro: Simulado não encontrado!';
            quizContainerEl.classList.add('hidden');
        }
    }

    async function loadQuestions(arquivoJson) {
        try {
            const response = await fetch(arquivoJson);
            if (!response.ok) throw new Error(`Arquivo não encontrado: ${arquivoJson}`);
            questions = await response.json();
            questions.sort(() => Math.random() - 0.5);
            startQuiz();
        } catch (error) {
            questionEl.innerText = `Erro ao carregar as perguntas. Verifique o console.`;
            console.error(error);
        }
    }
    
    function startQuiz() {
        currentQuestionIndex = 0;
        questionStates = new Array(questions.length).fill(null).map(() => ({ answered: false, userAnswer: null }));
        resultContainerEl.classList.add('hidden');
        quizContainerEl.classList.remove('hidden');
        updateProgressBar();
        showQuestion();
    }
    
    function updateProgressBar() {
        if (questions.length > 0) {
            const answeredCount = questionStates.filter(state => state.answered).length;
            const progressPercentage = (answeredCount / questions.length) * 100;
            progressBarEl.style.width = `${progressPercentage}%`;
        }
    }

    function showQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        const state = questionStates[currentQuestionIndex];
        
        questionEl.innerText = `Questão ${currentQuestionIndex + 1} de ${questions.length}: ${currentQuestion.pergunta}`;
        optionsContainerEl.innerHTML = '';
        nextBtn.classList.remove('hidden');

        currentQuestion.opcoes.forEach(optionText => {
            const button = document.createElement('button');
            button.innerText = optionText;
            button.classList.add('option-btn');
            optionsContainerEl.appendChild(button);

            if (!state.answered) {
                button.addEventListener('click', () => selectAnswer(button, currentQuestion.resposta_correta));
            }
        });

        if (state.answered) {
            const correctAnswerLetter = currentQuestion.resposta_correta;
            Array.from(optionsContainerEl.children).forEach(btn => {
                btn.disabled = true;
                const optionLetter = btn.innerText.substring(0, 1);
                if (optionLetter === correctAnswerLetter) {
                    btn.classList.add('correct');
                }
                if (btn.innerText === state.userAnswer && optionLetter !== correctAnswerLetter) {
                    btn.classList.add('incorrect');
                }
            });
        }

        prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
        nextBtn.innerText = currentQuestionIndex === questions.length - 1 ? 'Ver Resultado' : 'Próxima Pergunta';
    }

    function selectAnswer(selectedButton, correctAnswerLetter) {
        const userAnswerLetter = selectedButton.innerText.substring(0, 1);
        
        questionStates[currentQuestionIndex].answered = true;
        questionStates[currentQuestionIndex].userAnswer = selectedButton.innerText;

        Array.from(optionsContainerEl.children).forEach(btn => {
            btn.disabled = true;
            if (btn.innerText.substring(0, 1) === correctAnswerLetter) {
                btn.classList.add('correct');
            }
        });

        if (userAnswerLetter === correctAnswerLetter) {
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }
        updateProgressBar();
    }

    function showResult() {
        quizContainerEl.classList.add('hidden');
        resultContainerEl.classList.remove('hidden');
        
        let finalScore = 0;
        questionStates.forEach((state, index) => {
            if (state.answered) {
                const correctLetter = questions[index].resposta_correta;
                const userLetter = state.userAnswer.substring(0, 1);
                if(userLetter === correctLetter) {
                    finalScore++;
                }
            }
        });

        const totalQuestions = questions.length;
        const percentage = (totalQuestions > 0) ? (finalScore / totalQuestions) * 100 : 0;
        
        scoreEl.innerText = `Você acertou ${finalScore} de ${totalQuestions} perguntas.`;
        percentageEl.innerText = `Sua pontuação final: ${percentage.toFixed(2)}%`;
    }

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            showResult();
        }
    });
    
    // --- NOVO CÓDIGO: Atalho da tecla 'Esc' ---
    // Adiciona um "ouvinte" para o evento de pressionar uma tecla no documento inteiro
    document.addEventListener('keydown', function(event) {
        // Verifica se a tecla pressionada foi a 'Escape'
        if (event.key === 'Escape') {
            // Se foi, redireciona o usuário para a página do menu principal
            window.location.href = 'index.html';
        }
    });

    // Inicia todo o processo
    initializePage();
});