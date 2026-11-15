# DormMing - Your Digital Dormmate Companion

A web app for tracking shared money in a dorm, with Ming the cat. Built by **MING Dynasty, Team 3** (IT 2107) for **OOP 101, Object-Oriented Programming**.

Simulated banking only. No real money moves.

## What it does

DormMing does four things:

1. **Bill reminders**: your own reminders for bills you pay (internet, water, rent), with a due date; monthly ones come back after you pay.
2. **Add expenses (shared)**: one person pays, and the cost is split equally with the dorm automatically.
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

Open https://localhost:5180. The dev server uses a self-signed certificate (so phones allow the camera for Scan QR): the browser warns once; choose "Advanced → Proceed" (Chrome) or "Show Details → visit this website" (Safari). The `/api` calls go through the same address.

Run the tests with `cd backend && mvn test` (Java) and `cd frontend && npx vitest run` (frontend).

### Demo accounts

Every restart reloads this demo data. Data is kept in memory, so anything you add is gone after a restart. The password for all three accounts is `dormming123`.

| Email | Who |
|---|---|
| `benzel@demo.ph` | Created the dorm Mabini Hall 3B. Sydney owes him ₱1,000, and he owes Vince ₱900. |
| `vince@demo.ph` | Member. Paid ₱2,700 for groceries shared by all three. |
| `sydney@demo.ph` | Member. Owes Benzel and Vince. |

### Show it on phones

Phones on the same Wi-Fi can open `https://<laptop-ip>:5180`. For the full-screen app (no browser bars), open it in Safari, tap Share → **Add to Home Screen**, and start DormMing from the new icon. Find the laptop's IP in System Settings > Wi-Fi > Details, and allow incoming connections if macOS asks. Screens refresh every 5 seconds, so a change on one phone shows up on the others.

## Deploy it

In production, one Spring Boot jar serves the React app and the API from the same address (no CORS, no proxy). Plain-http visits are redirected to https.

**Without Docker** (any host that runs Java 21):

```bash
./scripts/build-jar.sh                     # builds the React app into the jar
LOCAL_JWT_SECRET='<at least 32 random characters>' REQUIRE_HTTPS=true \
  java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

**With Docker** (Render, Railway, Fly.io and similar):

```bash
docker build -t dormming .
docker run -p 8080:8080 -e LOCAL_JWT_SECRET='<at least 32 random characters>' dormming
```

| Setting | What it does | Default |
| --- | --- | --- |
| `LOCAL_JWT_SECRET` | Signs logins. **Set your own** (32+ characters): with `REQUIRE_HTTPS=true` the app refuses to start on the development value. | a development value |
| `REQUIRE_HTTPS` | `true`: redirect http to https and send HSTS. Your host must give the app https (they all do). | `false` locally, `true` in Docker |
| `PORT` | The port to listen on; hosts usually set it for you. | `8080` |
| `DORMMING_SEED` | `true` adds the three demo accounts (public password). | `true` locally, `false` in Docker |

Data is kept in memory, so a restart starts fresh. That's fine for the class demo; a real deployment would add a database behind the repository interfaces.

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
├── pages/        one file per screen: Landing, LogIn, SignUp, DormSetup, JoinLink, Home, Expenses, AddExpense, Bills, AddBill, Balances, RecordPayment, Scan, Settings (with its sub-pages), Help, Legal
├── components/   pieces the pages share (Ming, navigation, the + sheet, splash, lock screen, QR scanner, dorm QR, forms, rows)
├── lib/          helpers: API calls, login token, passcode, theme, money and dates, QR reading, Ming's mood
├── landing/      the landing page's animated phone demo (MingPayDemo)
└── stageshow/kit/ a copied UI-animation kit the demo is built with (third-party, not our code)
```

A request goes **page → controller → service → model**, and the service saves the result through a **repository**.

## Where the OOP is

All money rules are in Java under `backend/src/main/java/com/dormming/model`. React only shows the screens.

| Concept | Where to look |
|---|---|
| **Abstraction** | `model/Transaction.java` is abstract. `SharedExpense` and `Payment` extend it, and each one writes its own `describe()`. |
| **Polymorphism** | `model/split/SplitStrategy.java` is an interface with three versions: `EqualSplit`, `CustomSplit` and `ItemizedSplit` (by receipt item). The app uses the equal split; the API accepts all three. `ExpenseService` picks one and calls `split()` without knowing which. The repositories are interfaces too (`repository/`), with in-memory versions in `repository/memory/`. |
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
- Bill reminders are personal: only their owner sees them. Paying a monthly bill moves it to the same day next month.

## Who owns what

| Member | Owns | OOP concept to explain |
|---|---|---|
| Member 1 | Add expenses and Bill reminders: `model/split/`, `model/Money.java`, `model/SharedExpense.java`, `model/Bill.java`, `service/ExpenseService.java`, `service/BillService.java`, `controller/ExpenseController.java`, `controller/BillController.java`, `pages/AddExpense.jsx`, `pages/Bills.jsx`, `pages/AddBill.jsx` | Polymorphism, centavos, records |
| Member 2 | Record payments and View balances: `model/Transaction.java`, `model/Payment.java`, `model/Ledger.java`, `model/Debt.java`, `service/PaymentService.java`, `service/BalanceService.java`, `controller/PaymentController.java`, `controller/BalanceController.java`, `pages/RecordPayment.jsx`, `pages/Balances.jsx` | Abstraction, encapsulation |
| Member 3 | Users, dorms and login: `model/User.java`, `model/Dorm.java`, `model/DormMember.java`, `model/DormCreator.java`, `repository/`, `config/`, `service/AuthService.java`, `service/DormService.java`, their controllers, `pages/Landing.jsx`, `pages/LogIn.jsx`, `pages/SignUp.jsx`, `pages/DormSetup.jsx`, `pages/Home.jsx`, `pages/Settings.jsx` | Inheritance, interfaces |

See [docs/DEFENSE-GUIDE.md](docs/DEFENSE-GUIDE.md) for each member's study guide.

## Working on GitHub as a team

The team guide is [docs/TEAM.md](docs/TEAM.md): who owns what, the daily commands, reviews and releases.
The tools are in [scripts/team/](scripts/team/).
