// Template crossword.js — replace the grid below with your puzzle
const crosswordContainer = document.getElementById('crossword');

const grid = __GRID__;

// dimensions
const rows = grid.length;
const cols = grid[0].length;

// create the input grid
grid.forEach((row) => {
  row.forEach((char) => {
    const cell = document.createElement('input');
    cell.maxLength = 1;
    cell.classList.add('cell');
    if (char === '.') {
      cell.classList.add('black');
      cell.disabled = true;
    }
    crosswordContainer.appendChild(cell);
    cell.style.textAlign = 'center';
  });
});

// overlay + numbering logic (keeps previous behavior)
const overlay = document.createElement('div');
overlay.className = 'overlay';
overlay.style.position = 'absolute';
overlay.style.inset = '0';
overlay.style.display = 'grid';
// Use CSS variables for responsive sizing. JS sets --cols/--rows on the container
overlay.style.setProperty('--cols', String(cols));
overlay.style.setProperty('--rows', String(rows));
crosswordContainer.style.setProperty('--cols', String(cols));
crosswordContainer.style.setProperty('--rows', String(rows));
overlay.style.pointerEvents = 'none';

const numbers = Array.from({ length: rows }, () => Array(cols).fill(null));
let clueNum = 0;

function acrossLength(r, c) {
  let len = 0;
  for (let x = c; x < cols && grid[r][x] !== '.'; x++) len++;
  return len;
}
function downLength(r, c) {
  let len = 0;
  for (let y = r; y < rows && grid[y][c] !== '.'; y++) len++;
  return len;
}

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (grid[r][c] === '.') continue;
    const noLeft = c === 0 || grid[r][c - 1] === '.';
    if (noLeft) {
      const len = acrossLength(r, c);
      if (len >= 2) {
        clueNum += 1;
        numbers[r][c] = clueNum;
      }
    }
  }
}
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (grid[r][c] === '.') continue;
    const noTop = r === 0 || grid[r - 1][c] === '.';
    if (noTop) {
      const len = downLength(r, c);
      if (len >= 2 && numbers[r][c] == null) {
        clueNum += 1;
        numbers[r][c] = clueNum;
      }
    }
  }
}

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const span = document.createElement('span');
    span.className = 'clue-number';
    if (numbers[r][c] != null) span.textContent = String(numbers[r][c]);
    overlay.appendChild(span);
  }
}

crosswordContainer.appendChild(overlay);

// Verify button logic (same as site)
document.addEventListener('DOMContentLoaded', () => {
  const verifyBtn = document.getElementById('verify-btn');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      const inputCells = Array.from(document.querySelectorAll('input.cell'));
      inputCells.forEach(cell => cell.classList.remove('incorrect'));
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = inputCells[idx++];
          if (grid[r][c] === '.') continue;
          const userVal = (cell.value || '').toUpperCase();
          const correctVal = grid[r][c].toUpperCase();
          if (userVal && userVal !== correctVal) {
            cell.classList.add('incorrect');
          }
        }
      }
    });
  }

  // reveal image logic (password stored in file — change or remove if desired)
  const passInput = document.getElementById('reveal-password');
  const passBtn = document.getElementById('reveal-button');
  const msg = document.getElementById('reveal-message');
  const img = document.getElementById('solved-image');
  if (passInput && passBtn && msg && img) {
    const CORRECT_PASSWORD = '__PASSWORD__';
    passBtn.addEventListener('click', () => {
      const val = passInput.value || '';
      if (val === CORRECT_PASSWORD) {
        img.style.display = 'block';
        msg.textContent = 'Solved grid revealed.';
        msg.style.color = '#060';
        passInput.value = '';
      } else {
        img.style.display = 'none';
        msg.textContent = 'Incorrect password.';
        msg.style.color = '#900';
      }
    });
    passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') passBtn.click(); });
  }
});
