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
