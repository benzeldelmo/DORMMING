# Working as a team on DormMing

Three people, one repo, real history. Everything you need is in `scripts/team/`.

## Who owns what

| Owner | Area | Files |
|---|---|---|
| **Leader** | Landing page, project set-up, security, sign-in, app shell, design (UI/UX), deployment | everything not listed below |
| **Member 2** | Core features: add expenses, bill reminders, record payments, balances | `python3 scripts/team/assign.py member2` |
| **Member 3** | Dorm and account set-up: create or join a dorm, QR and invite code, profile, settings | `python3 scripts/team/assign.py member3` |

`scripts/team/assign.py` is the single source of truth. GitHub requests the right reviewer
automatically from `.github/CODEOWNERS` (generated from the same list).

## Rules

1. Commit **only your own files**. `daily.sh` enforces it: other people's changes are left out.
2. Always work through a branch and a pull request into `develop`. Never push to `main`.
3. Nobody reviews their own pull request.
4. Before you open a pull request, the tests and build must pass:
   `cd backend && mvn test` and `cd frontend && npm test && npm run build`.
5. Commit small and often, as you finish each piece. Describe the change in plain words.

## Set-up (once per person)

```sh
git config --global user.name  "Your Full Name"
git config --global user.email "the-email-on-your-github-account@gmail.com"
git clone https://github.com/<leader>/dormming.git && cd dormming
git switch develop
```

## Every day (or each time you finish something)

```sh
sh scripts/team/daily.sh member2 "Short description of what you changed"    # or member3 / leader
```

The script saves your files, makes a new branch off the latest `develop`, commits only your
files under your name, pushes, and opens a pull request into `develop` (with `gh`, or it prints
the link to click).

Before you start the next piece of work, get the latest team code:

```sh
git switch develop && git pull
```

## Reviews

- The owner of a file is asked to review changes to it. Read the **Files changed** tab, leave at
  least one comment or question, then **Approve** and **Merge**.
- Merge into `develop`, and let the leader know if something in another person's area is affected.

## Release

When `develop` passes the tests and runs well, the leader opens one pull request
**`develop` → `main`** titled "Release", another member approves, and it's merged.

## First time only (leader)

```sh
sh scripts/team/baseline.sh https://github.com/<leader>/dormming.git
```

It runs the tests and build, uploads the working project to `main` as the first commit, and
creates `develop`. Before that, replace the `@…_GITHUB_USERNAME` placeholders in
`scripts/team/assign.py`, then run `python3 scripts/team/assign.py --codeowners`.
