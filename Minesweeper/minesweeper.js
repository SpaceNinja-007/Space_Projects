// --- Minesweeper by SpaceNinja ---
// Pro-level vanilla JS logic for board creation, mine placement, cell reveal, flagging, and win/loss

// ====== Game Config ======
const DIFFICULTY = {
  easy:   { rows: 8,  cols: 8,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard:   { rows: 24, cols: 24, mines: 99 }
};

let board = [];
let revealed = [];
let flagged = [];
let rows = 0, cols = 0, mines = 0;
let gameOver = false;
let flagsLeft = 0;
let timer = 0, timerInterval = null;

// ====== DOM Elements ======
const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const flagsEl = document.getElementById('flags');
const timerEl = document.getElementById('timer');
const diffEl = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart');

// ====== Utility ======
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ====== Game Logic ======
function initGame() {
  // Get difficulty
  const diff = DIFFICULTY[diffEl.value];
  rows = diff.rows; cols = diff.cols; mines = diff.mines;
  flagsLeft = mines;
  gameOver = false;
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
  flagged = Array.from({ length: rows }, () => Array(cols).fill(false));
  timer = 0;
  clearInterval(timerInterval);
  timerEl.textContent = '⏱ 0';
  flagsEl.textContent = `🚩 ${flagsLeft}`;
  messageEl.textContent = '';
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  placeMines();
  updateBoard();
}

function placeMines() {
  // Place mines randomly
  let cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells.push([r, c]);
  shuffle(cells);
  for (let i = 0; i < mines; i++) {
    const [r, c] = cells[i];
    board[r][c] = 'M';
  }
  // Fill numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'M') continue;
      board[r][c] = countAdjacentMines(r, c);
    }
  }
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
  revealed[r][c] = true;
  if (board[r][c] === 'M') {
    revealAll();
    messageEl.textContent = '💥 Game Over, SpaceNinja!';
    stopTimer();
    gameOver = true;
    return;
  }
  if (timer === 0) startTimer();
  if (board[r][c] === 0) {
    // Flood fill reveal
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
          if (!revealed[nr][nc]) revealCell(nr, nc);
      }
  }
  updateBoard();
  if (checkWin()) {
    messageEl.textContent = '🏆 You Win, SpaceNinja!';
    stopTimer();
    gameOver = true;
  }
}

function flagCell(r, c) {
  if (gameOver || revealed[r][c]) return;
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
  revealCell(r, c);
  updateBoard();
});

boardEl.addEventListener('contextmenu', e => {
  if (!e.target.classList.contains('cell')) return;
  e.preventDefault();
  const r = +e.target.dataset.row, c = +e.target.dataset.col;
  flagCell(r, c);
});

diffEl.addEventListener('change', initGame);
restartBtn.addEventListener('click', initGame);

// Pro accessibility tip: allow keyboard interaction
document.addEventListener('keydown', e => {
  if (e.key === 'r') initGame();
});

// ====== Initialize ======
initGame();

// ====== Pro Tip: ======
// You can tweak board size/difficulty, add best score saving with localStorage, or spice up your UI with animations/sound!
