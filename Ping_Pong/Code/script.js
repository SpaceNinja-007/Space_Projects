// SpaceNinja Pong - SVG Failsafe & Pro Bamboo Handle

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pong');
  const ctx = canvas.getContext('2d');

  // Game objects
  const paddleHeight = 80, paddleWidth = 12, ballSize = 32;
  const leftPaddle = { x: 10, y: canvas.height/2 - paddleHeight/2, speed: 0 };
  const rightPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height/2 - paddleHeight/2, speed: 0, ai: true };
  const ball = { x: canvas.width/2, y: canvas.height/2, vx: 5, vy: 2, size: ballSize, angle: 0 };

  let leftScore = 0, rightScore = 0;

  // Ball speed cap
  const MAX_BALL_SPEED = 12;
  function capBallSpeed() {
    if (Math.abs(ball.vx) > MAX_BALL_SPEED) {
      ball.vx = MAX_BALL_SPEED * Math.sign(ball.vx);
    }
    if (Math.abs(ball.vy) > MAX_BALL_SPEED) {
      ball.vy = MAX_BALL_SPEED * Math.sign(ball.vy);
    }
  }

  // Load images with robust failsafe
  const shurikenImg = new Image();
  const bambooImg = new Image();
  let imagesToLoad = 2, imagesLoaded = 0, started = false;
  function tryStart() {
    imagesLoaded++;
    if (!started && imagesLoaded >= imagesToLoad) {
      started = true;
      gameLoop();
    }
  }

  // Attach event handlers before setting src
  shurikenImg.onload = tryStart;
  shurikenImg.onerror = tryStart;
  bambooImg.onload = tryStart;
  bambooImg.onerror = tryStart;

  shurikenImg.src = 'Assets/Ninja-star.svg';
  bambooImg.src = 'Assets/Bamboo.svg';

  // If already cached, manually fire onload once event handlers are set
  if (shurikenImg.complete) shurikenImg.onload();
  if (bambooImg.complete) bambooImg.onload();

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

  // Pro: Bamboo paddle with handle, always draws even if SVG fails!
  function drawBambooPaddle(x, y, width, height, flip = false) {
    // Draw the bamboo handle first
    ctx.save();
    ctx.fillStyle = '#deb887'; // Bamboo tan
    ctx.strokeStyle = '#a87b3a'; // Outline
    ctx.lineWidth = 2;

    const handleLength = 20;
    const handleRadius = width / 1.5;

    if (!flip) {
      // Left paddle: handle on the left
      ctx.beginPath();
      ctx.arc(x - handleLength / 2, y + height / 2, handleRadius, Math.PI / 2, Math.PI * 1.5, false);
      ctx.rect(x - handleLength, y + height * 0.15, handleLength, height * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Bamboo node detail
      ctx.beginPath();
      ctx.moveTo(x - handleLength + 4, y + height * 0.25);
      ctx.lineTo(x - 2, y + height * 0.25);
      ctx.strokeStyle = '#c2a16d';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Right paddle: handle on the right
      ctx.beginPath();
      ctx.arc(x + width + handleLength / 2, y + height / 2, handleRadius, Math.PI * 1.5, Math.PI / 2, false);
      ctx.rect(x + width, y + height * 0.15, handleLength, height * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Bamboo node detail
      ctx.beginPath();
      ctx.moveTo(x + width + 2, y + height * 0.75);
      ctx.lineTo(x + width + handleLength - 4, y + height * 0.75);
      ctx.strokeStyle = '#c2a16d';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();

    // Then draw the paddle image or fallback
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
    ball.vx = 5 * (Math.random() > 0.5 ? 1 : -1); // Reset to initial speed and random direction
    ball.vy = (Math.random() - 0.5) * 6;
    ball.angle = 0;
  }

  function update() {
    leftPaddle.y += leftPaddle.speed;

    // AI for right paddle
   if (rightPaddle.ai) {
  const centerPaddle = rightPaddle.y + paddleHeight / 2;
  if (centerPaddle < ball.y) {
    rightPaddle.speed = 2;   // <-- AI speed here
  } else if (centerPaddle > ball.y + ball.size) {
    rightPaddle.speed = -4;
  } else {
    rightPaddle.speed = 0;
  }
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

    // Paddle collision with speed cap
    let collision = false;
    if (
      ball.x < leftPaddle.x + paddleWidth &&
      ball.y + ball.size > leftPaddle.y &&
      ball.y < leftPaddle.y + paddleHeight
    ) {
      ball.vx *= -1.1;
      ball.x = leftPaddle.x + paddleWidth;
      collision = true;
    }
    if (
      ball.x + ball.size > rightPaddle.x &&
      ball.y + ball.size > rightPaddle.y &&
      ball.y < rightPaddle.y + paddleHeight
    ) {
      ball.vx *= -1.1;
      ball.x = rightPaddle.x - ball.size;
      collision = true;
    }
    if (collision) capBallSpeed();

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

  // Pro Tip: Use console.log(bambooImg, shurikenImg) to debug image loading!
  //          If your SVGs don't appear, check file names and paths (case sensitive!).
});
