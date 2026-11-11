# DormMing

A dorm companion for shared money: the dorm's expenses (gastos), receipt-style bill splitting, bills with reminders, payment tracking, a monthly dorm spending report and a digital card, with Ming the cat keeping count. It works on phones (bottom bar) and laptops (sidebar dashboard). Built by MING Dynasty, Team 3 (IT 2107) for OOP 101.

Simulated banking only. No real money moves.

## Run it

You need Java 21 or newer, Maven and Node 20 or newer.

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

### Demo accounts

Every restart reloads this demo data. The password for all three is `dormming123`.

| Email | Who |
|---|---|
| `benzel@demo.ph` | Dorm creator of Mabini Hall 3B. Owed ₱1,000, owes ₱900. |
| `vince@demo.ph` | Member. Paid for the ₱2,700 grocery run. |
| `sydney@demo.ph` | Member. Owes Benzel and Vince. |

### Show it on phones

Phones on the same Wi-Fi can open `http://<laptop-ip>:5180` (find the IP in System Settings > Wi-Fi > Details). Allow incoming connections if macOS asks. Screens refresh every 5 seconds, so a change on one phone shows on the others.

## Where the OOP is

All money rules live in Java under `backend/src/main/java/com/dormming/domain`. React only shows screens.

| Concept | Where to look |
|---|---|
| **Abstraction** | `transaction/Transaction.java` is abstract. `SharedExpense`, `Bill` and `Payment` extend it, and each one writes its own `describe()` for the activity feed. |
| **Polymorphism** | `split/SplitStrategy.java` has three versions: `EqualSplit`, `CustomSplit` and `ItemizedSplit` (the thermal receipt). `recurrence/Recurrence.java` has `NoRecurrence`, `WeeklyRecurrence` and `MonthlyRecurrence`. `ai/AiAssistant.java` has `DemoAssistant` and `GeminiAssistant`. Storage (`repo/`) and login (`auth/AuthProvider.java`) are interfaces too. |
| **Encapsulation** | `money/Money.java` keeps whole centavos in one private field, so ₱100 ÷ 3 never drifts. `ledger/Ledger.java` is the only class that works out who owes whom. `spending/SpendingReport.java` is built once and read-only. Constructors reject bad input. |
| **Inheritance** | `dorm/DormCreator.java` extends `dorm/DormMember.java` and overrides what a creator may do: edit any record, remove members and make a new code. |

Run the tests with `cd backend && mvn test` (Java) and `cd frontend && npx vitest run` (frontend).

## Money rules

- DormMing records dorm expenses only. Every expense is split among dorm members.
- Dorm spending for a month = shared expenses dated that month + bills due that month. Payments don't count.

- Amounts are in Philippine pesos and stored as centavos.
- When a split is uneven, the extra centavos go to people other than the payer.
- Debts cancel out between two people. If you owe Vince ₱300 and he owes you ₱100, you owe him ₱200.
- A payment can't be more than you owe.
- Bills are paid straight to the provider. Each member marks their own share paid, and bills never show in Balances.
- You can't leave a dorm while you owe or are owed money.

## Design

- Font: SF Pro Rounded on Apple devices (`ui-rounded`); Nunito on Windows and Android (Apple only licenses SF Rounded for its platforms).
- Ming appears chest-up in the app (`public/brand/ming-bust.png`, a crop of the mascot art).
- Layout patterns follow Tarsi's landing page and web sign-in; DormMing keeps its own olive, orange and Ming.

## Supabase and Gemini

Without any keys, the app runs on its own: data is kept in memory, login is handled by the backend, and Ming answers in demo mode.

- **Gemini:** set `GEMINI_API_KEY` before `mvn spring-boot:run`. `GEMINI_MODEL` changes the model (default `gemini-2.5-flash`).
- **Supabase:** planned but not built yet (Task 22 in `docs/superpowers/plans/2026-11-11-dormming.md`).

## Docs

- `PROJECT_BRIEF.md`: the project brief
- `docs/superpowers/specs/2026-11-11-dormming-design.md`: the design
- `docs/superpowers/plans/2026-11-11-dormming.md`: the build plan
