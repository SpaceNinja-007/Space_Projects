// --- Spaceship Class ---
class Spaceship {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.radius = 20;
    this.velocity = {x: 0, y: 0};
    this.lives = 3;
    this.dead = false;
    this.respawnTimer = 0;
    this.invincibleTimer = 0;
  }
  rotate(dir) {
    this.angle += dir * 0.07;
  }
  thrust(forward) {
    const power = forward ? 0.1 : -0.05;
    this.velocity.x += Math.cos(this.angle) * power;
    this.velocity.y += Math.sin(this.angle) * power;
  }
  move() {
    if (this.dead) return;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.x = (this.x + 800) % 800;
    this.y = (this.y + 600) % 600;
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;
    if (this.invincibleTimer > 0) this.invincibleTimer--;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = this.invincibleTimer > 0 ? '#ff0' : '#0ff';
    ctx.globalAlpha = this.invincibleTimer > 0 ? 0.5 : 1;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, 12);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-15, -12);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Call when ship dies
  die() {
    // Use dev-mode aware loseLife function!
    if (typeof window.loseLife === 'function') {
      window.loseLife();
    } else {
      this.lives--;
    }
    this.dead = true;
    this.respawnTimer = 90; // 1.5 seconds at 60fps
    explosions.push(new Explosion(this.x, this.y, {color: '#fff', amount: 30, radius: this.radius}));
  }
  // Call in game loop to handle respawn
  updateRespawn() {
    if (this.dead) {
      this.respawnTimer--;
      if (this.respawnTimer <= 0) {
        if (this.lives > 0) {
          this.x = this.startX;
          this.y = this.startY;
          this.velocity = {x: 0, y: 0};
          this.dead = false;
          this.invincibleTimer = 90; // invincible for 1.5 sec
        }
      }
    }
  }
}

// --- Asteroid Class ---
class Asteroid {
  constructor(x, y, radius, speed, angle) {
    this.x = x;
    this.y = y;
    this.radius = radius || (20 + Math.random() * 30);
    this.speed = speed || (1 + Math.random() * 2);
    this.angle = angle || Math.random() * Math.PI * 2;
    this.vertices = [];
    for (let i = 0; i < 7; i++) {
      this.vertices.push(0.8 + Math.random() * 0.4);
    }
  }
  move() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.x = (this.x + 800) % 800;
    this.y = (this.y + 600) % 600;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    for (let i = 0; i < this.vertices.length; i++) {
      const angle = (i / this.vertices.length) * Math.PI * 2;
      const r = this.radius * this.vertices[i];
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// --- Missile Class ---
class Missile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.radius = 2;
    this.angle = angle;
    this.speed = 8;
    this.life = 60; // frames
  }
  move() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.x = (this.x + 800) % 800;
    this.y = (this.y + 600) % 600;
    this.life--;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();
    ctx.restore();
  }
}

// --- Explosion Class ---
class Explosion {
  constructor(x, y, opts = {}) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.amount = opts.amount || 20;
    this.color = opts.color || "orange";
    this.radius = opts.radius || 20;
    this.life = opts.life || 30; // frames
    for (let i = 0; i < this.amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2 + 1) * (this.radius / 20);
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: Math.random() * this.life * 0.5 + this.life * 0.5,
        maxLife: this.life,
        color: this.color
      });
    }
  }
  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);
  }
  draw(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  isAlive() {
    return this.particles.length > 0;
  }
}

// --- Game Logic ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ship = new Spaceship(400, 300);
let asteroids = [];
let missiles = [];
let explosions = [];
let keys = {};
let score = 0;
window.gameOver = false;

// --- Utility Functions ---
function spawnAsteroids(num) {
  asteroids = [];
  for (let i = 0; i < num; i++) {
    let x = Math.random() * 800;
    let y = Math.random() * 600;
    // Avoid spawning on top of ship
    if (Math.hypot(x - ship.x, y - ship.y) < 100) {
      i--;
      continue;
    }
    asteroids.push(new Asteroid(x, y));
  }
}

