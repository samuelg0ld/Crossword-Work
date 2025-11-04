const crosswordContainer = document.getElementById('crossword');

const grid = [
  ['B','E','N','C','H','.','.','.','L','I','B','R','A'],
  ['L','A','I','R','.','.','.','B','A','S','H','A','R'],
  ['O','N','C','E','.','C','P','A','P','M','A','S','K'],
  ['N','.','O','A','K','L','A','N','D','.','D','P','H'],
  ['D','.','I','T','E','A','C','H','.','.','.','Y','A'],
  ['E','N','S','I','G','N','S','.','.','C','.','.','M'],
  ['B','.','E','V','E','S','.','.','E','R','A','.','.'],
  ['E','.','.','E','L','M','O','S','W','O','R','L','D'],
  ['E','M','.','.','S','E','R','I','E','.','B','A','E'],
  ['R','E','M','.','.','N','N','N','.','I','R','M','A'],  
  ['.','S','U','B','.','.','O','A','T','M','E','A','L'],
  ['.','O','N','E','G','A','T','I','V','E','.','R','T'],
];

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

// Create an overlay layer for clue numbers. The overlay is visual-only
// (pointer-events: none) so it won't block input focus or typing.
const overlay = document.createElement('div');
overlay.className = 'overlay';
overlay.style.position = 'absolute';
overlay.style.inset = '0';
overlay.style.display = 'grid';
overlay.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
overlay.style.gridTemplateRows = `repeat(${rows}, 32px)`;
overlay.style.pointerEvents = 'none'; // allow clicks to pass to inputs

// We'll number across clues first (left-to-right, top-to-bottom) and only
// number across/down clues that have length >= 2. After numbering across
// we continue numbering down clues for starts that haven't already been
// assigned a number.
const numbers = Array.from({ length: rows }, () => Array(cols).fill(null));
let clueNum = 0;

// Helper to compute across length starting at r,c
function acrossLength(r, c) {
  let len = 0;
  for (let x = c; x < cols && grid[r][x] !== '.'; x++) len++;
  return len;
}

// Helper to compute down length starting at r,c
function downLength(r, c) {
  let len = 0;
  for (let y = r; y < rows && grid[y][c] !== '.'; y++) len++;
  return len;
}

// 1) Number across clues (left-to-right, top-to-bottom) if length >= 2
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

// 2) Number down clues (top-to-bottom, left-to-right) if length >=2
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

// Build overlay spans (one per cell) and fill with assigned numbers (if any)
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const span = document.createElement('span');
    span.className = 'clue-number';
    if (numbers[r][c] != null) span.textContent = String(numbers[r][c]);
    overlay.appendChild(span);
  }
}

// append overlay after inputs so it visually sits above them
crosswordContainer.appendChild(overlay);

// --------- Password-protected reveal (client-side demo) ----------
// Note: client-side password checks can be inspected/modified by users.
// For true protection, perform password checking on a server and only
// deliver the image after authentication.

document.addEventListener('DOMContentLoaded', () => {
  const passInput = document.getElementById('reveal-password');
  const passBtn = document.getElementById('reveal-button');
  const msg = document.getElementById('reveal-message');
  const img = document.getElementById('solved-image');

  if (!passInput || !passBtn || !msg || !img) return; // nothing to do

  // Replace this with your chosen password. This example stores plaintext
  // which is easy to inspect — for production, verify on a server.
  const CORRECT_PASSWORD = 'BASHAR';

  function showImage() {
    img.style.display = 'block';
    msg.textContent = 'Solved grid revealed.';
    msg.style.color = '#060';
  }

  function hideImageWithError() {
    img.style.display = 'none';
    msg.textContent = 'Incorrect password.';
    msg.style.color = '#900';
  }

  passBtn.addEventListener('click', () => {
    const val = passInput.value || '';
    if (val === CORRECT_PASSWORD) {
      showImage();
      passInput.value = '';
    } else {
      hideImageWithError();
    }
  });

  // allow Enter key to submit
  passInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') passBtn.click();
  });
});