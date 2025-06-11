// --- Minesweeper by SpaceNinja ---
// Pro-level vanilla JS for board, mines, reveal, flag, win/loss, safe first click, and mobile controls.

// ====== Game Config ======
const DIFFICULTY = {
  easy:   { rows: 8,  cols: 8,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard:   { rows: 24, cols: 24, mines: 99 },
};

// ====== Game State ======
let board = [], revealed = [], flagged = [];
let rows = 0, cols = 0, mines = 0;
let gameOver = false, flagsLeft = 0;
let timer = 0, timerInterval = null;
let firstClick = true, minesPlaced = false;

// ====== Mobile Controls ======
let currentMobileMode = "reveal";
const isMobile = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;
const revealModeBtn = document.getElementById("reveal");
const flagModeBtn = document.getElementById("flag");
if (revealModeBtn && flagModeBtn) {
  revealModeBtn.addEventListener("change", () => { if (revealModeBtn.checked) currentMobileMode = "reveal"; });
  flagModeBtn.addEventListener("change", () => { if (flagModeBtn.checked) currentMobileMode = "flag"; });
}

// ====== DOM Elements ======
const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const flagsEl = document.getElementById('flags');
const timerEl = document.getElementById('timer');
const diffEl = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart');

// ====== Utility ======
const shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ====== Game Logic ======
function initGame() {
  const diff = DIFFICULTY[diffEl.value];
  rows = diff.rows; cols = diff.cols; mines = diff.mines;
  flagsLeft = mines; gameOver = false; timer = 0; firstClick = true; minesPlaced = false;
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
  flagged = Array.from({ length: rows }, () => Array(cols).fill(false));
  stopTimer();
  timerEl.textContent = '⏱ 0';
  flagsEl.textContent = `🚩 ${flagsLeft}`;
  messageEl.textContent = '';
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  updateBoard();
}

function placeMines(firstR, firstC) {
  let cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!(r === firstR && c === firstC)) cells.push([r, c]);
  shuffle(cells);
  for (let i = 0; i < mines; i++) {
    const [r, c] = cells[i];
    board[r][c] = 'M';
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (board[r][c] !== 'M') board[r][c] = countAdjacentMines(r, c);
}

function countAdjacentMines(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
        if (board[nr][nc] === 'M') count++;
    }
  return count;
}

function updateBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (revealed[r][c]) {
        cell.classList.add('revealed');
        if (board[r][c] === 'M') {
          cell.classList.add('mine');
          cell.textContent = '💣';
        } else if (board[r][c] > 0) {
          cell.dataset.num = board[r][c];
          cell.textContent = board[r][c];
        }
      } else if (flagged[r][c]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
      }
      boardEl.appendChild(cell);
    }
  }
}

function revealCell(r, c) {
  if (gameOver || revealed[r][c] || flagged[r][c]) return;
  if (!minesPlaced) {
    placeMines(r, c);
    minesPlaced = true;
    startTimer();
    firstClick = false;
  }
  revealed[r][c] = true;
  if (board[r][c] === 'M') {
    revealAll();
    messageEl.textContent = '💥 Game Over,';
    stopTimer();
    gameOver = true;
    return;
  }
  if (board[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
          if (!revealed[nr][nc]) revealCell(nr, nc);
      }
  }
  updateBoard();
  if (checkWin()) {
    messageEl.textContent = '🏆 You Win!';
    stopTimer();
    gameOver = true;
  }
}

function flagCell(r, c) {
  if (gameOver || revealed[r][c]) return;
  if (!flagged[r][c] && flagsLeft === 0) return;
  flagged[r][c] = !flagged[r][c];
  flagsLeft += flagged[r][c] ? -1 : 1;
  flagsEl.textContent = `🚩 ${flagsLeft}`;
  updateBoard();
}

function revealAll() {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      revealed[r][c] = true;
  updateBoard();
}

function checkWin() {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (board[r][c] !== 'M' && !revealed[r][c]) return false;
  return true;
}

// ====== Timer ======
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = `⏱ ${timer}`;
  }, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// ====== Event Handlers ======
boardEl.addEventListener('click', e => {
  if (!e.target.classList.contains('cell')) return;
  const r = +e.target.dataset.row, c = +e.target.dataset.col;
  if (isMobile()) {
    if (currentMobileMode === "reveal") {
      revealCell(r, c);
    } else {
      flagCell(r, c);
    }
  } else {
    revealCell(r, c);
  }
  updateBoard();
});

boardEl.addEventListener('contextmenu', e => {
  if (!e.target.classList.contains('cell')) return;
  if (isMobile()) return;
  e.preventDefault();
  const r = +e.target.dataset.row, c = +e.target.dataset.col;
  flagCell(r, c);
});

diffEl.addEventListener('change', initGame);
restartBtn.addEventListener('click', initGame);
document.addEventListener('keydown', e => { if (e.key === 'r') initGame(); });

// ====== Initialize ======
initGame();