function restartGame() {
  ship.x = 400;
  ship.y = 300;
  ship.velocity = {x: 0, y: 0};
  ship.lives = 3;
  ship.dead = false;
  ship.invincibleTimer = 90;
  score = 0;
  missiles = [];
  explosions = [];
  spawnAsteroids(5);
  window.gameOver = false;
}

// --- Collision Functions ---
function collide(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const r = (obj1.radius || 0) + (obj2.radius || 0);
  return dx * dx + dy * dy < r * r;
}

// --- Game Update ---
function update() {
  if (window.gameOver) return;

  // Ship controls
  if (!ship.dead) {
    if (keys['ArrowLeft']) ship.rotate(-1);
    if (keys['ArrowRight']) ship.rotate(1);
    if (keys['ArrowUp']) ship.thrust(true);
    if (keys['ArrowDown']) ship.thrust(false);
  }

  ship.move();
  ship.updateRespawn();

  // Asteroids move
  asteroids.forEach(ast => ast.move());

  // Missiles move and expire
  missiles.forEach(m => m.move());
  missiles = missiles.filter(m => m.life > 0);

  // Explosions update
  explosions.forEach(e => e.update());
  explosions = explosions.filter(e => e.isAlive());

  // Missile-Asteroid collision
  for (let i = asteroids.length - 1; i >= 0; i--) {
    for (let j = missiles.length - 1; j >= 0; j--) {
      if (collide(asteroids[i], missiles[j])) {
        // Break asteroid if large, else destroy
        explosions.push(new Explosion(
          asteroids[i].x, asteroids[i].y, 
          {
            color: '#ff0',
            amount: Math.floor(10 + asteroids[i].radius),
            radius: asteroids[i].radius
          }
        ));
        if (asteroids[i].radius > 20) {
          for (let n = 0; n < 2; n++) {
            asteroids.push(
              new Asteroid(
                asteroids[i].x,
                asteroids[i].y,
                asteroids[i].radius / 2,
                asteroids[i].speed * (1.2 + Math.random() * 0.2),
                Math.random() * Math.PI * 2
              )
            );
          }
        }
        // Remove asteroid and missile
        asteroids.splice(i, 1);
        missiles.splice(j, 1);
        score += 100;
        break;
      }
    }
  }

  // Asteroid-Ship collision
  if (!ship.dead && ship.invincibleTimer <= 0) {
    for (let i = 0; i < asteroids.length; i++) {
      if (collide(asteroids[i], ship)) {
        ship.die();
        if (ship.lives <= 0) {
          window.gameOver = true;
        }
        break;
      }
    }
  }

  // Next level if no asteroids left
  if (!window.gameOver && asteroids.length === 0) {
    spawnAsteroids(5);
  }
}

// --- Game Draw ---
function draw() {
  ctx.clearRect(0, 0, 800, 600);
  // Starfield
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = "#0ff2";
    ctx.beginPath();
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ship.draw(ctx);
  asteroids.forEach(ast => ast.draw(ctx));
  missiles.forEach(m => m.draw(ctx));
  explosions.forEach(e => e.draw(ctx));

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "20px Courier New";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Lives: ${ship.lives}`, 700, 30);
  if (window.gameOver) {
    ctx.fillStyle = "#f00";
    ctx.font = "48px Orbitron, Arial Black, Arial";
    ctx.fillText("GAME OVER", 270, 320);
    ctx.font = "24px Courier New";
    ctx.fillText("Press R to Restart", 290, 370);
  }
}

// --- Game Loop ---
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// --- Input ---
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  // Fire missile on Space
  // (Handled by dev mode logic in index.html; don't duplicate here!)
  // Restart on R
  if (e.key === 'r' || e.key === 'R') {
    if (window.gameOver) restartGame();
  }
});
window.addEventListener('keyup', e => keys[e.key] = false);

// --- Start Game ---
spawnAsteroids(5);
gameLoop();
