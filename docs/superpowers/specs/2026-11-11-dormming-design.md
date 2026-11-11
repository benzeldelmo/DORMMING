# DormMing: Design

Date: 11 November 2026
Source brief: `PROJECT_BRIEF.md` (same folder root)
Brand files: `~/Desktop/DORMMING/`

## 1. Intent and why

DormMing is the OOP 101 final project of MING Dynasty, Team 3 (IT 2107). It is a phone-first web app where dormmates record personal and shared expenses, split bills, track who owes whom, and settle up. Ming, a pixel-art orange cat, gives the app its personality. A Gemini assistant helps record entries.

The grade depends on applying OOP concepts in Java. The Java backend is therefore the heart of the system: every rule about money lives in Java classes that show abstraction, inheritance, polymorphism and encapsulation. The frontend presents screens; it never computes balances.

## 2. Goals, non-goals, anti-goals

**Goals**
- All 13 features from the brief work in a laptop demo on Friday, 13 November 2026.
- The Java code clearly shows the four OOP pillars, in classes a grader can read.
- The UI follows the brand guide and the 7 mockup screens.

**Non-goals**
- Public hosting. The demo runs on the team's laptop (`localhost`).
- Real money: no deposits, withdrawals, bank links or card issuance.
- Native mobile apps.

**Anti-goals (failure even if it "works")**
- Balances that drift by a centavo, or totals that don't add up.
- The AI assistant saving or changing a record without the user confirming.
- Java reduced to a thin pass-through while React or SQL holds the logic.
- A demo that breaks because a feature half-works. A feature that isn't solid by Thursday night is hidden, not shown broken.

## 3. Constraints

- Deadline: Friday, 13 November 2026. About 2 working days.
- Machine: macOS, Java 27 (OpenJDK), Maven 3.10, Node 24, npm 11. No Docker, no Supabase CLI, no `psql`.
- Supabase: a free hosted project (cloud). The team must create it and supply the URL, anon key, JWT secret and Postgres connection string.
- Gemini: the team must supply an API key. Without one, a demo assistant answers instead (see 7.2).
- The Gemini key and database password stay in the Java backend's environment, never in React code.

## 4. Approaches

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | React → Java (Spring Boot) REST API → Supabase Postgres. Supabase Auth for login; Java verifies the token on every request. Supabase Realtime only signals "something changed" so screens refetch from Java. | Most code, but every feature runs through Java classes and Supabase is used as the brief says. |
| B | Same as A with a local database file instead of Supabase. | Fastest start, but drops Supabase, no cross-device sync, hand-built login. |
| C | React reads and writes Supabase directly; Java does only splits, balances and AI. | Least code, but Java shrinks to a few classes: weak for an OOP grade. |

The team picked **A** because the grade is about Java and OOP, and the brief names Supabase.

## 5. Architecture

```
Phone / laptop browser
  React app (Vite)  ──login──▶  Supabase Auth
        │  REST + JWT                ▲
        ▼                            │ verifies JWT
  Java backend (Spring Boot, localhost:8080)
        │  JDBC                      
        ▼                            
  Supabase Postgres  ──change signal──▶ React (Supabase Realtime)
        
  Java backend ──▶ Google Gemini API
```

- **Frontend:** `~/DormMing/frontend`. React + Vite, Tailwind CSS, shadcn/ui components, Lucide icons. Talks to Supabase only for login and realtime signals; all data goes through the Java API.
- **Backend:** `~/DormMing/backend`. Spring Boot, Maven, Java 21 language level (runs on the installed Java 27). Spring Security resource server checks the Supabase JWT. Data access through plain JDBC (`JdbcTemplate`) behind repository interfaces.
- **Database:** Supabase Postgres. Tables mirror the Java classes one to one. Schema kept as SQL files in `backend/src/main/resources/db/`.
- **Demo setup:** two terminals, `npm run dev` and `mvn spring-boot:run`. Phones on the same Wi-Fi can open the laptop's address to show realtime sync.

## 6. Java domain model (OOP)

Package `com.dormming`. The grader-facing classes live in `com.dormming.domain`.

### 6.1 Abstraction
- `abstract class Transaction`: `id`, `Money amount`, `LocalDate date`, `UserId createdBy`, `String note`; abstract `String describe()`, abstract `TransactionType type()`.
- Subclasses: `PersonalExpense`, `SharedExpense`, `Bill`, `Payment`.
- Activity History is a `List<Transaction>` rendered through `describe()`.

### 6.2 Polymorphism
- `interface SplitStrategy { Map<UserId, Money> split(Money total, List<UserId> people); }`
  - `EqualSplit`: total ÷ people, leftover centavos handled by the rounding rule (section 8).
  - `ItemizedSplit`: thermal receipt. Holds `List<ReceiptItem>` (name, price, who shares it). Each person pays for their items; shared items split equally among their sharers.
  - `CustomSplit`: amounts typed per person; must sum to the total.
