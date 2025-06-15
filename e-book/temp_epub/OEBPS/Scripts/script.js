// 과일 퀴즈 데이터 (순서대로: 사과 -> 바나나 -> 포도 -> 오렌지 -> 수박)
const fruits = [
    { image: '../Images/apple.jpg', correct: '사과', name: '사과' },
    { image: '../Images/banana.jpg', correct: '바나나', name: '바나나' },
    { image: '../Images/grape.jpg', correct: '포도', name: '포도' },
    { image: '../Images/orange.jpg', correct: '오렌지', name: '오렌지' },
    { image: '../Images/watermelon.jpg', correct: '수박', name: '수박' }
];

// 효과음 객체 생성
const sounds = {
    perfect: new Audio('../Audio/Sounds/perfect.wav'),  // 만점 축하 효과음
    fail: new Audio('../Audio/Sounds/fail.wav')         // 실망 효과음
};

// 음악 재생 상태 관리
let isMusicPlaying = false; // 초기값을 false로 설정

// 효과음 로드 확인
sounds.perfect.addEventListener('error', (e) => {
    console.error('Perfect sound failed to load:', e);
});

sounds.fail.addEventListener('error', (e) => {
    console.error('Fail sound failed to load:', e);
});

// 음악 알림 표시
function showMusicNotification() {
    const notification = document.getElementById('music-notification');
    notification.style.display = 'block';
    // 5초 후 알림 자동 숨김
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// 배경음악 재생 함수
async function playBackgroundMusic() {
    try {
        // 이미 재생 중이면 중복 재생 방지
        if (isMusicPlaying) return;

        // 재생 시도
        await sounds.bgm.play();
        isMusicPlaying = true;
        updateMusicButton();
        
        // 알림이 표시되어 있다면 숨김
        const notification = document.getElementById('music-notification');
        notification.style.display = 'none';
    } catch (error) {
        console.error('Background music playback failed:', error);
        isMusicPlaying = false;
        updateMusicButton();
        showMusicNotification();
    }
}

// 배경음악 일시정지 함수
function pauseBackgroundMusic() {
    if (!isMusicPlaying) return;
    
    sounds.bgm.pause();
    isMusicPlaying = false;
    updateMusicButton();
}

// 음악 버튼 상태 업데이트
function updateMusicButton() {
    const musicBtn = document.getElementById('music-toggle');
    if (isMusicPlaying) {
        musicBtn.textContent = '🔇 배경음악 정지';
        musicBtn.classList.add('playing');
    } else {
        musicBtn.textContent = '🎵 배경음악 재생';
        musicBtn.classList.remove('playing');
    }
}

// 결과 효과음 재생 함수
async function playResultSound(isPerfect) {
    // 결과 효과음 재생
    const resultSound = isPerfect ? sounds.perfect : sounds.fail;
    try {
        await resultSound.play();
    } catch (error) {
        console.error('Result sound playback failed:', error);
    }
}

// 게임 상태 관리
let currentQuestion = 0;
let score = 0;
let userAnswers = []; // 사용자의 답변 기록

// DOM 요소
const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const resultContainer = document.getElementById('result-container');
const fruitImage = document.getElementById('fruit-image');
const submitBtn = document.getElementById('submit-btn');
const resultMessage = document.getElementById('result-message');

// 현재 문제 표시
function showQuestion() {
    // 현재 과일 이미지 표시
    fruitImage.src = fruits[currentQuestion].image;
    fruitImage.alt = `${fruits[currentQuestion].name} 이미지`;

    // 라디오 버튼 초기화
    document.querySelectorAll('input[name="fruit"]').forEach(radio => {
        radio.checked = false;
    });

    // 문제 컨테이너 표시
    questionContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    submitBtn.style.display = 'block';

    // 현재 문제 번호 표시
    const questionNumber = document.createElement('div');
    questionNumber.style.textAlign = 'center';
    questionNumber.style.marginBottom = '10px';
    questionNumber.style.fontSize = '18px';
    questionNumber.style.fontWeight = 'bold';
    questionNumber.textContent = `${currentQuestion + 1}번째 과일`;
    
    // 이미 존재하는 번호 표시 제거
    const existingNumber = questionContainer.querySelector('.question-number');
    if (existingNumber) {
        existingNumber.remove();
    }
    
    questionNumber.className = 'question-number';
    questionContainer.insertBefore(questionNumber, fruitImage);
}

// 결과 표시 함수
function showResults() {
    // 결과 효과음 재생
    playResultSound(score === fruits.length);

    // 결과 메시지 생성
    let resultHTML = `
        <div class="result-summary" style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">
            ${score === fruits.length ? 
                '🎉 축하합니다! 모든 과일을 맞추셨습니다! 👏' : 
                `총 5개 중 ${score}개 맞았습니다!`}
        </div>
        <div class="result-details" style="text-align: left; margin: 0 auto; max-width: 400px;">
            <h3 style="margin-bottom: 15px;">상세 결과</h3>
    `;

    // 각 과일별 결과 표시
    fruits.forEach((fruit, index) => {
        const isCorrect = userAnswers[index] === fruit.correct;
        const resultClass = isCorrect ? 'correct' : 'incorrect';
        const resultIcon = isCorrect ? '✅' : '❌';
        
        resultHTML += `
            <div class="result-item" style="margin: 10px 0; padding: 10px; border-radius: 5px; background-color: ${isCorrect ? '#e8f5e9' : '#ffebee'};">
                <span style="font-size: 20px; margin-right: 10px;">${resultIcon}</span>
                <span style="font-weight: bold;">${fruit.name}</span>
                <span style="margin-left: 10px;">
                    ${isCorrect ? 
                        '정답입니다!' : 
                        `틀렸습니다. (정답: ${fruit.correct}, 선택: ${userAnswers[index]})`}
                </span>
            </div>
        `;
    });

    resultHTML += '</div>';
    resultMessage.innerHTML = resultHTML;
}

// 답변 제출 처리
submitBtn.addEventListener('click', () => {
    const selectedOption = document.querySelector('input[name="fruit"]:checked');
    
    if (!selectedOption) {
        alert('과일 이름을 선택해주세요!');
        return;
    }

    // 사용자의 답변 저장
    userAnswers[currentQuestion] = selectedOption.value;

    // 정답 확인
    const isCorrect = selectedOption.value === fruits[currentQuestion].correct;
    if (isCorrect) {
        score++;
    }

    // 다음 문제로 이동
    currentQuestion++;

    if (currentQuestion < fruits.length) {
        // 잠시 후 다음 문제 표시
        setTimeout(() => {
            showQuestion();
        }, 500);
    } else {
        // 모든 문제 완료
        questionContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        showResults();
        
        // 5초 후 게임 리셋
        setTimeout(() => {
            currentQuestion = 0;
            score = 0;
            userAnswers = [];
            showQuestion();
        }, 5000);
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    showQuestion();
});

// 페이지를 벗어날 때 배경음악 정지
window.addEventListener('beforeunload', () => {
    if (isMusicPlaying) {
        pauseBackgroundMusic();
    }
}); 