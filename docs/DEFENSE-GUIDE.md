# DormMing Defense Guide

One section per member. Each section lists your files, what each class does, the OOP concept it shows, how your feature flows through the code, and questions the professor may ask, with short answers.

Read **Everyone** first. Then read your own section, and skim the other two so you can help.

---

## Everyone: how the code is organized

The backend has four layers. A request always moves through them in this order:

```
React page  →  controller/  →  service/  →  model/
  (screen)     (REST API)      (one job)     (money rules)
                                  ↓
                             repository/  (stores the data)
```

| Layer | Job | Example |
|---|---|---|
| `controller/` | Reads the HTTP request, calls a service, sends JSON back | `PaymentController` handles `POST /api/payments` |
| `service/` | Does one job: checks who is asking, loads data, calls the model, saves | `PaymentService.record(...)` |
| `model/` | The objects and rules: money, splits, debts, dorms | `Ledger.openDebt(...)` |
| `repository/` | Saves and finds objects. Interfaces, with in-memory versions in `repository/memory/` | `TransactionRepository.save(...)` |

**Likely questions for anyone**

- **Why store money as centavos (a `long`) and not a `double`?** A `double` cannot hold 0.10 exactly, so ₱100 ÷ 3 drifts by fractions of a centavo. Whole centavos never drift.
- **Where is the data saved?** In memory (`repository/memory/`), in a `ConcurrentHashMap`. It resets when the server restarts. Because the services only use the repository *interfaces*, a database version could replace it without changing the services.
- **What is Spring Boot doing?** It creates our objects and passes each one what it needs (dependency injection). For example, `PaymentService` asks for a `TransactionRepository` in its constructor, and Spring gives it one. It also runs the web server.
- **How does login work?** `AuthService` hashes the password with BCrypt and gives back a signed token. The phone sends that token with every request, and `SecurityConfig` checks it before any `/api` call runs.
- **What happens when input is wrong?** The model's constructors throw `IllegalArgumentException` with a plain message. `controller/ApiErrors.java` turns that into a 400 response with `{"error": "..."}`, and the screen shows the message.

---

## Member 1: Split bills and Add expenses

### Your files

| File | What it does |
|---|---|
| `model/Money.java` | An amount in pesos, stored as whole centavos in one private `long`. Parses what people type ("1,000.50"). Every operation returns a new `Money`. |
| `model/SharedExpense.java` | One expense: who paid, how much, and each person's share. Extends `Transaction`. |
| `model/split/SplitStrategy.java` | **Interface**: "given a total, the people and the payer, how much does each person pay?" |
| `model/split/EqualSplit.java` | Everyone pays the same. Leftover centavos go to people other than the payer. |
| `model/split/CustomSplit.java` | Each person's amount is typed in, and the amounts must add up to the total. |
| `model/split/ItemizedSplit.java` | **Split bills**: each item on a receipt is split among the people who had it. Extras (tax, tip, discount) are shared in proportion. |
| `model/split/ReceiptItem.java` | One line on the receipt: name, price, who shared it. |
| `model/split/SplitType.java` | `EQUAL`, `CUSTOM` or `ITEMIZED`. |
| `service/ExpenseService.java` | Adds, lists and deletes expenses. Picks the right `SplitStrategy`. |
| `controller/ExpenseController.java` | `GET /api/expenses`, `POST /api/expenses/shared`, `DELETE /api/expenses/{id}`. |
| `frontend/src/pages/AddExpense.jsx` | The Add expense screen (equal or custom split). |
| `frontend/src/pages/SplitBill.jsx` | The Split Bill screen (receipt items, extras, live receipt preview). |

### OOP concept: Polymorphism

`ExpenseService.build(...)` picks a strategy:

```java
SplitStrategy strategy = switch (in.type()) {
    case EQUAL -> new EqualSplit();
    case CUSTOM -> new CustomSplit(in.amounts());
    case ITEMIZED -> new ItemizedSplit(in.items(), in.extras());
};
```

`SharedExpense.create(...)` then calls `strategy.split(amount, participants, payer)`. It does not know or care which of the three it got. Each class answers the same question in its own way. That is polymorphism.

### How "Split bills" flows

