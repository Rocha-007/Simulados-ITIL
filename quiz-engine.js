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
    const questionNavEl = document.getElementById('question-nav'); // <-- NOVO ELEMENTO

    // --- VARIÁVEIS DE ESTADO ---
    let questions = [];
    let currentQuestionIndex = 0;
    let questionStates = [];
    const optionLetters = ['A', 'B', 'C', 'D'];

    // --- MAPA DE CONFIGURAÇÃO DE TODOS OS SIMULADOS ---
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
            if(quizContainerEl) quizContainerEl.classList.add('hidden');
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
            if(questionEl) questionEl.innerText = `Erro ao carregar as perguntas. Verifique o console.`;
            console.error(error);
        }
    }
    
    function startQuiz() {
        currentQuestionIndex = 0;
        questionStates = new Array(questions.length).fill(null).map(() => ({ answered: false, userAnswerIndex: null })); 
        if(resultContainerEl) resultContainerEl.classList.add('hidden');
        if(quizContainerEl) quizContainerEl.classList.remove('hidden');
        
        createNavigation(); // <-- NOVA FUNÇÃO CHAMADA
        updateProgressBar();
        showQuestion();
    }
    
    // --- NOVAS FUNÇÕES DE NAVEGAÇÃO ---
    
    function createNavigation() {
        questionNavEl.innerHTML = '';
        questions.forEach((_, index) => {
            const navLink = document.createElement('span');
            navLink.innerText = index + 1;
            navLink.classList.add('nav-link');
            navLink.dataset.index = index;
            navLink.addEventListener('click', () => jumpToQuestion(index));
            questionNavEl.appendChild(navLink);
        });
    }
    
    function updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.classList.remove('current', 'answered');
            if (questionStates[index].answered) {
                link.classList.add('answered');
            }
            if (index === currentQuestionIndex) {
                link.classList.add('current');
            }
        });
    }

    function jumpToQuestion(index) {
        currentQuestionIndex = index;
        showQuestion();
    }
    
    // --- FUNÇÕES ATUALIZADAS ---

    function updateProgressBar() {
        if (questions.length > 0 && progressBarEl) {
            const answeredCount = questionStates.filter(state => state.answered).length;
            const progressPercentage = (answeredCount / questions.length) * 100;
            progressBarEl.style.width = `${progressPercentage}%`;
        }
    }

    function showQuestion() {
        if (!questions || questions.length === 0 || !questionEl || !optionsContainerEl || !prevBtn || !nextBtn) return;

        updateNavigation(); // <-- ATUALIZA O ESTADO DOS NÚMEROS

        const currentQuestion = questions[currentQuestionIndex];
        const state = questionStates[currentQuestionIndex];
        
        questionEl.innerText = `Questão ${currentQuestionIndex + 1} de ${questions.length}: ${currentQuestion.pergunta}`;
        optionsContainerEl.innerHTML = '';
        nextBtn.classList.remove('hidden');

        currentQuestion.opcoes.forEach((optionText, index) => {
            const button = document.createElement('button');
            button.innerText = `${optionLetters[index]}) ${optionText}`; 
            button.dataset.index = index; 
            button.classList.add('option-btn');
            optionsContainerEl.appendChild(button);

            if (!state.answered) {
                button.addEventListener('click', () => selectAnswer(button, currentQuestion.resposta_correta));
            }
        });

        if (state.answered) {
            const correctAnswerIndex = currentQuestion.resposta_correta;
            Array.from(optionsContainerEl.children).forEach(btn => {
                btn.disabled = true;
                const optionIndex = parseInt(btn.dataset.index);
                if (optionIndex === correctAnswerIndex) {
                    btn.classList.add('correct');
                }
                if (optionIndex === state.userAnswerIndex && optionIndex !== correctAnswerIndex) {
                    btn.classList.add('incorrect');
                }
            });
        }

        prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
        nextBtn.innerText = currentQuestionIndex === questions.length - 1 ? 'Ver Resultado' : 'Próxima Pergunta';
    }

    function selectAnswer(selectedButton, correctAnswerIndex) {
        const userIndex = parseInt(selectedButton.dataset.index); 
        
        questionStates[currentQuestionIndex].answered = true;
        questionStates[currentQuestionIndex].userAnswerIndex = userIndex; 

        Array.from(optionsContainerEl.children).forEach(btn => {
            btn.disabled = true;
            const optionIndex = parseInt(btn.dataset.index);
            if (optionIndex === correctAnswerIndex) {
                btn.classList.add('correct');
            }
        });

        if (userIndex === correctAnswerIndex) {
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }
        
        updateProgressBar();
        updateNavigation(); // <-- ATUALIZA O NÚMERO PARA "RESPONDIDO"
    }

    function showResult() {
        if(quizContainerEl) quizContainerEl.classList.add('hidden');
        if(resultContainerEl) resultContainerEl.classList.remove('hidden');
        
        let finalScore = 0;
        questionStates.forEach((state, index) => {
            if (state.answered) {
                const correctAnswerIndex = questions[index].resposta_correta;
                if(state.userAnswerIndex === correctAnswerIndex) {
                    finalScore++;
                }
            }
        });

        const totalQuestions = questions.length;
        const percentage = (totalQuestions > 0) ? (finalScore / totalQuestions) * 100 : 0;
        
        if(scoreEl) scoreEl.innerText = `Você acertou ${finalScore} de ${totalQuestions} perguntas.`;
        if(percentageEl) percentageEl.innerText = `Sua pontuação final: ${percentage.toFixed(2)}%`;
    }

    // --- EVENT LISTENERS (sem alteração) ---
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                showQuestion();
            }
        });
    }

    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                showQuestion();
            } else {
                showResult();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (quizContainerEl && !quizContainerEl.classList.contains('hidden')) { 
            if (event.key === 'Escape') {
                const urlParams = new URLSearchParams(window.location.search);
                const quizId = urlParams.get('id');
                const config = quizConfig[quizId];
                if(config && config.back) {
                     window.location.href = config.back;
                } else {
                     window.location.href = 'index.html';
                }
            }
        }
    });

    
    initializePage();
});