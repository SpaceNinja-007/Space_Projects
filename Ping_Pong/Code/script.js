const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleHeight = 80, paddleWidth = 12, ballSize = 12;
const leftPaddle = { x: 10, y: canvas.height/2 - paddleHeight/2, speed: 0 };
const rightPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height/2 - paddleHeight/2, speed: 0, ai: true };
const ball = { x: canvas.width/2, y: canvas.height/2, vx: 5, vy: 2, size: ballSize };

let leftScore = 0, rightScore = 0;

function drawRect(x, y, w, h, color='#fff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color='#fff') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y) {
  ctx.fillStyle = '#fff';
  ctx.font = '36px Arial';
  ctx.fillText(text, x, y);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = -ball.vx;
  ball.vy = (Math.random() - 0.5) * 6;
}

function update() {
  // Move paddles
  leftPaddle.y += leftPaddle.speed;

  // AI for right paddle (Player 2, Red)
  if (rightPaddle.ai) {
    // Simple AI: move towards the ball, with max speed
    const centerPaddle = rightPaddle.y + paddleHeight / 2;
    if (centerPaddle < ball.y) {
      rightPaddle.speed = 4;
    } else if (centerPaddle > ball.y + ball.size) {
      rightPaddle.speed = -4;
    } else {
      rightPaddle.speed = 0;
    }
    rightPaddle.y += rightPaddle.speed;
  } else {
    rightPaddle.y += rightPaddle.speed;
  }

  // Prevent paddles from going out of bounds
  leftPaddle.y = Math.max(Math.min(leftPaddle.y, canvas.height - paddleHeight), 0);
  rightPaddle.y = Math.max(Math.min(rightPaddle.y, canvas.height - paddleHeight), 0);

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom collision
  if (ball.y < 0 || ball.y > canvas.height - ball.size) ball.vy *= -1;

  // Paddle collision
  // Left paddle (Player 1, Green)
  if (ball.x < leftPaddle.x + paddleWidth &&
      ball.y + ball.size > leftPaddle.y &&
      ball.y < leftPaddle.y + paddleHeight) {
    ball.vx *= -1.1;
    ball.x = leftPaddle.x + paddleWidth;
  }
  // Right paddle (Player 2, Red)
  if (ball.x + ball.size > rightPaddle.x &&
      ball.y + ball.size > rightPaddle.y &&
      ball.y < rightPaddle.y + paddleHeight) {
    ball.vx *= -1.1;
    ball.x = rightPaddle.x - ball.size;
  }

  // Score
  if (ball.x < 0) {
    rightScore++;
    resetBall();
  }
  if (ball.x > canvas.width - ball.size) {
    leftScore++;
    resetBall();
  }
}

function render() {
  // Clear
  drawRect(0, 0, canvas.width, canvas.height, '#222');

  // Net
  for (let i = 10; i < canvas.height; i += 30) {
    drawRect(canvas.width/2 - 2, i, 4, 20, '#fff8');
  }

  // Paddles
  drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, '#0f0'); // Green
  drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, '#f00'); // Red

  // Ball
  drawCircle(ball.x + ball.size/2, ball.y + ball.size/2, ball.size/2);

  // Score
  drawText(leftScore, canvas.width/4, 50);
  drawText(rightScore, 3*canvas.width/4, 50);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Controls for left paddle (Player 1, Green)
window.addEventListener('keydown', e => {
  switch (e.key) {
    // Left paddle: W/S or ArrowUp/ArrowDown
    case 'w':
    case 'W':
    case 'ArrowUp':
      leftPaddle.speed = -6;
      break;
    case 's':
    case 'S':
    case 'ArrowDown':
      leftPaddle.speed = 6;
      break;
  }
});
window.addEventListener('keyup', e => {
  switch (e.key) {
    case 'w':
    case 'W':
    case 's':
    case 'S':
    case 'ArrowUp':
    case 'ArrowDown':
      leftPaddle.speed = 0;
      break;
  }
});

gameLoop();
