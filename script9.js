document.addEventListener('DOMContentLoaded', () => {
    const questionEl = document.getElementById('question');
    const optionsContainerEl = document.getElementById('options-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const quizContainerEl = document.getElementById('quiz-container');
    const resultContainerEl = document.getElementById('result-container');
    const scoreEl = document.getElementById('score');
    const percentageEl = document.getElementById('percentage');

    let questions = [];
    let currentQuestionIndex = 0;
    let questionStates = []; // Guarda o estado das respostas

    async function loadQuestions() {
        // ✅ ALTERAÇÃO DO SIMULADO 9
        const response = await fetch('perguntas9.json');

        questions = await response.json();
        questions.sort(() => Math.random() - 0.5);
        startQuiz();
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        questionStates = new Array(questions.length)
            .fill(null)
            .map(() => ({ answered: false, userAnswer: null }));

        resultContainerEl.classList.add('hidden');
        quizContainerEl.classList.remove('hidden');
        showQuestion();
    }

    function showQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        const state = questionStates[currentQuestionIndex];

        questionEl.innerText = `Questão ${currentQuestionIndex + 1} de ${questions.length}: ${currentQuestion.pergunta}`;
        optionsContainerEl.innerHTML = '';

        // Mostra o botão Próxima imediatamente
        nextBtn.classList.remove('hidden');

        currentQuestion.opcoes.forEach(optionText => {
            const button = document.createElement('button');
            button.innerText = optionText;
            button.classList.add('option-btn');
            optionsContainerEl.appendChild(button);

            if (!state.answered) {
                button.addEventListener('click', () =>
                    selectAnswer(button, currentQuestion.resposta_correta)
                );
            }
        });

        // Reaplica cores se a questão já foi respondida
        if (state.answered) {
            const correctAnswerLetter = currentQuestion.resposta_correta;

            Array.from(optionsContainerEl.children).forEach(btn => {
                btn.disabled = true;
                const optionLetter = btn.innerText.substring(0, 1);

                if (optionLetter === correctAnswerLetter) {
                    btn.classList.add('correct');
                }

                if (
                    btn.innerText === state.userAnswer &&
                    optionLetter !== correctAnswerLetter
                ) {
                    btn.classList.add('incorrect');
                }
            });
        }

        prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
        nextBtn.innerText =
            currentQuestionIndex === questions.length - 1
                ? 'Ver Resultado'
                : 'Próxima Pergunta';
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
    }

    function showResult() {
        quizContainerEl.classList.add('hidden');
        resultContainerEl.classList.remove('hidden');

        let finalScore = 0;

        questionStates.forEach((state, index) => {
            if (state.answered) {
                const correctLetter = questions[index].resposta_correta;
                const userLetter = state.userAnswer.substring(0, 1);
                if (userLetter === correctLetter) {
                    finalScore++;
                }
            }
        });

        const totalQuestions = questions.length;
        const percentage =
            totalQuestions > 0 ? (finalScore / totalQuestions) * 100 : 0;

        scoreEl.innerText = `Você acertou ${finalScore} de ${totalQuestions} perguntas.`;
        percentageEl.innerText = `Sua pontuação final: ${percentage.toFixed(2)}%`;
    }

    // Navegação
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

    // Inicializa o simulado
    loadQuestions();
});
