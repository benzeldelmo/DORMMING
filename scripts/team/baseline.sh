#!/bin/sh
# LEADER, ONCE: upload the working project as the first commit on `main`, then create `develop`.
# Refuses to upload anything that doesn't pass the tests and build.
#
#   sh scripts/team/baseline.sh https://github.com/<leader>/dormming.git
set -e
URL="$1"
[ -n "$URL" ] || { echo "Usage: sh scripts/team/baseline.sh <repo-url>"; exit 1; }

NAME=$(git config user.name || true); EMAIL=$(git config user.email || true)
[ -n "$NAME" ] && [ -n "$EMAIL" ] || { echo "Set your git identity first (git config --global user.name / user.email)."; exit 1; }

echo "== 1. tests and build must pass before anything is uploaded"
(cd backend && mvn -q test)
(cd frontend && npm ci --silent && npm test && npm run build)

echo "== 2. who owns what (code owners file)"
python3 scripts/team/assign.py --codeowners

echo "== 3. first commit"
git add -A
git commit -m "chore: project baseline (working app, tests passing)

Landing page, sign-in, app shell, design system and deployment: the leader.
Core features (expenses, bills, payments, balances): member 2.
Dorms and account set-up: member 3."

echo "== 4. upload"
git remote get-url origin >/dev/null 2>&1 || git remote add origin "$URL"
git push -u origin main
git push origin main:develop
echo "Done. main and develop are on GitHub. Add the two members under Settings -> Collaborators."
