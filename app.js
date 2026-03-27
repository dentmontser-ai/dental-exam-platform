// Global Variables
let allQuestions = {};
let examModels = {};
let currentQuiz = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let startTime = null;
let timerInterval = null;
let timerEnabled = false;
let selectedQuestionCount = 50;
let selectedModel = null;

// Load questions and models from JSON
async function loadQuestionsAndModels() {
    try {
        const modelsResponse = await fetch('exam_models.json');
        examModels = await modelsResponse.json();
        
        const questionsResponse = await fetch('questions_data.json');
        allQuestions = await questionsResponse.json();
        
        initializeSettings();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load exam data. Please refresh the page.');
    }
}

// Initialize Settings Screen
function initializeSettings() {
    fetch('metadata.json')
        .then(response => response.json())
        .then(metadata => {
            const modelSelect = document.getElementById('modelSelect');
            for (let i = 1; i <= metadata.total_models; i++) {
                const option = document.createElement('option');
                option.value = `model_${i}`;
                option.textContent = `Model ${i}`;
                modelSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error loading metadata:', error);
            const modelSelect = document.getElementById('modelSelect');
            for (let i = 1; i <= 8; i++) {
                const option = document.createElement('option');
                option.value = `model_${i}`;
                option.textContent = `Model ${i}`;
                modelSelect.appendChild(option);
            }
        });

    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('customCount').value = '';
            selectedQuestionCount = parseInt(this.dataset.count);
        });
    });

    document.getElementById('customCount').addEventListener('input', function() {
        if (this.value) {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            selectedQuestionCount = Math.min(parseInt(this.value) || 50, 922);
        }
    });

    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            timerEnabled = this.dataset.timer === 'true';
        });
    });
}

// Start Exam
function startExam() {
    const modelSelect = document.getElementById('modelSelect');
    selectedModel = modelSelect.value;

    if (!selectedModel) {
        alert('Please select an exam model!');
        return;
    }

    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('headerSection').style.display = 'block';
    document.getElementById('mainContent').style.display = 'block';

    initializeExam();
}

// Initialize Exam
function initializeExam() {
    const savedSession = sessionStorage.getItem('examSession') || localStorage.getItem('examSession');
    
    if (savedSession) {
        const session = JSON.parse(savedSession);
        currentQuiz = session.currentQuiz;
        currentQuestionIndex = session.currentQuestionIndex;
        userAnswers = session.userAnswers;
        selectedModel = session.selectedModel;
        timerEnabled = session.timerEnabled;
        
        if (timerEnabled && session.startTime) {
            startTime = session.startTime;
            startTimer();
        }
    } else {
        let modelQuestions = examModels[selectedModel] || [];
        currentQuiz = modelQuestions.slice(0, selectedQuestionCount);
        userAnswers = {};
        currentQuestionIndex = 0;
    }

    document.getElementById('totalQuestions').textContent = currentQuiz.length;
    document.getElementById('totalQuestionsResult').textContent = currentQuiz.length;
    document.getElementById('changeModelBtn').style.display = 'block';

    displayQuestion();
}

// Display Question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuiz.length) {
        submitExam();
        return;
    }

    const question = currentQuiz[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const options = ['A', 'B', 'C', 'D'];
    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = option;
        input.id = `option_${option}`;
        input.checked = userAnswers[currentQuestionIndex] === option;
        
        const label = document.createElement('label');
        label.htmlFor = `option_${option}`;
        label.textContent = `${option}) ${question.options[option]}`;

        optionDiv.appendChild(input);
        optionDiv.appendChild(label);
        optionsContainer.appendChild(optionDiv);
        
        // Add click handler directly to the option div
        optionDiv.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            userAnswers[currentQuestionIndex] = option;
            input.checked = true;
            saveExamSession();
            console.log(`Answer saved: Question ${currentQuestionIndex + 1} = ${option}`);
        });
    });

    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === currentQuiz.length - 1 ? 'Submit' : 'Next →';
    
    if (currentQuestionIndex === currentQuiz.length - 1) {
        document.getElementById('nextBtn').onclick = submitExam;
    } else {
        document.getElementById('nextBtn').onclick = nextQuestion;
    }

    saveExamSession();
}

