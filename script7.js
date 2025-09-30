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
        const response = await fetch('perguntas7.json');
        questions = await response.json();
        questions.sort(() => Math.random() - 0.5);
        startQuiz();
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        resultContainerEl.classList.add('hidden');
        quizContainerEl.classList.remove('hidden');
        showQuestion();
    }

    function showQuestion() {
        optionsContainerEl.innerHTML = '';
        nextBtn.classList.add('hidden');

        const currentQuestion = questions[currentQuestionIndex];
        questionEl.innerText = currentQuestion.pergunta;

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
            selectedButton.classList.add('correct');
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
    
    loadQuestions();
});