- `interface Recurrence { LocalDate next(LocalDate from); }` with `NoRecurrence`, `WeeklyRecurrence`, `MonthlyRecurrence`.
- `interface AiAssistant` with `GeminiAssistant` and `DemoAssistant`.
- Repository interfaces (`ExpenseRepository`, `BillRepository`, …) with JDBC implementations.

### 6.3 Encapsulation
- `final class Money`: stores `long centavos`. Methods `plus`, `minus`, `times`, `divideEvenly(int)` returning parts that sum exactly. Never `double`. Rejects negative values where they make no sense.
- All fields private. Constructors validate: positive amounts, at least one person in a split, custom splits summing to the total, due date present on bills.
- `Ledger`: the only class that computes balances between members. Input: a dorm's shared expenses and payments. Bills are not debts between members (see section 8). Output: per-pair debts, "owed to you" and "you owe" totals, and a simplified settle-up list.

### 6.4 Inheritance
- `class DormMember`: user, dorm, joined date; can add expenses and record payments.
- `class DormCreator extends DormMember`: adds `invite()`, `removeMember()`, `editAnyRecord()`, `regenerateInviteCode()`.
- `class User`: profile (display name, avatar, card colour), friends.

### 6.5 Other domain classes
- `Dorm`: name, invite code, members.
- `MingMood` (enum + `static MingMood from(Ledger, List<Bill>)`): `HAPPY` (nothing owed), `WORRIED` (you owe, or a bill is due within 2 days), `CELEBRATING` (just settled up), `SLEEPY` (no activity in 7 days).
- `DigitalCard`: front (name, dorm, masked member number, net balance), back (QR payload for adding a friend).

### 6.6 Tests
JUnit tests for `Money`, all three `SplitStrategy` classes, `Recurrence`, `Ledger` and `MingMood`. These hold the money rules, so they are written first (test-driven).

## 7. Features

| # | Feature | Backend | Frontend |
|---|---|---|---|
| 1 | Authentication | Verify Supabase JWT; create `User` row on first request | Sign up, log in, forgot password (Supabase Auth email), profile edit |
| 2 | Dorm management | Create dorm, 6-character invite code, join by code, leave, remove member | Create/join screens; QR shows a join link; typing the code always works; camera scan if time allows |
| 3 | Digital financial card | `DigitalCard` endpoint | Bank-style card in brand colours; tap to flip; back shows the user's QR; scanning or opening it sends a friend request |
| 4 | Personal expenses | `PersonalExpense` CRUD, categories | Add expense (Personal tab) per mockup |
| 5 | Shared expenses | `SharedExpense` with a `SplitStrategy` | Add expense (Shared tab): payer, people, split type |
| 6 | Thermal receipt | `ItemizedSplit` | Receipt-styled screen: monospace items, dashed rules, per-person totals, "torn" edge |
| 7 | Bill management | `Bill` with due date, `Recurrence`, a `SplitStrategy` that sets each member's `BillShare`; each member marks their own share paid | Bills screen (Paid / Upcoming) per mockup; "Your share" per bill; set bill reminder |
| 8 | Payment tracking | `Payment` (full or partial) feeds `Ledger` | Record payment sheet; Balances screen (owed to you / you owe / settle-up list) |
| 9 | AI assistant | `AiAssistant` turns a message into a proposed action or an answer | Chat screen; proposed actions show as a card with Confirm / Cancel; nothing saves without Confirm |
| 10 | Ming mascot | `MingMood`; user's Ming name stored on `User` | Ming on Home with a mood line. Moods use the one existing image plus motion (bounce, tilt, sway) and a small mood badge, no new art. Customization: the user renames their Ming (default "Ming"). |
| 11 | Activity history | List of `Transaction` via `describe()` | Recent activity on Home; full list with filters |
| 12 | Cloud sync | Writes to Supabase Postgres | Supabase Realtime change signal triggers a refetch |
| 13 | Landing page | — | Public page: logo, Ming, features, animated phone demo (stageshow), sign-up button |

### 7.1 Expense categories
Food & Groceries, Rent & Utilities, Internet & Load, Transportation, School, Personal Care, Health, Leisure, Others.

### 7.2 AI assistant behaviour
- Supported intents: add personal expense, add shared expense, create bill, record payment, "who owes me?", "what's due this week?", small talk as Ming.
- Gemini is asked for structured JSON (intent + fields). Java validates it with the same constructors as manual entry, then returns a proposal. The user confirms in the UI; only then does Java save.
- Without a `GEMINI_API_KEY`, `DemoAssistant` handles the same intents with simple keyword rules and labels its replies "demo mode".

## 8. Money rules

