document.addEventListener('DOMContentLoaded', () => {
    const questionEl = document.getElementById('question');
    const optionsContainerEl = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');
    const quizContainerEl = document.getElementById('quiz-container');
    const resultContainerEl = document.getElementById('result-container');
    const scoreEl = document.getElementById('score');
    const percentageEl = document.getElementById('percentage');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    async function loadQuestions() {
        // A ÚNICA MUDANÇA É AQUI: Carrega as perguntas do novo arquivo
        const response = await fetch('perguntas2.json');
        const loadedQuestions = await response.json();
        questions = loadedQuestions.sort(() => Math.random() - 0.5);
        startQuiz();
    }

    function showQuestion() {
        optionsContainerEl.innerHTML = '';
        nextBtn.classList.add('hidden');

        const currentQuestion = questions[currentQuestionIndex];
        // DEPOIS:
questionEl.innerText = `Questão ${currentQuestionIndex + 1} de ${questions.length}: ${currentQuestion.pergunta}`;

        currentQuestion.opcoes.forEach(optionText => {
            const button = document.createElement('button');
            button.innerText = optionText;
            button.classList.add('option-btn');
            button.addEventListener('click', () => selectAnswer(button, currentQuestion.resposta_correta));
            optionsContainerEl.appendChild(button);
        });
    }
    
    function selectAnswer(selectedButton, correctAnswerLetter) {
        const userAnswerLetter = selectedButton.innerText.substring(0, 1);
        
        Array.from(optionsContainerEl.children).forEach(btn => {
            btn.disabled = true;
            if (btn.innerText.substring(0, 1) === correctAnswerLetter) {
                btn.classList.add('correct');
            }
        });

        if (userAnswerLetter === correctAnswerLetter) {
            score++;
        } else {
            selectedButton.classList.add('incorrect');
        }

        nextBtn.classList.remove('hidden');
    }

    function showResult() {
        quizContainerEl.classList.add('hidden');
        resultContainerEl.classList.remove('hidden');

        const totalQuestions = questions.length;
        const percentage = (score / totalQuestions) * 100;

        scoreEl.innerText = `Você acertou ${score} de ${totalQuestions} perguntas.`;
        percentageEl.innerText = `Sua pontuação final: ${percentage.toFixed(2)}%`;
    }

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    });
    
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
    }
    
    loadQuestions();
});