// Next Question
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        submitExam();
    }
}

// Previous Question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Submit Exam
function submitExam() {
    let correctCount = 0;
    const wrongAnswers = [];

    currentQuiz.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        if (userAnswer === question.correct_answer) {
            correctCount++;
        } else {
            wrongAnswers.push({
                questionNum: index + 1,
                question: question.question,
                userAnswer: userAnswer ? `${userAnswer}) ${question.options[userAnswer]}` : 'Not answered',
                correctAnswer: `${question.correct_answer}) ${question.options[question.correct_answer]}`
            });
        }
    });

    const wrongCount = currentQuiz.length - correctCount;
    const score = Math.round((correctCount / currentQuiz.length) * 100);

    document.getElementById('correctAnswersResult').textContent = correctCount;
    document.getElementById('wrongAnswersResult').textContent = wrongCount;
    document.getElementById('scoreResult').textContent = score + '%';

    const reviewDiv = document.getElementById('wrongAnswersReview');
    reviewDiv.innerHTML = '';

    if (wrongAnswers.length === 0) {
        reviewDiv.innerHTML = '<p class="no-mistakes">Congratulations! You answered all questions correctly! 🎉</p>';
    } else {
        wrongAnswers.forEach(item => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <h4>Question ${item.questionNum}</h4>
                </div>
                <p class="review-question"><strong>Q:</strong> ${item.question}</p>
                <p class="review-answer incorrect"><strong>Your Answer:</strong> ${item.userAnswer}</p>
                <p class="review-answer correct"><strong>Correct Answer:</strong> ${item.correctAnswer}</p>
            `;
            reviewDiv.appendChild(reviewItem);
        });
    }

    document.getElementById('examContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'block';
    sessionStorage.removeItem('examSession');
    localStorage.removeItem('examSession');

    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Timer Functions
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function toggleTimer() {
    if (!timerEnabled) {
        timerEnabled = true;
        startTime = Date.now();
        startTimer();
        document.getElementById('timer').style.display = 'block';
        document.getElementById('toggleTimerBtn').style.display = 'none';
    }
}

// Change Model
function changeModel() {
    const choice = confirm('Do you want to:\n\n✓ OK = Continue with a new model\n✗ Cancel = Resume current exam');
    
    if (!choice) {
        return;
    }
    
    sessionStorage.removeItem('examSession');
    localStorage.removeItem('examSession');
    
    currentQuestionIndex = 0;
    userAnswers = {};
    startTime = null;
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    document.getElementById('settingsScreen').style.display = 'flex';
    document.getElementById('headerSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('examContainer').style.display = 'block';

    document.getElementById('modelSelect').value = '';
    document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-count="50"]').classList.add('active');
    document.querySelectorAll('.timer-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-timer="false"]').classList.add('active');
    document.getElementById('customCount').value = '';
    selectedQuestionCount = 50;
    timerEnabled = false;
    selectedModel = null;
}

// Retake Exam
function retakeExam() {
    changeModel();
}

// Save Exam Session
function saveExamSession() {
    const session = {
        currentQuiz: currentQuiz,
        currentQuestionIndex: currentQuestionIndex,
        userAnswers: userAnswers,
        selectedModel: selectedModel,
        timerEnabled: timerEnabled,
        startTime: startTime
    };
    const sessionJSON = JSON.stringify(session);
    sessionStorage.setItem('examSession', sessionJSON);
    localStorage.setItem('examSession', sessionJSON);
}

// Download Results
function downloadResults() {
    let csv = 'Question,Your Answer,Correct Answer,Result\n';
    
    currentQuiz.forEach((question, index) => {
        const userAnswer = userAnswers[index] || 'Not answered';
        const isCorrect = userAnswer === question.correct_answer;
        csv += `"${question.question}","${userAnswer}","${question.correct_answer}","${isCorrect ? 'Correct' : 'Wrong'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam_results.csv';
    a.click();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadQuestionsAndModels);
