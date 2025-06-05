document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pong');
  const ctx = canvas.getContext('2d');

  // Game objects
  const paddleHeight = 80, paddleWidth = 12, ballSize = 32;
  const leftPaddle = { x: 10, y: canvas.height/2 - paddleHeight/2, speed: 0 };
  const rightPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height/2 - paddleHeight/2, speed: 0, ai: true };
  const ball = { x: canvas.width/2, y: canvas.height/2, vx: 5, vy: 2, size: ballSize, angle: 0 };

  let leftScore = 0, rightScore = 0;

  // Load the ninja star image
  const shurikenImg = new Image();
  shurikenImg.src = 'Ninja-star.svg';

  // Load the bamboo paddle image
  const bambooImg = new Image();
  bambooImg.src = 'Bamboo.svg';

  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawCircle(x, y, r, color = '#fff') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawBall(ctx, x, y, size, angle) {
    if (shurikenImg.complete && shurikenImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(x + size/2, y + size/2);
      ctx.rotate(angle);
      ctx.drawImage(shurikenImg, -size/2, -size/2, size, size);
      ctx.restore();
    } else {
      drawCircle(x + size/2, y + size/2, size/2, '#fff');
    }
  }

  function drawBambooPaddle(x, y, width, height, flip = false) {
    if (bambooImg.complete && bambooImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      if (flip) ctx.scale(-1, 1); // Flip for right paddle
      ctx.drawImage(bambooImg, -width, -height / 2, width * 2, height);
      ctx.restore();
    } else {
      // fallback: green for left, red for right
      drawRect(x, y, width, height, flip ? '#f00' : '#0f0');
    }
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
    ball.angle = 0;
  }

  function update() {
    leftPaddle.y += leftPaddle.speed;

    // AI for right paddle
    if (rightPaddle.ai) {
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

    leftPaddle.y = Math.max(Math.min(leftPaddle.y, canvas.height - paddleHeight), 0);
    rightPaddle.y = Math.max(Math.min(rightPaddle.y, canvas.height - paddleHeight), 0);

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.angle += 0.25;

    // Top/bottom collision
    if (ball.y < 0 || ball.y > canvas.height - ball.size) ball.vy *= -1;

    // Paddle collision
    if (
      ball.x < leftPaddle.x + paddleWidth &&
      ball.y + ball.size > leftPaddle.y &&
      ball.y < leftPaddle.y + paddleHeight
    ) {
      ball.vx *= -1.1;
      ball.x = leftPaddle.x + paddleWidth;
    }
    if (
      ball.x + ball.size > rightPaddle.x &&
      ball.y + ball.size > rightPaddle.y &&
      ball.y < rightPaddle.y + paddleHeight
    ) {
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
    drawRect(0, 0, canvas.width, canvas.height, '#222');

    // Net
    for (let i = 10; i < canvas.height; i += 30) {
      drawRect(canvas.width/2 - 2, i, 4, 20, '#fff8');
    }

    // Both paddles are now epic bamboo!
    drawBambooPaddle(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, false);
    drawBambooPaddle(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, true);

    // Ball (spinning ninja star)
    drawBall(ctx, ball.x, ball.y, ball.size, ball.angle);

    // Score
    drawText(leftScore, canvas.width/4, 50);
    drawText(rightScore, 3*canvas.width/4, 50);
  }

  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener('keydown', e => {
    switch (e.key) {
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

  // Wait for both images to load before starting
  let imagesLoaded = 0;
  function tryStart() {
    imagesLoaded++;
    if (imagesLoaded >= 2) gameLoop();
  }
  shurikenImg.onload = tryStart;
  bambooImg.onload = tryStart;
  if (shurikenImg.complete) tryStart();
  if (bambooImg.complete) tryStart();
});