1. `SplitBill.jsx` sends `POST /api/expenses/shared` with `split.type = "ITEMIZED"`, the items and the extras.
2. `ExpenseController.addShared` turns the JSON into a `SharedExpenseInput` (`controller/Requests.java` checks every field).
3. `ExpenseService.addShared` checks that everyone is in your dorm, builds an `ItemizedSplit`, and calls `SharedExpense.create`.
4. `ItemizedSplit.split` splits each item equally among its sharers, then shares the extras by each person's subtotal. Leftover centavos go to whoever had the largest fraction. The shares always add up exactly to the total.
5. The expense is saved in `TransactionRepository`. Balances change because `Ledger` reads every expense.

"Add expenses" is the same flow with `EQUAL` or `CUSTOM` instead.

### Likely questions

- **Why an interface and not one method with if/else?** Each split has its own rules and its own checks (custom amounts must add up; receipt items must match the total). Separate classes keep each rule small and testable. Adding a fourth split means adding one class, not editing the others.
- **₱100 split three ways. Who pays the extra centavo?** ₱33.33 each leaves 1 centavo. It goes to someone other than the payer, so the payer never pays more than their fair share (`EqualSplit.divide`).
- **What if the receipt items don't add up to the total?** `ItemizedSplit.split` throws "Items and extras must add up to the total", and the screen shows it. The screen also offers a "Use ₱…" button to fix the total.
- **Who may delete an expense?** The person who added it, or the dorm creator (`DormMember.canEdit` / `DormCreator.canEdit`). It can't be deleted if someone in it has left the dorm, because that would leave a debt nobody can pay.
- **Where is this tested?** `model/split/SplitStrategyTest.java`, `model/MoneyTest.java`, `service/ExpenseServiceTest.java`.

---

## Member 2: Record payments and View balances

### Your files

| File | What it does |
|---|---|
| `model/Transaction.java` | **Abstract** base class for every money record: id, dorm, amount, date, who made it, note. Rejects amounts of ₱0 or less. |
| `model/Payment.java` | Money paid from one dormmate to another. Extends `Transaction`. You can't pay yourself. |
| `model/Ledger.java` | Works out who owes whom from all expenses and payments. Nets debts between each pair. |
| `model/Debt.java` | One line in the result: from, to, amount. |
| `service/PaymentService.java` | Records a payment, but never more than you owe. |
| `service/BalanceService.java` | Builds the `Ledger` for a dorm. |
| `controller/PaymentController.java` | `POST /api/payments`. |
| `controller/BalanceController.java` | `GET /api/balances`. |
| `frontend/src/pages/RecordPayment.jsx` | The Pay screen. |
| `frontend/src/pages/Balances.jsx` | The Balances screen (home after login). |

### OOP concepts: Abstraction and Encapsulation

- **Abstraction:** `Transaction` is abstract, with `public abstract String describe(...)`. You can't create a plain `Transaction`, only a `SharedExpense` or a `Payment`. Both share the common fields and checks, and each describes itself its own way ("Benzel paid Vince ₱500.00").
- **Encapsulation:** `Ledger` keeps its totals in a private map. Nobody outside can change them. You can only ask questions: `openDebt`, `debtsInvolving`, `totalOwedTo`, `totalOwedBy`, `isSettled`. It is the **only** place balances are worked out, so the rule can't be applied two different ways.

### How "View balances" flows

1. `Balances.jsx` calls `GET /api/balances` every 5 seconds.
2. `BalanceController` asks `BalanceService.ledgerFor(dormId)`.
3. `BalanceService` loads all the dorm's expenses and payments and builds a `new Ledger(expenses, payments)`.
4. For each expense, every non-payer owes the payer their share. A payment from X to Y counts as Y "owing" X, which cancels X's debt.
5. `openDebt(a, b)` = what a owes b minus what b owes a, never below zero. That is the netting.

### How "Record payments" flows

1. `RecordPayment.jsx` sends `POST /api/payments` with who and how much.
2. `PaymentService.record` checks that the person is in your dorm and isn't you, and that the amount isn't more than `ledger.openDebt(from, to)`.
3. It saves a `Payment`. The next balances call shows the smaller debt.

### Likely questions

