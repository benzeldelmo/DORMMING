# DormMing

A web app for tracking shared money in a dorm, with Ming the cat. Built by **MING Dynasty, Team 3** (IT 2107) for **OOP 101, Object-Oriented Programming**.

Simulated banking only. No real money moves.

## What it does

DormMing does four things:

1. **Split bills**: one person pays a receipt, and each item is divided among the dormmates who had it.
2. **Add expenses (shared)**: one person pays, and the cost is split equally or by amounts you type.
3. **Record payments**: pay a dormmate back.
4. **View balances**: see who owes you and whom you owe.

To use them, you sign up, log in, and create or join a dorm with a 6-character code.

## Run it

You need Java 21 or newer, Maven, and Node 22 or newer.

Start the backend (port 8080):

```bash
cd backend
mvn spring-boot:run
```

In a second terminal, start the frontend (port 5180):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5180.

Run the tests with `cd backend && mvn test` (Java) and `cd frontend && npx vitest run` (frontend).

### Demo accounts

Every restart reloads this demo data. Data is kept in memory, so anything you add is gone after a restart. The password for all three accounts is `dormming123`.

| Email | Who |
|---|---|
| `benzel@demo.ph` | Created the dorm Mabini Hall 3B. Sydney owes him ₱1,000, and he owes Vince ₱900. |
| `vince@demo.ph` | Member. Paid ₱2,700 for groceries shared by all three. |
| `sydney@demo.ph` | Member. Owes Benzel and Vince. |

### Show it on phones

Phones on the same Wi-Fi can open `http://<laptop-ip>:5180`. Find the laptop's IP in System Settings > Wi-Fi > Details, and allow incoming connections if macOS asks. Screens refresh every 5 seconds, so a change on one phone shows up on the others.

## Folder map

```
backend/src/main/java/com/dormming/
├── DormmingApplication.java   starts the server
├── config/       app setup: clock, password hashing, login check on every /api request
├── model/        the money rules: the classes the OOP concepts live in
│   └── split/    the three ways to split a cost
├── repository/   where data is stored (interfaces) + memory/ (the in-memory versions)
├── service/      one class per job: AuthService, DormService, ExpenseService, PaymentService, BalanceService
│   └── exception/   errors that become 400/403/404 responses
├── controller/   the REST API (/api/...), one controller per screen area
│   └── dto/      the JSON shapes the API reads and sends
└── seed/         demo accounts loaded on start

frontend/src/
├── pages/        one file per screen: LogIn, SignUp, DormSetup, Balances, Expenses, AddExpense, SplitBill, RecordPayment, Settings
├── components/   pieces the pages share (navigation, forms, rows, the receipt)
└── lib/          helpers: API calls, login token, money formatting, receipt preview
```

A request goes **page → controller → service → model**, and the service saves the result through a **repository**.

## Where the OOP is

All money rules are in Java under `backend/src/main/java/com/dormming/model`. React only shows the screens.

| Concept | Where to look |
|---|---|
| **Abstraction** | `model/Transaction.java` is abstract. `SharedExpense` and `Payment` extend it, and each one writes its own `describe()`. |
| **Polymorphism** | `model/split/SplitStrategy.java` is an interface with three versions: `EqualSplit`, `CustomSplit` and `ItemizedSplit` (the split-bill receipt). `ExpenseService` picks one and calls `split()` without knowing which. The repositories are interfaces too (`repository/`), with in-memory versions in `repository/memory/`. |
| **Encapsulation** | `model/Money.java` keeps whole centavos in one private field, so ₱100 ÷ 3 never drifts. `model/Ledger.java` is the only class that works out who owes whom. Constructors reject bad input. |
| **Inheritance** | `model/DormCreator.java` extends `model/DormMember.java` and overrides `canEdit()`: the creator may delete any record, and a member only their own. |

## Money rules

- Every expense is split among dorm members.
- Amounts are in Philippine pesos and stored as centavos.
- When a split is uneven, the extra centavos go to people other than the payer.
- Debts cancel out between two people. If you owe Vince ₱300 and he owes you ₱100, you owe him ₱200.
- A payment can't be more than you owe.
- You can't leave a dorm while you owe or are owed money.
- An expense can't be deleted once someone in it has left the dorm.

## Who owns what

| Member | Owns | OOP concept to explain |
|---|---|---|
| Member 1 | Split bills and Add expenses: `model/split/`, `model/Money.java`, `model/SharedExpense.java`, `service/ExpenseService.java`, `controller/ExpenseController.java`, `pages/AddExpense.jsx`, `pages/SplitBill.jsx` | Polymorphism, centavos |
| Member 2 | Record payments and View balances: `model/Transaction.java`, `model/Payment.java`, `model/Ledger.java`, `model/Debt.java`, `service/PaymentService.java`, `service/BalanceService.java`, `controller/PaymentController.java`, `controller/BalanceController.java`, `pages/RecordPayment.jsx`, `pages/Balances.jsx` | Abstraction, encapsulation |
| Member 3 | Users, dorms and login: `model/User.java`, `model/Dorm.java`, `model/DormMember.java`, `model/DormCreator.java`, `repository/`, `config/`, `service/AuthService.java`, `service/DormService.java`, their controllers, `pages/LogIn.jsx`, `pages/SignUp.jsx`, `pages/DormSetup.jsx`, `pages/Settings.jsx` | Inheritance, interfaces |

See [docs/DEFENSE-GUIDE.md](docs/DEFENSE-GUIDE.md) for each member's study guide.

## Working on GitHub as a team

1. One member creates a **private** GitHub repo and adds the other two as collaborators.
2. Each member clones it and sets their own name and email: `git config user.name "..."` and `git config user.email "..."`.
3. Work on your own branch (`git switch -c member1/split`), commit your own changes, push, and open a pull request.
4. Another member reviews the pull request and merges it into `main`.