- Currency: Philippine peso (₱) only, shown as `₱1,000.00`. (Per the mockups.)
- Uneven equal splits: leftover centavos go one each to the people other than the payer, in member-join order, so the payer never pays more than their share. *(My call.)*
- Paying a debt: the person who owes records the payment; it counts immediately and the receiver sees it in their activity. *(My call: keeps the demo simple; no confirm step.)*
- Partial payments reduce the debt; the rest stays open.
- Leaving a dorm: blocked while the member has an unsettled balance in that dorm. *(My call.)*
- Edit and delete: the record's creator or the dorm creator. *(My call.)*
- Bills: each member pays their own share straight to the landlord or provider, then marks that share paid in the app. Bills never create debts between members and never appear in Balances. A share can only be fully paid or unpaid. *(Team's decision.)*
- Overdue shares stay open on that bill and show as overdue until marked paid. *(My call.)*
- Recurring bills: when every share of a bill instance is paid, or its due date passes, the next instance is created from its `Recurrence`.
- One dorm per user at a time. A user must leave their dorm before creating or joining another. *(My call: no dorm switcher, every screen has one clear dorm.)*
- Settle-up: debts are netted only within each pair (if A owes B ₱300 and B owes A ₱100, A owes B ₱200). No re-routing through third people. A payment names who it is to and reduces that pair's debt. Paying more than the open debt is rejected. *(My call.)*
- Thermal receipt extras: one optional "extras" line (tax, service charge, tip; negative for a discount) is split in proportion to each person's items. Items plus extras must equal the receipt total exactly. *(My call.)*
- Friends: scanning or opening a card's QR connects both users at once, no accept step. Friends see each other's card and can invite each other to their dorm. No shared expenses outside a dorm. *(My call.)*
- Bill reminders: in-app only. A bill stores "remind me N days before" (default 1). Due bills show as the Ming banner on Home and highlighted in Bills. No email or push. *(My call.)*
## 8a. Running without Supabase or Gemini

The team has no Supabase project or Gemini key yet. The build starts without them and switches over when they arrive. *(Team's decision; the mechanism below is my call.)*

- Spring profile `local` (default): in-memory repositories behind the same repository interfaces; data resets on restart and demo seed data reloads.
- Login in `local`: an `AuthProvider` interface. `LocalAuthProvider` stores BCrypt-hashed passwords in memory and has Java sign its own JWT. `SupabaseAuthProvider` verifies Supabase-issued JWTs. The React login screen calls one small auth module, so only that module changes.
- Sync in `local`: React polls the API every 5 seconds instead of Supabase Realtime.
- Profile `supabase`: JDBC repositories, Supabase Auth, Realtime. Switched on by setting the Supabase environment variables.
- AI: `DemoAssistant` until `GEMINI_API_KEY` is set, then `GeminiAssistant`.

## 9. Frontend design

- Brand: olive `#6B7255` (primary), orange `#DD7B2F` (accent, bills, "you owe"), yellow `#FFDE59` (logo, highlights), dark brown `#240702` (logo outline). Fonts: Poppins for headings; body uses `ui-rounded` (SF Pro Rounded on Apple devices) with Poppins as fallback.
- Layout: phone first, max content width about 480px, centred on desktop. Bottom nav: Home, Expenses, + (Add a record sheet), Bills, Balances. Settings via the gear icon.
- Screens in the mockups are matched closely: Home, Expenses, Add a record, Add expense, Bills, Balances, Settings.
- New screens drawn in the same style: Landing, Sign up, Log in, Forgot password, Profile setup, Create / Join dorm, Dorm dashboard, Thermal receipt, Record payment, Set bill reminder, Digital card, AI chat, Activity history, Ming customization.
- Skills used during the build: `ui-ux-pro-max:ui-styling` (Tailwind + shadcn/ui components), `impeccable` (screen design, critique and polish), `stageshow` (animated product demo on the landing page).
- Assets: `dormming-logo.png`, `ming-mascot.png` copied into `frontend/public/brand/`.

## 10. Open items for the team

- Supabase project credentials (URL, anon key, JWT signing method, Postgres connection string) and a Gemini API key. Not needed to start (section 8a).

## 11. Build order

Each step ends in something demoable, so a slip late in the week still leaves a working app.

1. Backend skeleton, `Money`, split strategies, `Ledger` with tests; Supabase schema; JWT check. Frontend skeleton with brand tokens, bottom nav, login/sign-up.
2. Dorm create/join, Home, Expenses, Add expense (personal + shared), Activity history.
3. Bills with recurrence, Record payment, Balances.
4. Thermal receipt, Digital card + friends, Ming moods and customization.
5. AI assistant, Landing page with stageshow demo, realtime refresh.
6. Polish pass (impeccable), demo data seed, rehearse the demo.

## 12. Left to the builder

- Exact Spring Boot and library versions.
- REST endpoint naming and JSON shapes.
- Folder layout inside `frontend/src` and `backend/src`.
- Seed data for the demo dorm.