- **If I owe Vince ₱300 and he owes me ₱100, what shows?** I owe Vince ₱200. Only the difference shows (`Ledger.openDebt`).
- **Why is `record` marked `synchronized`?** If someone double-taps Pay, two requests arrive at once. Without the lock, both could pass the "not more than you owe" check and pay twice. `service/ConcurrencyTest.java` proves only one goes through.
- **Why is `Transaction` abstract and not an interface?** Expenses and payments share real fields and checks (amount > 0, date, note ≤ 200 characters). An abstract class holds that shared code once, which an interface can't.
- **Can a payment be ₱0 or negative?** No. The `Transaction` constructor rejects it before anything is saved.
- **Where is this tested?** `model/LedgerTest.java`, `model/TransactionTest.java`, `service/PaymentServiceTest.java`, `service/ConcurrencyTest.java`.

---

## Member 3: Users, dorms and login

### Your files

| File | What it does |
|---|---|
| `model/User.java` | An account: id, email (stored in lowercase), display name. Immutable. |
| `model/UserId.java` | A user's id, as its own type so it can't be mixed up with other strings. |
| `model/Dorm.java` | A dorm and its members, in the order they joined. |
| `model/DormMember.java` | A member. `canEdit()` allows only your own records. |
| `model/DormCreator.java` | **Extends `DormMember`**. Overrides `canEdit()` so the creator may delete any record. |
| `model/InviteCode.java` | The 6-character join code. No I, O, 0 or 1, so nothing looks alike. |
| `repository/*.java` | **Interfaces** for saving and finding users, dorms and records. |
| `repository/memory/*.java` | The in-memory versions of those interfaces. |
| `config/SecurityConfig.java` | Every `/api` call needs a valid login token, except register and log in. |
| `config/AppConfig.java` | The Manila clock, the random generator for codes, BCrypt for passwords. |
| `service/AuthService.java` | Register and log in. Hashes passwords and signs tokens. |
| `service/DormService.java` | Create, join and leave a dorm. |
| `controller/AuthController.java`, `DormController.java`, `MeController.java` | The API for the above. |
| `frontend/src/pages/Landing.jsx`, `LogIn.jsx`, `SignUp.jsx`, `DormSetup.jsx`, `Settings.jsx` | The matching screens. |
| `frontend/src/pages/Home.jsx`, `components/Ming.jsx`, `lib/mood.js` | Home: Ming's mood follows your balance (worried if you owe, happy if you're owed, celebrating when everyone is square, sleepy before any expense). |

### OOP concepts: Inheritance and Interfaces

- **Inheritance:** `DormCreator extends DormMember` and overrides two methods: `canEdit()` returns `true` for any record, and `role()` returns `"CREATOR"`. Code that checks permissions calls `member.canEdit(record)` and gets the right answer for either kind of member.
- **When the creator leaves:** `Dorm.removeMember` gives the creator role to the next member who joined, by replacing them with a `new DormCreator(...)`.
- **Interfaces:** `UserRepository`, `DormRepository` and `TransactionRepository` say *what* storage can do. `repository/memory/` says *how*. The services only see the interfaces.

### How joining a dorm flows

1. `DormSetup.jsx` sends `POST /api/dorms/join` with the code.
2. `DormController.join` calls `DormService.join`.
3. `DormService` checks that you aren't already in a dorm, finds the dorm by `InviteCode.parse(code)` (lowercase works), and calls `dorm.addMember(...)`.
4. The dorm is saved, and the app sends you to Balances.

### How leaving flows

`DormService.leave` asks the `Ledger` whether you are settled. If anyone owes you or you owe anyone, it refuses with "Settle your balance before leaving". If you were the last member, the dorm is deleted.

### Likely questions

- **How are passwords stored?** Never as plain text. `AuthService` stores a BCrypt hash. Login hashes what you typed and compares.
- **How does the server know who is calling?** Log in returns a signed token (JWT). The app sends it in the `Authorization` header, and `SecurityConfig` checks the signature on every request. `CurrentUser.id(jwt)` reads the user id from it.
- **What is the difference between `DormMember` and `DormCreator`?** Same data, different rights. The creator may delete any record, and a member only their own. That difference is the overridden `canEdit()`.
- **Why are the repositories interfaces?** So the services don't depend on how data is stored. Today it's in memory; a database version would implement the same interface, and no service code would change.
- **Can two people sign up with the same email at once?** No. `AuthService.register` is `synchronized`, and it checks for the email before saving.
- **Where is this tested?** `model/DormTest.java`, `service/DormServiceTest.java`, `service/AuthServiceTest.java`, `controller/AuthFlowTest.java`.
