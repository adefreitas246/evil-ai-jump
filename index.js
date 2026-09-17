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

function randomSpawnInterval() {
    return 70 + Math.floor(Math.random() * 60);
}

function characterMovement() {
    character = document.getElementById('character');
    baseTop = character.offsetTop;

    document.addEventListener('keydown', (event) => {
        if (gameOver) {
            resetGame();
            return;
        }
        if ((event.key === 'ArrowUp' || event.code === 'Space') && !isJumping) {
            event.preventDefault();
            velocityY = JUMP_FORCE;
            isJumping = true;
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
    obstacle.style.width = `${size}px`;
    obstacle.style.height = `${size}px`;
    obstacle.style.left = `${gameArea.offsetWidth}px`;
    obstacle.style.top = `${GROUND_Y - size}px`;
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
