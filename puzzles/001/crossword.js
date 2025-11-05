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

// Create an overlay layer for clue numbers
const overlay = document.createElement('div');
overlay.className = 'overlay';
overlay.style.position = 'absolute';
overlay.style.inset = '0';
overlay.style.display = 'grid';
// Set CSS custom properties so the stylesheet controls sizing responsively
overlay.style.setProperty('--cols', String(cols));
overlay.style.setProperty('--rows', String(rows));
crosswordContainer.style.setProperty('--cols', String(cols));
crosswordContainer.style.setProperty('--rows', String(rows));
overlay.style.pointerEvents = 'none';

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

// Build overlay spans and verify button logic
const inputCells = Array.from(document.querySelectorAll('input.cell'));

for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const span = document.createElement('span');
        span.className = 'clue-number';
        if (numbers[r][c] != null) span.textContent = String(numbers[r][c]);
        overlay.appendChild(span);
    }
}

// append overlay after inputs
crosswordContainer.appendChild(overlay);

// Password-protected reveal
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('reveal-password');
    const passBtn = document.getElementById('reveal-button');
    const msg = document.getElementById('reveal-message');
    const img = document.getElementById('solved-image');
    const verifyBtn = document.getElementById('verify-btn');

    if (passInput && passBtn && msg && img) {
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

        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') passBtn.click();
        });
    }

    // Verification logic
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            // Get all input cells
            const inputCells = Array.from(document.querySelectorAll('input.cell'));
            // Remove previous incorrect highlights
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
});