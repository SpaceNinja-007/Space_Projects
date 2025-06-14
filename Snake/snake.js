const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // Size of one cell
const rows = canvas.width / box;

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = 'RIGHT';
let food = spawnFood();
let score = 0;
let gameOver = false;

// Listen for keyboard input
document.addEventListener('keydown', keyDown);

function keyDown(e) {
  switch (e.key) {
    case 'ArrowLeft':
      if (direction !== 'RIGHT') direction = 'LEFT';
      break;
    case 'ArrowUp':
      if (direction !== 'DOWN') direction = 'UP';
      break;
    case 'ArrowRight':
      if (direction !== 'LEFT') direction = 'RIGHT';
      break;
    case 'ArrowDown':
      if (direction !== 'UP') direction = 'DOWN';
      break;
  }
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * rows) * box,
    y: Math.floor(Math.random() * rows) * box,
  };
}

function draw() {
  // Background
  ctx.fillStyle = '#242a38';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#44ff99' : '#3be081';
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = '#181824';
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = '#ff4466';
  ctx.fillRect(food.x, food.y, box, box);

  // Draw score
  document.getElementById('score').textContent = 'Score: ' + score;
}

function collision(head, arr) {
  for (let cell of arr) {
    if (head.x === cell.x && head.y === cell.y) return true;
  }
  return false;
}

function update() {
  if (gameOver) return;

  // Move snake
  let head = { ...snake[0] };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Check wall collision
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    collision(head, snake)
  ) {
    gameOver = true;
    setTimeout(() => {
      alert('Game Over!\nFinal Score: ' + score + '\nReload to play again!');
    }, 200);
    return;
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

function loop() {
  update();
  draw();
  if (!gameOver) setTimeout(loop, 100);
}

loop();
