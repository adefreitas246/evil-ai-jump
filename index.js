const GROUND_Y = 240;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const OBSTACLE_SPEED = 5;

let gameArea, character;
let velocityY = 0;
let isJumping = false;
let baseTop = 0;
let gameOver = false;
let spawnTimer = 0;
let nextSpawnFrame = randomSpawnInterval();
let frame = 0;
let score = 0;
let audioCtx = null;
let musicStarted = false;
 
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}
 
function playTone(freq, duration, type = 'sine', volume = 0.15) {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
}
 
function playJumpSound() {
    playTone(520, 0.12, 'square');
}
 
function playScoreSound() {
    playTone(880, 0.1, 'triangle');
}
 
function playGameOverSound() {
    playTone(160, 0.4, 'sawtooth');
}
 
function playStartSound() {
    const ctx = getAudioCtx();
    [440, 660, 880].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'sine'), i * 90);
    });
}
 
const MELODY = [
    262, 330, 392, 330, 294, 392, 440, 392,
    262, 330, 392, 494, 440, 392, 330, 294
];
const NOTE_SECONDS = 0.2;
let musicPlaying = false;
let musicTimeoutId = null;
 
function startBackgroundSound() {
    if (musicPlaying) return;
    musicPlaying = true;
    let step = 0;
 
    const playStep = () => {
        if (!musicPlaying) return;
        playTone(MELODY[step % MELODY.length], NOTE_SECONDS * 0.85, 'triangle', 0.05);
        step++;
        musicTimeoutId = setTimeout(playStep, NOTE_SECONDS * 1000);
    };
 
    playStep();
}
 
function stopBackgroundSound() {
    musicPlaying = false;
    if (musicTimeoutId) clearTimeout(musicTimeoutId);
    musicTimeoutId = null;
}

function randomSpawnInterval() {
    return 70 + Math.floor(Math.random() * 60);
}

function characterMovement() {
    character = document.getElementById('character');
    baseTop = character.offsetTop;
 
    const startOverlay = document.getElementById('startOverlay');
 
    const beginAudio = () => {
        if (musicStarted) return;
        musicStarted = true;
        const ctx = getAudioCtx();
        const start = () => {
            playStartSound();
            startBackgroundSound();
        };
        if (ctx.state === 'suspended') {
            ctx.resume().then(start);
        } else {
            start();
        }
        if (startOverlay) startOverlay.style.display = 'none';
    };
 
    if (startOverlay) startOverlay.addEventListener('click', beginAudio);
 
    document.addEventListener('keydown', (event) => {
        beginAudio();
 
        if (gameOver) {
            resetGame();
            return;
        }
        if ((event.key === 'ArrowUp' || event.code === 'Space') && !isJumping) {
            event.preventDefault();
            velocityY = JUMP_FORCE;
            isJumping = true;
            character.classList.add('jumping');
            playJumpSound();
        }
    });
}

function applyGravity() {
    if (!isJumping) return;

    velocityY += GRAVITY;
    const newTop = character.offsetTop + velocityY;

    if (newTop >= baseTop) {
        character.style.top = `${baseTop}px`;
        velocityY = 0;
        isJumping = false;
    } else {
        character.style.top = `${newTop}px`;
    }
}

function obstacleMovement() {
    const obstacles = document.querySelectorAll('.obstacle');

    obstacles.forEach((obstacle) => {
        const left = parseFloat(obstacle.style.left) || 0;
        const newLeft = left - OBSTACLE_SPEED;
        obstacle.style.left = `${newLeft}px`;

        if (newLeft + obstacle.offsetWidth < 0) {
            obstacle.remove();
            score++;
            playScoreSound();
            const scoreEl = document.getElementById('score');
            if (scoreEl) scoreEl.textContent = `Score: ${score}`;
        }
    });
}

function generateObstacles() {
    gameArea = document.getElementById('gameArea');

    spawnTimer++;
    if (spawnTimer < nextSpawnFrame) return;

    spawnTimer = 0;
    nextSpawnFrame = randomSpawnInterval();

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    const size = 20 + Math.random() * 30;
    const floatOffset = Math.random() < 0.35 ? Math.floor(Math.random() * 25) : 0;
    obstacle.style.width = `${size}px`;
    obstacle.style.height = `${size}px`;
    obstacle.style.left = `${gameArea.offsetWidth}px`;
    obstacle.style.top = `${GROUND_Y - size - floatOffset}px`;
    gameArea.appendChild(obstacle);
}

function collisionDetection() {
    const characterRect = character.getBoundingClientRect();
    const obstacles = document.querySelectorAll('.obstacle');

    obstacles.forEach((obstacle) => {
        const obstacleRect = obstacle.getBoundingClientRect();
        if (characterRect.left < obstacleRect.right &&
            characterRect.right > obstacleRect.left &&
            characterRect.top < obstacleRect.bottom &&
            characterRect.bottom > obstacleRect.top) {
            endGame();
        }
    });
}

function endGame() {
    gameOver = true;
    playGameOverSound();
    stopBackgroundSound();
    const gameOverEl = document.getElementById('gameOverMessage');
    if (gameOverEl) {
        gameOverEl.textContent = `Game Over! Score: ${score} — press Space to restart`;
        gameOverEl.style.display = 'block';
    }
}

function resetGame() {
    document.querySelectorAll('.obstacle').forEach((el) => el.remove());
    score = 0;
    frame = 0;
    spawnTimer = 0;
    nextSpawnFrame = randomSpawnInterval();
    velocityY = 0;
    isJumping = false;
    character.style.top = `${baseTop}px`;
    gameOver = false;
    startBackgroundSound();

    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = 'Score: 0';
    const gameOverEl = document.getElementById('gameOverMessage');
    if (gameOverEl) gameOverEl.style.display = 'none';

    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (gameOver) return;

    frame++;
    applyGravity();
    obstacleMovement();
    generateObstacles();
    collisionDetection();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', () => {
    characterMovement();
    requestAnimationFrame(gameLoop);
});
