#!/usr/bin/env bash
set -euo pipefail

# new-puzzle.sh - create a new puzzle folder from puzzles/template
# Usage: ./new-puzzle.sh 002 "November 4, 2025" "Sam" "Crossword #002" [--make-latest] [--image /path/to/solved.png]

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 NUMBER DATE AUTHOR TITLE [--make-latest] [--image /path/to/solved.png]"
  exit 1
fi

NUM=$1
DATE=$2
AUTHOR=$3
shift 3
TITLE=$*

MAKE_LATEST=false
IMAGE_PATH=""

# allow flags in TITLE (simple parse)
# if user passed --make-latest or --image at end, extract them
if [[ "$TITLE" == *"--make-latest"* ]]; then
  MAKE_LATEST=true
  TITLE="${TITLE/--make-latest/}"
fi
if [[ "$TITLE" == *"--image"* ]]; then
  # extract image path following --image
  # naive parsing: find --image and next word
  arr=($TITLE)
  newtitle=()
  for i in "${!arr[@]}"; do
    if [[ "${arr[$i]}" == "--image" ]]; then
      IMAGE_PATH="${arr[$((i+1))]}"
      arr[$i]=''
      arr[$((i+1))]=''
    fi
  done
  # rebuild TITLE
  for v in "${arr[@]}"; do
    if [[ -n "$v" ]]; then newtitle+=("$v"); fi
  done
  TITLE="${newtitle[*]}"
fi

TITLE=$(echo "$TITLE" | sed 's/^ *//;s/ *$//')

DEST="puzzles/$NUM"
if [ -d "$DEST" ]; then
  echo "Destination $DEST already exists. Aborting." >&2
  exit 1
fi

cp -R puzzles/template "$DEST"

# Replace placeholders in files
for f in "$DEST"/index.html "$DEST"/crossword.js; do
  # macOS sed requires an empty '' backup arg
  sed -i '' "s|__NUM__|$NUM|g" "$f" || true
  sed -i '' "s|__DATE__|$DATE|g" "$f" || true
  sed -i '' "s|__AUTHOR__|$AUTHOR|g" "$f" || true
  sed -i '' "s|__TITLE__|$TITLE|g" "$f" || true
done

# If image provided, copy it into destination as solved.png
if [ -n "$IMAGE_PATH" ]; then
  if [ -f "$IMAGE_PATH" ]; then
    cp "$IMAGE_PATH" "$DEST/solved.png"
    echo "Copied image to $DEST/solved.png"
  else
    echo "Image path $IMAGE_PATH not found; skipping image copy." >&2
  fi
fi

# Add a card to archive.html using a small python replace so we keep formatting
PY="""
from pathlib import Path
p=Path('archive.html')
s=p.read_text()
marker='<!-- New puzzle cards will be added here -->'
card='''        <div class="puzzle-card">
            <a href="puzzles/%s/index.html">
                <h3>Crossword #%s</h3>
                <div class="puzzle-date">%s</div>
                <p>by %s</p>
            </a>
        </div>
        <!-- New puzzle cards will be added here -->
''' % ('%s','%s','%s','%s')
card=card.replace('%s','%s')
# Now format with values
card=card % ('%s','%s','%s','%s')
# We'll just insert with simple replace by building the exact string
newcard = '''        <div class="puzzle-card">
            <a href="puzzles/%s/index.html">
                <h3>Crossword #%s</h3>
                <div class="puzzle-date">%s</div>
                <p>by %s</p>
            </a>
        </div>
        <!-- New puzzle cards will be added here -->
'''% ("""$NUM""","""$NUM""","""$DATE""","""$AUTHOR""")
if marker in s:
    s=s.replace(marker,newcard)
    p.write_text(s)
    print('archive.html updated')
else:
    print('marker not found in archive.html; please add a new card manually')
"""

python3 - <<PYCODE
from pathlib import Path
p=Path('archive.html')
s=p.read_text()
marker='<!-- New puzzle cards will be added here -->'
newcard = f"        <div class=\"puzzle-card\">\n            <a href=\"puzzles/{NUM}/index.html\">\n                <h3>Crossword #{NUM}</h3>\n                <div class=\"puzzle-date\">{DATE}</div>\n                <p>by {AUTHOR}</p>\n            </a>\n        </div>\n        <!-- New puzzle cards will be added here -->\n"
if marker in s:
    s=s.replace(marker,newcard)
    p.write_text(s)
    print('archive.html updated')
else:
    print('marker not found in archive.html; please add a new card manually')
PYCODE

# Optionally make this the latest on index.html
if [ "$MAKE_LATEST" = true ]; then
  sed -i '' "s|puzzles/[0-9][0-9][0-9]/index.html|puzzles/$NUM/index.html|g" index.html || true
  echo "index.html updated to point to puzzles/$NUM/index.html"
fi

echo "New puzzle created at $DEST"
exit 0
