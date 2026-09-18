// Game settings
// Get the parts of the page we need.
const gameArea = document.getElementById("gameArea");
const character = document.getElementById("character");
const scoreDisplay = document.getElementById("score");
const gameOverMessage = document.getElementById("gameOverMessage");

// Game settings
const GROUND_Y = 240;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const OBSTACLE_SPEED = 5;
const startTop = character.offsetTop;

// These values change as we play.
let score = 0;
let jumpSpeed = 0;
let isJumping = false;
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

// Space and Up Arrow control the game.
document.addEventListener("keydown", function (event) {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    if (event.repeat) {
      return;
    }

    if (gameOver) {
      resetGame();
    } else if (!isJumping) {
      jumpSpeed = JUMP_FORCE;
      isJumping = true;
    }
  }
});
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

// Move the character up, then bring it down.
function applyGravity() {
  if (isJumping) {
    jumpSpeed = jumpSpeed + GRAVITY;
    let newTop = character.offsetTop + jumpSpeed;

    if (newTop >= startTop) {
      newTop = startTop;
      jumpSpeed = 0;
      isJumping = false;
    }

    character.style.top = newTop + "px";
  }
}

function updateScore() {
  scoreDisplay.textContent = "Score: " + score;
}

// Choose how many updates to wait before the next obstacle.
function randomSpawnInterval() {
  return 70 + Math.floor(Math.random() * 60);
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

// Add a new obstacle when the counter reaches its target.
function generateObstacles() {
  spawnTimer = spawnTimer + 1;

  if (spawnTimer >= nextSpawnFrame) {
    const obstacle = document.createElement("div");
    const size = 20 + Math.random() * 30;

    obstacle.className = "obstacle";
    obstacle.style.width = size + "px";
    obstacle.style.height = size + "px";
    obstacle.style.left = gameArea.offsetWidth + "px";
    obstacle.style.top = (GROUND_Y - size) + "px";
    gameArea.appendChild(obstacle);

    spawnTimer = 0;
    nextSpawnFrame = randomSpawnInterval();
  }
}

// Move each obstacle left and score when it leaves the screen.
function obstacleMovement() {
  const obstacles = document.querySelectorAll(".obstacle");

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    const newLeft = parseFloat(obstacle.style.left) - OBSTACLE_SPEED;
    obstacle.style.left = newLeft + "px";

    if (newLeft + obstacle.offsetWidth < 0) {
      obstacle.remove();
      score = score + 1;
      updateScore();
    }
  }
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

// Check whether the character overlaps an obstacle.
function collisionDetection() {
  const playerBox = character.getBoundingClientRect();
  const obstacles = document.querySelectorAll(".obstacle");

  for (let i = 0; i < obstacles.length; i++) {
    const obstacleBox = obstacles[i].getBoundingClientRect();

    if (
      playerBox.left < obstacleBox.right &&
      playerBox.right > obstacleBox.left &&
      playerBox.top < obstacleBox.bottom &&
      playerBox.bottom > obstacleBox.top
    ) {
      endGame();
      return;
    }
  }
}

function endGame() {
  gameOver = true;
  gameOverMessage.textContent =
    "Game Over! Score: " + score + " - press Space or Up Arrow to restart.";
  gameOverMessage.style.display = "block";
    gameOver = true;
    playGameOverSound();
    stopBackgroundSound();
    const gameOverEl = document.getElementById('gameOverMessage');
    if (gameOverEl) {
        gameOverEl.textContent = `Game Over! Score: ${score} — press Space to restart`;
        gameOverEl.style.display = 'block';
    }
}

// Remove the obstacles and put everything back at the start.
function resetGame() {
  const obstacles = document.querySelectorAll(".obstacle");

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].remove();
  }

  score = 0;
  jumpSpeed = 0;
  isJumping = false;
  spawnTimer = 0;
  nextSpawnFrame = randomSpawnInterval();
  character.style.top = startTop + "px";
  gameOverMessage.style.display = "none";
  gameOver = false;
  updateScore();
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

// Keep updating the game while it is being played.
function gameLoop() {
  if (!gameOver) {
    applyGravity();
    obstacleMovement();
    generateObstacles();
    collisionDetection();
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
