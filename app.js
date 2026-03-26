// Global Variables
let allQuestions = {};
let currentQuiz = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let startTime = null;
let timerInterval = null;

// Load questions from JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions_data.json');
        allQuestions = await response.json();
        initializeExam();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions. Please refresh the page.');
    }
}

// Initialize Exam
function initializeExam() {
    // Flatten all questions from all sections
    const allQuestionsArray = [];
    for (const section in allQuestions) {
        allQuestionsArray.push(...allQuestions[section]);
    }

    // Shuffle and select 50 random questions
    currentQuiz = shuffleArray(allQuestionsArray).slice(0, 50);
    
    // Initialize user answers object
    userAnswers = {};
    currentQuestionIndex = 0;

    // Update UI
    document.getElementById('totalQuestions').textContent = currentQuiz.length;
    document.getElementById('totalQuestionsResult').textContent = currentQuiz.length;

    // Start timer
    startTime = Date.now();
    startTimer();

    // Display first question
    displayQuestion();
}

// Shuffle Array (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Display Current Question
function displayQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    
    // Update question number and text
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const optionLetters = ['A', 'B', 'C', 'D'];
    optionLetters.forEach(letter => {
        if (question.options[letter]) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            input.value = letter;
            input.id = 'option_' + letter;
            
            // Check if this option was previously selected
            if (userAnswers[currentQuestionIndex] === letter) {
                input.checked = true;
                optionDiv.classList.add('selected');
            }

            input.addEventListener('change', () => {
                userAnswers[currentQuestionIndex] = letter;
                // Update visual feedback
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                optionDiv.classList.add('selected');
            });

            const label = document.createElement('label');
            label.htmlFor = 'option_' + letter;
            label.className = 'option-text';
            label.textContent = `${letter}. ${question.options[letter]}`;

            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            optionsContainer.appendChild(optionDiv);
        }
    });

    // Update button states
    updateButtonStates();
}

// Update Button States
function updateButtonStates() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentQuiz.length - 1) {
        nextBtn.textContent = 'Submit →';
        nextBtn.onclick = submitExam;
    } else {
        nextBtn.textContent = 'Next →';
        nextBtn.onclick = nextQuestion;
    }
}

// Next Question
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        window.scrollTo(0, 0);
    }
}

// Previous Question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        window.scrollTo(0, 0);
    }
}

// Submit Exam
function submitExam() {
    clearInterval(timerInterval);
    calculateResults();
    displayResults();
    window.scrollTo(0, 0);
}

// Calculate Results
function calculateResults() {
    let correctCount = 0;
    let wrongAnswers = [];

    currentQuiz.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correct_answer;

        if (userAnswer === correctAnswer) {
            correctCount++;
        } else {
            wrongAnswers.push({
                questionIndex: index,
                question: question.question,
                userAnswer: userAnswer ? question.options[userAnswer] : 'Not answered',
                correctAnswer: question.options[correctAnswer],
                userAnswerLetter: userAnswer || 'N/A',
                correctAnswerLetter: correctAnswer,
                section: question.section
            });
        }
    });

    const totalQuestions = currentQuiz.length;
    const wrongCount = totalQuestions - correctCount;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Store results
    window.examResults = {
        totalQuestions,
        correctCount,
        wrongCount,
        score,
        wrongAnswers,
        duration: formatTime(Math.floor((Date.now() - startTime) / 1000))
    };
}

// Display Results
function displayResults() {
    const results = window.examResults;

    // Hide exam container
    document.getElementById('examContainer').style.display = 'none';

    // Show results container
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';

    // Update result cards
    document.getElementById('correctAnswersResult').textContent = results.correctCount;
    document.getElementById('wrongAnswersResult').textContent = results.wrongCount;
    document.getElementById('scoreResult').textContent = results.score + '%';

    // Display wrong answers review
    displayWrongAnswersReview(results.wrongAnswers);
}

// Display Wrong Answers Review
function displayWrongAnswersReview(wrongAnswers) {
    const reviewContainer = document.getElementById('wrongAnswersReview');
    reviewContainer.innerHTML = '';

    if (wrongAnswers.length === 0) {
        const noMistakesDiv = document.createElement('div');
        noMistakesDiv.className = 'wrong-answer-item no-mistakes';
        noMistakesDiv.innerHTML = '🎉 Perfect! You answered all questions correctly!';
        reviewContainer.appendChild(noMistakesDiv);
        return;
    }

    wrongAnswers.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'wrong-answer-item';

        const questionDiv = document.createElement('div');
        questionDiv.className = 'wrong-answer-question';
        questionDiv.textContent = `Question ${item.questionIndex + 1}: ${item.question}`;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'wrong-answer-details';

        // Your Answer
        const yourAnswerDiv = document.createElement('div');
        yourAnswerDiv.className = 'answer-detail';
        yourAnswerDiv.innerHTML = `
            <div class="answer-detail-label">Your Answer</div>
            <div class="answer-detail-text incorrect">
                ${item.userAnswerLetter}. ${item.userAnswer}
            </div>
        `;

        // Correct Answer
        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.className = 'answer-detail';
        correctAnswerDiv.innerHTML = `
            <div class="answer-detail-label">Correct Answer</div>
            <div class="answer-detail-text correct">
                ${item.correctAnswerLetter}. ${item.correctAnswer}
            </div>
        `;

        detailsDiv.appendChild(yourAnswerDiv);
        detailsDiv.appendChild(correctAnswerDiv);

        itemDiv.appendChild(questionDiv);
        itemDiv.appendChild(detailsDiv);
        reviewContainer.appendChild(itemDiv);
    });
}

// Retake Exam
function retakeExam() {
    // Reset all variables
    currentQuestionIndex = 0;
    userAnswers = {};

    // Hide results container
    document.getElementById('resultsContainer').style.display = 'none';

    // Show exam container
    document.getElementById('examContainer').style.display = 'block';

    // Reinitialize exam
    initializeExam();
}

// Download Results
function downloadResults() {
    const results = window.examResults;
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Header
    csvContent += 'Comprehensive Test for Bachelor of Dentist - Results\n';
    csvContent += 'made by dr. Montser AL_jodaei\n\n';

    // Summary
    csvContent += 'Total Questions,' + results.totalQuestions + '\n';
    csvContent += 'Correct Answers,' + results.correctCount + '\n';
    csvContent += 'Wrong Answers,' + results.wrongCount + '\n';
    csvContent += 'Score,' + results.score + '%\n';
    csvContent += 'Duration,' + results.duration + '\n\n';

    // Wrong Answers
    if (results.wrongAnswers.length > 0) {
        csvContent += 'Question Number,Question,Your Answer,Correct Answer,Section\n';
        results.wrongAnswers.forEach(item => {
            const questionNum = item.questionIndex + 1;
            const question = item.question.replace(/,/g, ';');
            const userAnswer = item.userAnswer.replace(/,/g, ';');
            const correctAnswer = item.correctAnswer.replace(/,/g, ';');
            csvContent += `${questionNum},"${question}","${userAnswer}","${correctAnswer}","${item.section}"\n`;
        });
    }

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dental_exam_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Timer Functions
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').textContent = formatTime(elapsed);
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadQuestions);
