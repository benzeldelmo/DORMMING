# DormMing: Cut to the Four Core Functions

Date: 13 November 2026
Status: waiting for approval

## Why

DormMing will be presented and defended in OOP 101. The professor will open the folders and ask each of the three members about the Java code. So the app must do only four things, and every file must be easy to find and explain.

## Goals

The system does exactly these four things:

1. **Split bills**: one person pays a receipt, and the items are divided among dormmates (the thermal-receipt screen). This creates debts.
2. **Add expenses (shared)**: one person pays, and the cost is split equally or by custom amounts. This creates debts.
3. **Record payments**: pay back a dormmate. This reduces a debt.
4. **View balances**: who owes whom, after netting.

Support needed for the four to work: register, log in, create or join a dorm by code, leave the dorm, log out.

## Non-goals (removed)

Utility bills (due dates, reminders, repeats), spending report, activity feed, digital card, friends, dorm invites, join-by-link/QR, the AI chat (Ask Ming, Gemini), forgot/reset password, profile setup (Ming's name, card color), delete account, editing an expense, dark mode, reduce motion, Legal pages, the animated landing page, Ming mood art.

## Anti-goals

- No new frameworks, libraries or database. In-memory storage stays.
- No feature "for later".
- No file a member can't explain in two sentences.

## Approaches considered

1. **Classic OOP layers, trimmed** (picked by the team): `model/`, `repository/`, `service/`, `controller/`. It is familiar to the professor and matches how OOP is taught. One function touches a file in each layer.
2. Folder per core function (`split/`, `expense/`, `payment/`, `balance/`). Easier to split by owner, but the OOP concepts are spread out. Not picked.
3. Keep the current layout and only delete files. Less work, but it keeps confusing names (`domain/`, `web/`, `repo/`). Not picked.

## Target folder structure

```
DormMing/
├── README.md                 how to run, where the OOP is, who owns what
├── docs/
│   └── DEFENSE-GUIDE.md      per-member study guide (written after the cut)
├── backend/                  Java 21, Spring Boot
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/dormming/
│       │   ├── DormmingApplication.java
│       │   ├── config/
│       │   │   ├── AppConfig.java          clock, random, password encoder
│       │   │   └── SecurityConfig.java     login required for /api/**
│       │   ├── model/
│       │   │   ├── Money.java              centavos, never drifts
│       │   │   ├── User.java
│       │   │   ├── UserId.java
│       │   │   ├── Dorm.java
│       │   │   ├── DormMember.java
│       │   │   ├── DormCreator.java        INHERITANCE: extends DormMember
│       │   │   ├── InviteCode.java         (absorbs Codes.java)
│       │   │   ├── Category.java
│       │   │   ├── Transaction.java        ABSTRACTION: abstract base
│       │   │   ├── SharedExpense.java      extends Transaction
│       │   │   ├── Payment.java            extends Transaction
│       │   │   ├── Ledger.java             ENCAPSULATION: only place balances are worked out
│       │   │   ├── Debt.java
│       │   │   └── split/
│       │   │       ├── SplitStrategy.java  POLYMORPHISM: interface
│       │   │       ├── EqualSplit.java
│       │   │       ├── CustomSplit.java
│       │   │       ├── ItemizedSplit.java  the receipt split
│       │   │       ├── ReceiptItem.java
│       │   │       └── SplitType.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java          interface
│       │   │   ├── DormRepository.java          interface
│       │   │   ├── TransactionRepository.java   interface
│       │   │   └── memory/                      in-memory versions
│       │   ├── service/
│       │   │   ├── AuthService.java        register, log in (was LocalAuthProvider + CredentialStore)
│       │   │   ├── DormService.java        create, join, leave
│       │   │   ├── ExpenseService.java     add shared expense, split bill, delete
│       │   │   ├── PaymentService.java     record payment
│       │   │   ├── BalanceService.java     build the Ledger
│       │   │   └── exception/              NotFound, NotAllowed, Unauthorized
│       │   ├── controller/
│       │   │   ├── AuthController.java     POST /api/auth/register, /login
│       │   │   ├── MeController.java       GET /api/me
│       │   │   ├── DormController.java     POST create/join/leave, GET current
│       │   │   ├── ExpenseController.java  GET list, POST /shared, POST /receipt, DELETE
│       │   │   ├── PaymentController.java  POST /api/payments
│       │   │   ├── BalanceController.java  GET /api/balances
│       │   │   ├── ApiErrors.java          errors to {"error": "..."}
│       │   │   └── dto/                    request and response records
│       │   └── seed/DemoSeed.java          3 demo accounts on start
│       └── test/java/com/dormming/         mirrors main: model/, service/, controller/
└── frontend/                 React + Vite
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── pages/
        │   ├── LogIn.jsx, SignUp.jsx, DormSetup.jsx
        │   ├── Balances.jsx        home screen after login
        │   ├── Expenses.jsx        list + delete
        │   ├── AddExpense.jsx      equal / custom split
        │   ├── SplitBill.jsx       receipt split (was Receipt.jsx)
        │   ├── RecordPayment.jsx
        │   └── Settings.jsx        dorm code, members, leave dorm, log out
        ├── components/             only what the pages above use
        └── lib/                    api, auth, money, receipt, dates, queries
```

Rule: each Java file holds one class, and one class does one job.

## File instructions

### Backend: move (package rename only, code unchanged unless noted)

| From | To |
|---|---|
| `AppConfig.java`, `auth/SecurityConfig.java` | `config/` (drop the `AuthProvider` parameter; use `AuthService.jwtDecoder()`) |
| `domain/money/Money.java` | `model/` (delete `times` and `divideEvenly`: unused, and `divideEvenly` breaks the leftover-centavo rule) |
| `domain/user/User.java`, `UserId.java` | `model/` (drop `mingName`, `cardColor`, `friendCode`) |
| `domain/dorm/Dorm.java`, `DormMember.java`, `DormCreator.java`, `InviteCode.java` | `model/` (drop invite-friend rights from `DormMember`) |
| `domain/Codes.java` | merge into `model/InviteCode.java` |
| `domain/transaction/Transaction.java`, `SharedExpense.java`, `Payment.java`, `Category.java` | `model/` |
| `domain/ledger/Ledger.java`, `Debt.java` | `model/` |
| `domain/split/*` | `model/split/` |
| `repo/UserRepository.java`, `DormRepository.java`, `TransactionRepository.java` + their `memory/` versions | `repository/` (drop bill methods and `findByFriendCode`) |
| `auth/LocalAuthProvider.java` + `auth/CredentialStore.java` | merge into `service/AuthService.java` (register + login only; no reset) |
| `auth/CurrentUser.java` | `controller/CurrentUser.java` |
| `service/DormService.java`, `ExpenseService.java`, `PaymentService.java`, `BalanceService.java`, `UserService.java` | `service/` (UserService folds into MeController if it only does `get`) |
| `service/*Exception.java` | `service/exception/` |
| `service/SharedExpenseInput.java` | `controller/dto/` |
| `web/*Controller.java` kept below, `web/ApiErrors.java`, `web/Requests.java`, `web/Views.java`, `web/dto/*` | `controller/` and `controller/dto/` (trim to the endpoints in the tree) |
| `seed/DemoSeed.java` | stays; seed only users, one dorm, expenses and payments |

New: `controller/BalanceController.java` takes `GET /api/balances` out of `PaymentController`.

Fix while moving (from the audit): `ExpenseService.delete` refuses when the payer or anyone in the split has left the dorm, so no debt to a former member can appear.

### Backend: delete

- `ai/` (all 9 files), `web/AssistantController.java`
- `domain/recurrence/` (4), `domain/spending/` (2), `domain/ming/MingMood.java`
- `domain/transaction/Bill.java`, `BillShare.java`, `TransactionType.java` (if only bills/activity used it)
- `domain/user/CardColor.java`, `DigitalCard.java`, `FriendCode.java`
- `domain/dorm/DormInvite.java`
- `repo/FriendRepository.java`, `repo/InviteRepository.java` + memory versions
- `auth/AuthProvider.java` (one implementation, not needed)
- `service/AccountService.java`, `ActivityService.java`, `BillInput.java`, `BillService.java`, `FriendService.java`, `HomeData.java`, `HomeService.java`
- `web/ActivityController.java`, `BillController.java`, `CardController.java`, `HomeController.java`, `SpendingController.java`
- `application.yml`: remove `gemini-model` and `app-base-url`
- Tests for removed code: `ai/AssistantTest`, `domain/ming/MingMoodTest`, `domain/recurrence/RecurrenceTest`, `domain/spending/SpendingReportTest`, `domain/user/DigitalCardTest`, `service/AccountServiceTest`, `BillServiceTest`, `FriendServiceTest`, `HomeServiceTest`; the bill case in `ConcurrencyTest`; bill cases in `TransactionTest`

### Frontend: keep and rename

- `pages/Receipt.jsx` → `pages/SplitBill.jsx`, route `/split`
- `pages/Balances.jsx` becomes the home screen (`/` when logged in)
- Navigation (bottom bar on phones, sidebar on laptops): Balances, Expenses, Split Bill, Pay, Settings
- Look: keep the current olive/orange colors, Nunito + Google Sans, light theme only

### Frontend: delete

- `landing/` (3 files) and `stageshow/` (155 files): the animated landing page
- Pages: `Landing`, `Home`, `Activity`, `AddBill`, `Bills`, `AddFriend`, `Assistant`, `Card`, `JoinLink`, `Forgot`, `Reset`, `ProfileSetup`, `Legal`
- Components: `DigitalCard`, `GreetingCard`, `Ming`, `MingBust`, `SpendingCard`, `QuickActions`, plus any `ui/*` file nothing imports after the cut
- `lib/theme.js`, `lib/afterLogin.js` (if only join links use it), the dark CSS in `index.css`, `ming-*` and confetti CSS
- `public/brand/ming-mascot.png`, `public/brand/ming/` except one picture for the login screen

### Repo root: delete or move

Only two `.md` files remain at the end: `README.md` and `docs/DEFENSE-GUIDE.md`.

- Delete: `PRODUCT.md` (design-tool notes), `PROJECT_BRIEF.md` (describes the old scope: AI, friends, bills; its team/course header moves into the README), `docs/superpowers/plans/*` and the two old `specs/*`, `frontend/src/landing/REHEARSAL.md`, `frontend/src/stageshow/kit/brands/SOURCES.md` (goes with the kit)
- Delete last, after the cut is done: this spec and its plan (`docs/superpowers/`)
- Rewrite: `README.md` (team and course, run steps, the 4 functions, the OOP table, folder map, who owns what)

Everything deleted stays in git history and can come back.

## Ownership (for GitHub and the defense)

| Member | Owns | Explains at defense |
|---|---|---|
| Member 1 | `model/split/`, `model/Money.java`, `SharedExpense.java`, `ExpenseService`, `ExpenseController`, `AddExpense.jsx`, `SplitBill.jsx` | Polymorphism (`SplitStrategy`), centavos, leftover-centavo rule |
| Member 2 | `Transaction.java`, `Payment.java`, `Ledger.java`, `Debt.java`, `PaymentService`, `BalanceService`, `PaymentController`, `BalanceController`, `RecordPayment.jsx`, `Balances.jsx` | Abstraction (`Transaction`), encapsulation (`Ledger`), netting debts |
| Member 3 | `User`, `Dorm`, `DormMember`, `DormCreator`, `repository/`, `config/`, `AuthService`, `DormService`, their controllers, `LogIn/SignUp/DormSetup/Settings.jsx` | Inheritance (`DormCreator`), interfaces (`repository/`), login and security |

## GitHub workflow

1. One member creates a **private** repo on GitHub and adds the other two as collaborators.
2. The current `main` and this cleanup are pushed once.
3. Each member clones it, signs in with **their own** GitHub account, and sets `git config user.name` / `user.email` to their own.
4. Each member works on a branch (`member1/split`, ...), commits their own changes, and opens a pull request. Another member reviews and merges.
5. Commits are made by the person who wrote the change. Claude does not commit under a teammate's name.

## Done when

- Only the four functions + login/dorm/settings are reachable in the app.
- `mvn test` and `npx vitest run` pass.
- The tree matches the one above; `grep` finds no reference to removed classes or pages.
- `docs/DEFENSE-GUIDE.md` has, per member: their files, what each class does, the OOP concept it shows, and likely professor questions with answers.

## Left to the builder

Exact DTO shapes, which `ui/*` primitives survive, and test file moves follow the main code.
