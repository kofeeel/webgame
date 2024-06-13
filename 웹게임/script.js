document.addEventListener('DOMContentLoaded', function () {
    var gameBoard = document.getElementById('game-board');
    var highScoreDisplay = document.getElementById('high-score');
    var currentScoreDisplay = document.getElementById('current-score');
    var timerDisplay = document.getElementById('timer');
    var stageDisplay = document.getElementById('stage');
    var pauseButton = document.getElementById('pause-button');
    var feverModeDisplay = document.getElementById('fever-mode');
    var feverCharacter = document.getElementById('fever-character');
    var clickSound = document.getElementById('click-sound');
    var feverSound = document.getElementById('fever-sound');
    var timer60Sound = document.getElementById('timer-60-sound');
    var timer30Sound = document.getElementById('timer-30-sound');
    var gameOverSound = document.getElementById('game-over-sound');
    var firstBloodSound = document.getElementById('first-blood-sound');
    var doubleKillSound = document.getElementById('double-kill-sound');
    var tripleKillSound = document.getElementById('triple-kill-sound');
    var quadraKillSound = document.getElementById('quadra-kill-sound');
    var pentaKillSound = document.getElementById('penta-kill-sound');
    var bgm = document.getElementById('bgm');
    var cards = [];
    var flippedCards = [];
    var matchedPairs = 0;
    var currentScore = 0;
    var highScore = 0;
    var timer = 300; // 5분 = 300초
    var stage = 1;
    var gamePaused = false;
    var consecutiveMatches = 0;
    var allImages = [
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
        cards.forEach(function (card) {
            gameBoard.appendChild(createCardElement(card));
        });
        resetGame();
    }
    function generateCards() {
        var selectedImages = shuffleArray(allImages).slice(0, 8);
        var cardSet = selectedImages.concat(selectedImages); // 이미지를 두 번 반복하여 카드 쌍을 만듦
        return shuffleArray(cardSet.map(function (image, index) { return ({
            id: index,
            image: image,
            flipped: false
        }); }));
    }
    function shuffleArray(array) {
        var _a;
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
        }
        return array;
    }
    function createCardElement(card) {
        var cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id.toString();
        cardElement.addEventListener('click', function () { return flipCard(card); });
        if (card.flipped) {
            cardElement.style.backgroundImage = "url(".concat(card.image, ")");
        }
        return cardElement;
    }
    function flipCard(card) {
        if (gamePaused || card.flipped || flippedCards.length === 2)
            return;
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
            }
            else if (consecutiveMatches === 2) {
                doubleKillSound.play();
            }
            else if (consecutiveMatches === 3) {
                tripleKillSound.play();
            }
            else if (consecutiveMatches === 4) {
                quadraKillSound.play();
            }
            else if (consecutiveMatches === 5) {
                pentaKillSound.play();
            }
            if (matchedPairs === cards.length / 2) {
                setTimeout(nextStage, 1000);
            }
        }
        else {
            consecutiveMatches = 0;
            setTimeout(function () {
                flippedCards.forEach(function (card) { return card.flipped = false; });
                flippedCards = [];
                renderCards();
                feverModeEnd();
            }, 1000);
        }
        updateScore();
    }
    function renderCards() {
        gameBoard.childNodes.forEach(function (cardElement, index) {
            var card = cards[index];
            var element = cardElement;
            if (card.flipped) {
                element.style.backgroundImage = "url(".concat(card.image, ")");
                element.style.backgroundColor = '#fff';
                element.style.border = '1px solid #000';
            }
            else {
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
        var timerInterval = setInterval(function () {
            if (gamePaused)
                return;
            timer--;
            timerDisplay.textContent = timer.toString();
            if (timer === 60) {
                timer60Sound.play();
            }
            else if (timer === 30) {
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
        cards.forEach(function (card) {
            gameBoard.appendChild(createCardElement(card));
        });
        renderCards();
    }
    function feverMode() {
        feverModeDisplay.classList.add('fever-active');
        feverCharacter.classList.add('fever-active');
        feverCharacter.style.transform = "scale(".concat(1 + consecutiveMatches * 0.1, ")"); // 연속 맞춤 수에 따라 크기 조절
    }
    function feverModeEnd() {
        feverModeDisplay.classList.remove('fever-active');
        feverCharacter.classList.remove('fever-active');
        feverCharacter.style.transform = 'scale(1)';
    }
    function playFeverSound() {
        feverSound.play();
    }
    pauseButton.addEventListener('click', function () {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? '재개' : '일시정지';
    });
    // 게임 초기화 실행
    initGame();
});
