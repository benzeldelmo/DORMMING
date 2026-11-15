#!/bin/sh
# EVERY MEMBER, EACH TIME you finish a piece of work: commit ONLY your own files, on a branch off develop,
# push, and open a pull request into develop.
#
#   sh scripts/team/daily.sh <leader|member2|member3> "<what you changed, e.g. fix bill due dates>"
#
# Files that belong to someone else are never staged here. Your commits carry your own git name.
set -e
OWNER="$1"; WHAT="$2"
case "$OWNER" in leader|member2|member3) ;; *) echo 'Usage: sh scripts/team/daily.sh <leader|member2|member3> "<what changed>"'; exit 1 ;; esac
[ -n "$WHAT" ] || { echo "Say what changed, in quotes."; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Run this inside your clone of the repo."; exit 1; }

NAME=$(git config user.name || true); EMAIL=$(git config user.email || true)
[ -n "$NAME" ] && [ -n "$EMAIL" ] || { echo "Set your git identity (use the email on your GitHub account)."; exit 1; }

# 1. Which of the changed files are yours?
MINE=$(python3 scripts/team/assign.py "$OWNER")
CHANGED=$(git ls-files --modified --others --exclude-standard)
OURS=""; OTHERS=""
for f in $CHANGED; do
  if echo "$MINE" | grep -qxF "$f"; then OURS="$OURS $f"; else OTHERS="$OTHERS $f"; fi
done
if [ -z "$OURS" ]; then echo "None of your files changed. Nothing to upload."; exit 0; fi
if [ -n "$OTHERS" ]; then
  echo "Left out (not yours, not uploaded by you):"; for f in $OTHERS; do echo "  $f"; done
fi

# 2. Branch off the latest develop
git fetch -q origin
git stash push -q --include-untracked -m "daily-$$" -- $OURS
git checkout -q develop && git pull -q --ff-only origin develop
BRANCH="feature/$OWNER-$(date +%Y%m%d-%H%M)"
git checkout -q -b "$BRANCH"
git stash pop -q

# 3. Commit only your files
git add -- $OURS
git commit -q -m "$WHAT" -- $OURS
git push -q -u origin "$BRANCH"
echo "Committed as $NAME on $BRANCH"

# 4. Pull request into develop
if command -v gh >/dev/null 2>&1 && gh pr create --base develop --head "$BRANCH" --title "$WHAT" --body "Owner: $OWNER. Changes only the files that belong to $OWNER (see scripts/team/assign.py)." 2>/dev/null; then
  echo "Pull request opened."
else
  echo "Now open a pull request on GitHub: base develop <- compare $BRANCH, title: $WHAT"
fi
