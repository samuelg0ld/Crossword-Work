Crossword Work — small static crossword site

Usage notes

- Puzzles are kept in `puzzles/NNN/` where `NNN` is the puzzle number (e.g., `001`).
- Each puzzle folder contains `index.html`, `crossword.js`, `styles.css`, and an optional `solved.png`.

Creating a new puzzle (automated)

Use the `new-puzzle.sh` script to create a new puzzle directory from the template:

```bash
# create puzzle 002, date, author, and title
./new-puzzle.sh 002 "November 4, 2025" "Sam" "Crossword #002"

# add an image and make it the latest (optional)
./new-puzzle.sh 002 "November 4, 2025" "Sam" "Crossword #002 --image /path/to/solved.png --make-latest"
```

After running the script, edit `puzzles/002/index.html` and `puzzles/002/crossword.js` to provide the actual grid and clues.

Manual workflow

If you prefer manual control, copy `puzzles/001` to a new folder and edit the files.

If you'd like, I can also:
- Make the script smarter (validate inputs, create zero-padded numbers automatically).
- Implement a Node.js alternative that uses a `puzzles.json` metadata file and regenerates `archive.html` from it.
