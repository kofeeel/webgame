document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board') as HTMLDivElement;
    const highScoreDisplay = document.getElementById('high-score') as HTMLSpanElement;
    const currentScoreDisplay = document.getElementById('current-score') as HTMLSpanElement;
    const timerDisplay = document.getElementById('timer') as HTMLSpanElement;
    const stageDisplay = document.getElementById('stage') as HTMLSpanElement;
    const pauseButton = document.getElementById('pause-button') as HTMLButtonElement;
    const feverModeDisplay = document.getElementById('fever-mode') as HTMLDivElement;
    const feverCharacter = document.getElementById('fever-character') as HTMLImageElement;
    const clickSound = document.getElementById('click-sound') as HTMLAudioElement;
    const feverSound = document.getElementById('fever-sound') as HTMLAudioElement;
    const timer60Sound = document.getElementById('timer-60-sound') as HTMLAudioElement;
    const timer30Sound = document.getElementById('timer-30-sound') as HTMLAudioElement;
    const gameOverSound = document.getElementById('game-over-sound') as HTMLAudioElement;
    const firstBloodSound = document.getElementById('first-blood-sound') as HTMLAudioElement;
    const doubleKillSound = document.getElementById('double-kill-sound') as HTMLAudioElement;
    const tripleKillSound = document.getElementById('triple-kill-sound') as HTMLAudioElement;
    const quadraKillSound = document.getElementById('quadra-kill-sound') as HTMLAudioElement;
    const pentaKillSound = document.getElementById('penta-kill-sound') as HTMLAudioElement;
    const bgm = document.getElementById('bgm') as HTMLAudioElement;

    let cards: Array<{ id: number, image: string, flipped: boolean }> = [];
    let flippedCards: Array<{ id: number, image: string, flipped: boolean }> = [];
    let matchedPairs = 0;
    let currentScore = 0;
    let highScore = 0;
    let timer = 300; // 5분 = 300초
    let stage = 1;
    let gamePaused = false;
    let consecutiveMatches = 0;

    const allImages = [
        'image/apple.png',
        'image/avocado.png',
        'image/bbanana.png',
        'image/dragonfruit.png',
        'image/grape.png',
        'image/kiwi.png',
        'image/lemon.png',
        'image/mango.png',
        'image/melon.png',
        'image/orange.png',
        'image/peach.png',
        'image/pear.png',
        'image/pineapple.png',
        'image/strawberry.png',
        'image/watermelon.png',
        'image/blueberries.png'
    ];

    function initGame() {
        cards = generateCards();
        gameBoard.innerHTML = '';
        cards.forEach(card => {
            gameBoard.appendChild(createCardElement(card));
        });
        resetGame();
    }

    function generateCards() {
        const selectedImages = shuffleArray(allImages).slice(0, 8);
        const cardSet = selectedImages.concat(selectedImages); // 이미지를 두 번 반복하여 카드 쌍을 만듦
        return shuffleArray(cardSet.map((image, index) => ({
            id: index,
            image,
            flipped: false
        })));
    }

    function shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createCardElement(card: { id: number, image: string, flipped: boolean }) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id.toString();
        cardElement.addEventListener('click', () => flipCard(card));
        if (card.flipped) {
            cardElement.style.backgroundImage = `url(${card.image})`;
        }
        return cardElement;
    }

    function flipCard(card: { id: number, image: string, flipped: boolean }) {
        if (gamePaused || card.flipped || flippedCards.length === 2) return;

        card.flipped = true;
        flippedCards.push(card);
        clickSound.play(); // 클릭 사운드 재생
        renderCards();

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }

    function checkMatch() {
        if (flippedCards[0].image === flippedCards[1].image) {
            matchedPairs++;
            consecutiveMatches++;
            currentScore += 10 * (consecutiveMatches > 1 ? 2 : 1);
            flippedCards = [];
            if (consecutiveMatches > 1) {
                feverMode();
                playFeverSound();
            }
            if (consecutiveMatches === 1) {
                firstBloodSound.play();
            } else if (consecutiveMatches === 2) {
                doubleKillSound.play();
            } else if (consecutiveMatches === 3) {
                tripleKillSound.play();
            } else if (consecutiveMatches === 4) {
                quadraKillSound.play();
            } else if (consecutiveMatches === 5) {
                pentaKillSound.play();
            }
            if (matchedPairs === cards.length / 2) {
                setTimeout(nextStage, 1000);
            }
        } else {
            consecutiveMatches = 0;
            setTimeout(() => {
                flippedCards.forEach(card => card.flipped = false);
                flippedCards = [];
                renderCards();
                feverModeEnd();
            }, 1000);
        }
        updateScore();
    }

    function renderCards() {
        gameBoard.childNodes.forEach((cardElement, index) => {
            const card = cards[index];
            const element = cardElement as HTMLElement;
            if (card.flipped) {
                element.style.backgroundImage = `url(${card.image})`;
                element.style.backgroundColor = '#fff';
                element.style.border = '1px solid #000';
            } else {
                element.style.backgroundImage = 'none';
                element.style.backgroundColor = '#000';
            }
        });
    }

    function updateScore() {
        currentScoreDisplay.textContent = currentScore.toString();
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreDisplay.textContent = highScore.toString();
        }
    }

    function resetGame() {
        matchedPairs = 0;
        currentScore = 0;
        timer = 300;
        gamePaused = false;
        stage = 1;
        consecutiveMatches = 0;
        feverModeEnd();
        stageDisplay.textContent = stage.toString();
        updateScore();
        startTimer();
        bgm.play();
    }

    function startTimer() {
        const timerInterval = setInterval(() => {
            if (gamePaused) return;
            timer--;
            timerDisplay.textContent = timer.toString();

            if (timer === 60) {
                timer60Sound.play();
            } else if (timer === 30) {
                timer30Sound.play();
            }

            if (timer === 0) {
                clearInterval(timerInterval);
                gameOverSound.play();
                alert('시간 초과! 게임이 종료되었습니다.');
                initGame();
            }
        }, 1000);
    }

    function nextStage() {
        stage++;
        stageDisplay.textContent = stage.toString();
        timer = Math.max(30, 300 - (stage - 1) * 30); // 각 스테이지마다 30초씩 줄어듦
        cards = generateCards();
        gameBoard.innerHTML = '';
        cards.forEach(card => {
            gameBoard.appendChild(createCardElement(card));
        });
        renderCards();
    }

    function feverMode() {
        feverModeDisplay.classList.add('fever-active');
        feverCharacter.classList.add('fever-active');
        feverCharacter.style.transform = `scale(${1 + consecutiveMatches * 0.1})`; // 연속 맞춤 수에 따라 크기 조절
    }

    function feverModeEnd() {
        feverModeDisplay.classList.remove('fever-active');
        feverCharacter.classList.remove('fever-active');
        feverCharacter.style.transform = 'scale(1)';
    }

    function playFeverSound() {
        feverSound.play();
    }

    pauseButton.addEventListener('click', () => {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? '재개' : '일시정지';
    });

    // 게임 초기화 실행
    initGame();
});
