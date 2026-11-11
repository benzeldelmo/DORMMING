# Responsive Redesign and Dorm-Only Expenses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make DormMing dorm-only (no personal expenses), add a monthly dorm spending report, and redesign the app for phone and desktop after Tarsi's layout patterns, with Ming shown chest-up and SF Rounded type.

**Architecture:** Backend: delete `PersonalExpense` end to end; add a read-only `SpendingReport` domain class behind `GET /api/spending`. Frontend: one responsive React app; `AppShell` renders a bottom bar below 1024px and a left sidebar at 1024px and up; pages reflow into a two-column dashboard; auth screens become a split layout; the landing page is rebuilt with stageshow demos.

**Tech Stack:** Existing: Spring Boot 4 / Java 21 / JUnit + AssertJ; React 19 + Vite + Tailwind v4 + shadcn/ui + lucide-react + react-query; stageshow kit in `frontend/src/stageshow/kit`.

**Spec:** `docs/superpowers/specs/2026-11-12-responsive-redesign-design.md` (earlier spec: `docs/superpowers/specs/2026-11-11-dormming-design.md`)

## Global Constraints

- Deadline: Friday, 13 November 2026. Every task leaves the app working.
- Font stack everywhere: `ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif`. Nunito from Google Fonts (weights 400, 600, 700, 800). Poppins removed.
- Ground `#F6F6F3`; white cards, 24px radius, soft offset shadow. Brand: olive `#6B7255`, orange `#DD7B2F`, yellow `#FFDE59`, brown `#240702`.
- Ming inside the app is always chest-up (`MingBust`); the full-body image is not used in the app.
- No Tarsi identity: no green palette, tarsier, Tarsi wording, store badges, or invented social proof.
- Breakpoint: desktop layout at `lg` (1024px) and up; single column below.
- Dorm spending in a month = shared expenses dated in that month + bills due in that month (full amounts); payments excluded.
- Frontend dev server port 5180; backend 8080.
- Disk is near full: keep screenshots small and delete them after viewing.

## Review Focus

1. A brand-new dorm with no expenses → spending card shows ₱0.00 and a friendly empty line, no empty bars or NaN. Test: `SpendingReportTest.emptyMonth` (Task 2) + manual check (Task 4).
2. Resizing across 1024px with a sheet or the add menu open → the open surface follows the new layout without breaking. Manual check (Task 3).
3. Long names (40-char dorm name, 40-char display name) in the sidebar, greeting card and card face → truncate with an ellipsis, no overflow. Manual check (Task 8).
4. Tablet widths 640–1023px → single column, no horizontal scroll. Manual check at 768px (Task 8).
5. "I spent 150 on rice" in a dorm where the user is the only member → a valid shared expense with only the user (no debts). Test: `AssistantTest.soloDormExpense` (Task 1).

---

### Task 1: Remove personal expenses (backend)

**Files:**
- Delete: `backend/src/main/java/com/dormming/domain/transaction/PersonalExpense.java`
- Modify: `domain/transaction/TransactionType.java` (drop `PERSONAL_EXPENSE`), `repo/TransactionRepository.java` + `repo/memory/InMemoryTransactionRepository.java` (drop `personalByUser`), `service/ExpenseService.java` (drop `addPersonal`, `updatePersonal`; `list(UserId, String q)` returns dorm shared expenses only; `delete` handles shared only; `categoryOf` handles `SharedExpense` and `Bill`), `service/ActivityService.java`, `web/ExpenseController.java` (drop `/personal` endpoints and `scope` param; `ExpenseDto.scope` removed), `web/dto/ExpenseDtos.java` (drop `PersonalRequest`), `ai/ActionKind.java` (drop `ADD_PERSONAL_EXPENSE`), `ai/DemoAssistant.java`, `ai/ActionBuilder.java` (drop `personal`), `ai/GeminiAssistant.java` (schema enum and switch), `ai/AssistantService.java`, `seed/DemoSeed.java` (drop Jeep fare)
- Test: update `TransactionTest`, `DormTest` (use a `Payment` for `createdBy`), `ExpenseServiceTest`, `ExpenseApiTest`, `AssistantTest`, `DemoSeedTest`

**Interfaces:**
- Produces: `ExpenseService.list(UserId user, String q): List<SharedExpense>`; `GET /api/expenses?q=` → `[ExpenseDto]` without `scope`; `ActionKind { ADD_SHARED_EXPENSE, CREATE_BILL, RECORD_PAYMENT }`.
- DemoAssistant rule: `spent|bought|paid` + amount, no dormmate named → `ADD_SHARED_EXPENSE`, payer = me, participants = all dorm members in join order (`AssistantContext` gains `List<UserId> memberIdsInJoinOrder`).

- [ ] **Step 1: Update tests first:**
```java
// AssistantTest
var p = ask("I spent 150 on rice").proposal().orElseThrow();
assertThat(p.kind()).isEqualTo(ActionKind.ADD_SHARED_EXPENSE);
assertThat(p.fields()).containsEntry("amountCentavos", 15000L).containsEntry("participantIds", List.of("a", "b", "c")).containsEntry("payerId", "a");
// soloDormExpense: w.dormService.create(w.a, "Solo"); ask(...) → participantIds == List.of("a"); confirm(...) starts with "Saved:"
// ExpenseApiTest: POST /api/expenses/personal → 404 or 405; POST /api/expenses/shared with amountCentavos 0 → 400 "Amount must be more than ₱0.00"
// ExpenseServiceTest.searches: list(w.a, "groc") → ["Grocery"]; list(w.a, "transport") → 1 (the Grab shared expense)
// chatNeverSaves: assert transactions.sharedByDorm(dorm.id()) is empty after chat calls
```
- [ ] **Step 2:** `cd backend && mvn -q test` → compile/test FAIL (old API still present).
- [ ] **Step 3:** Delete and modify per Files.
- [ ] **Step 4:** `mvn -q test` → PASS (all).
- [ ] **Step 5:** Commit `refactor(api): DormMing records dorm expenses only`.

### Task 2: Dorm spending report (backend)

**Files:**
- Create: `domain/spending/SpendingReport.java`, `domain/spending/CategoryTotal.java`, `service/SpendingService.java`, `web/SpendingController.java`
- Modify: `seed/DemoSeed.java`
- Test: `domain/spending/SpendingReportTest.java`, `seed/DemoSeedTest.java`

**Interfaces:**
- Produces:
  - `record CategoryTotal(Category category, Money total)`
  - `final class SpendingReport` — `static SpendingReport of(YearMonth month, List<SharedExpense> expenses, List<Bill> bills)`; `YearMonth month()`, `Money total()`, `List<CategoryTotal> byCategory()` (descending by total, ties by `Category` order).
  - `record SpendingSummary(SpendingReport report, Money previousTotal)`; `SpendingService.summary(UserId user, YearMonth month): SpendingSummary` (dorm via `DormService.require`).
  - `GET /api/spending?month=YYYY-MM` (default current month, `Clock`) → `{ month: "2026-11", totalCentavos, previousTotalCentavos, byCategory: [{ category, label, totalCentavos }] }`; bad month → 400.
  - Seed: create last month's Internet ₱1,500 due `today.minusMonths(1).plusDays(1)` and Water ₱1,000 due `today.minusMonths(1).plusDays(5)`, both MONTHLY; mark every member's share paid; then call `BillService.rollover(dormId, today)` so this month's instances appear by rollover (replaces creating November bills directly).

- [ ] **Step 1: Write failing tests:**
```java
// month = 2026-11; shared: Grocery ₱2,700 FOOD 2026-11-11, Rice ₱2,000 FOOD 2026-11-10, Late ₱500 OTHERS 2026-10-31
// bills: Internet ₱1,500 INTERNET_LOAD due 2026-11-13, Water ₱1,000 RENT_UTILITIES due 2026-11-17, Next ₱900 RENT_UTILITIES due 2026-12-01
var r = SpendingReport.of(YearMonth.of(2026, 11), expenses, bills);
assertThat(r.total()).isEqualTo(Money.ofCentavos(720000));
assertThat(r.byCategory()).extracting(t -> t.category().name(), t -> t.total().centavos())
    .containsExactly(tuple("FOOD_GROCERIES", 470000L), tuple("INTERNET_LOAD", 150000L), tuple("RENT_UTILITIES", 100000L));
// emptyMonth: SpendingReport.of(YearMonth.of(2026, 1), expenses, bills).total() == ZERO and byCategory() isEmpty
// DemoSeedTest: Benzel summary(current month).report().total() == 720000; previousTotal == 250000;
//               home owedToMe 100000, iOwe 90000, banner contains "Internet" (unchanged)
```
- [ ] **Step 2:** `mvn -q test -Dtest='SpendingReportTest,DemoSeedTest'` → FAIL.
- [ ] **Step 3:** Implement per Interfaces.
- [ ] **Step 4:** `mvn -q test` → PASS.
- [ ] **Step 5:** Commit `feat(api): monthly dorm spending report`.

### Task 3: Design tokens, MingBust and responsive shell

Invoke `ui-ux-pro-max:ui-styling` and `impeccable` (read `reference/craft-floor.md`) before editing.

**Files:**
- Modify: `frontend/index.html` (Nunito link replaces Poppins), `src/index.css` (font stack, ground `#F6F6F3` as `--background` for the page, `--card` white, card shadow token `--shadow-card: 0 1px 2px rgb(36 7 2/.04), 0 8px 24px -12px rgb(36 7 2/.12)`), `src/components/AppShell.jsx`, `src/components/BottomNav.jsx` (hidden at `lg`), `src/components/AddRecordSheet.jsx` (`side` prop)
- Create: `src/components/MingBust.jsx`, `src/components/Sidebar.jsx`, `src/lib/useMedia.js`

**Interfaces:**
- `useIsDesktop(): boolean` — `matchMedia("(min-width: 1024px)")`, updates on change.
- `<MingBust mood size className name badge />` — square box `size` px (default 96), `overflow:hidden`, inner `<img src="/brand/ming-mascot.png">` at width `size * 1.55`, centered horizontally, `top: -size * 0.08`, so the head and chest fill the box and the chest meets the bottom edge; mood classes and badge as `Ming.jsx`. `Ming.jsx` stays for the landing page only.
- `Sidebar` (lg only, fixed, 248px): logo; `New` button (opens `AddRecordSheet side="right"`); nav `NavLink`s with icon + label: Home `/home`, Expenses `/expenses`, Bills `/bills`, Balances `/balances`, Ask Ming `/assistant`, My card `/card`; footer: dorm name (truncate) with members' initials, Settings `/settings`.
- `AppShell` outlet context adds `isDesktop`. Main area: `lg:pl-[248px]`, content `mx-auto max-w-[1120px] px-5 lg:px-8`; below lg `max-w-[640px]`.
- [ ] **Step 1:** Implement; `npm run build` → success.
- [ ] **Step 2: Manual check** (screenshots, one at a time, delete after): `/home` at 390 shows bottom bar, no sidebar; at 1280 shows sidebar with active Home, no bottom bar; open New at 1280 → sheet from the right; resize 1280→390 with it open → it still closes cleanly (Review Focus 2).
- [ ] **Step 3:** Commit `feat(web): SF Rounded tokens, MingBust and responsive shell`.

### Task 4: Home redesign

Invoke `impeccable` for the screen.

**Files:**
- Modify: `src/pages/Home.jsx`, `src/lib/dates.js`, `src/lib/dates.test.js` (create)
- Create: `src/components/GreetingCard.jsx`, `src/components/QuickActions.jsx`, `src/components/SpendingCard.jsx`

**Interfaces:**
- `greetingFor(date: Date): "Good morning" | "Good afternoon" | "Good evening"` — before 12:00 morning, before 18:00 afternoon, else evening.
- `GreetingCard({ me, dorm, mood, bubbleText, shareCentavos })`: olive card, `MingBust` (112px phone / 140px desktop) anchored bottom-left flush with the card's bottom edge; `"{greeting}, {firstName}!"` and dorm name; white speech bubble with a tail toward Ming containing the banner text (or mood line) and "Your share: ₱X" when a bill banner exists.
- `QuickActions`: 5 tiles (Add expense, Record payment, Set bill reminder, Split a receipt, Ask Ming) linking to the existing routes; phone: horizontally scrollable row; desktop: 5 equal tiles.
- `SpendingCard`: uses `GET /api/spending`; "Dorm spent" + total (`formatPeso`), change line ("₱5,200 more than last month" / "₱X less than last month" / "Same as last month"), up to 4 category bars (width = share of total, category icon + label + amount) and "Others" for the rest; empty state "No dorm spending yet this month."
- Layout: phone order greeting → quick actions → owed/owe → spending → upcoming bills → recent activity. Desktop: greeting + quick actions full width; then `grid lg:grid-cols-[1fr_380px]`, left: owed/owe, spending; right: upcoming bills, recent activity.
- [ ] **Step 1: Failing test** `dates.test.js`: `greetingFor(new Date(2026,10,12,8))` → "Good morning"; `14` → "Good afternoon"; `20` → "Good evening".
- [ ] **Step 2:** `npx vitest run` → FAIL. **Step 3:** Implement. **Step 4:** vitest PASS, build OK.
- [ ] **Step 5: Manual check** as Benzel at 390 and 1280: Ming chest-up in the greeting card; bubble says "Your Internet is due tomorrow!" with "Your share: ₱500.00"; spending shows ₱7,200.00 and "₱4,700 more than last month"; owed ₱1,000 / owe ₱900. New dorm user: spending empty state (Review Focus 1).
- [ ] **Step 6:** Commit `feat(web): Home greeting card, quick actions and dorm spending`.

### Task 5: Auth and setup split layout

**Files:**
- Modify: `src/components/AuthFrame.jsx`, `src/pages/ProfileSetup.jsx`, `src/pages/DormSetup.jsx`, `src/components/AppShell.jsx` (`Column` replaced by `AuthFrame` usage)

**Interfaces:**
- `AuthFrame({ title, subtitle, children, footer, eyebrowless })`: `lg`: `grid-cols-2` full height; left panel olive with a soft dotted pattern (CSS radial-gradient dots in `--olive-soft` at 8% opacity), `MingBust` 220px, logo, tagline "Your dorm's money, in one place."; right panel white with the form column max 400px, vertically centered. Below `lg`: olive patterned background; white rounded-[28px] card (max 440px) with `MingBust` 96px overlapping the card's top edge.
- Profile and Dorm setup render inside `AuthFrame` (setup's "Step 1 of 2" stays as plain text above the title).
- [ ] **Step 1:** Implement; build OK.
- [ ] **Step 2: Manual check:** `/signup` and `/login` at 390 and 1280; created-dorm QR view at 1280 fits without scrolling.
- [ ] **Step 3:** Commit `feat(web): split-screen sign-up, log-in and setup`.

### Task 6: Reflow remaining pages; remove personal from the frontend

**Files:**
- Modify: `src/pages/Expenses.jsx` (no scope toggle; `/expenses?q=`), `src/pages/AddExpense.jsx` (no Personal tab; always shared), `src/lib/people.js` (no personal branch), `src/components/Rows.jsx` (activity icons without personal), `src/pages/Bills.jsx`, `src/pages/Balances.jsx`, `src/pages/Activity.jsx`, `src/pages/Card.jsx`, `src/pages/Assistant.jsx` (bubbles use `MingBust` 36px), `src/pages/Settings.jsx`, `src/pages/RecordPayment.jsx`, `src/pages/AddBill.jsx`, `src/pages/Receipt.jsx`, `src/components/PageHeader.jsx`, `src/components/DigitalCard.jsx` (watermark uses `MingBust`), `src/components/BalanceCard.jsx`
- Test: none new (UI); existing vitest must pass.

**Interfaces:**
- Detail sheets (`Expenses`, `Bills`) use `side={isDesktop ? "right" : "bottom"}`; right sheets `w-[420px]`.
- Forms (`AddExpense`, `AddBill`, `RecordPayment`, `Settings`): `mx-auto max-w-[560px]`. `Receipt`: at `lg`, `grid-cols-[1fr_380px]` with the receipt preview sticky on the right.
- `PageHeader` hides the back button at `lg` for top-level pages (Expenses, Bills, Balances, Activity, Card, Assistant).
- `Balances`: owed/owe cards in a 2-column grid at all widths, debts below; at `lg` content max 760px.
- [ ] **Step 1:** Implement; `npx vitest run && npm run build` → PASS.
- [ ] **Step 2: Manual check** at 390 and 1280: Expenses list + right sheet; Add expense has no Personal tab and saves; Receipt side-by-side at 1280; Assistant shows chest-up Ming.
- [ ] **Step 3:** Commit `feat(web): desktop layouts for every page; dorm-only expenses`.

### Task 7: Landing page rebuild with stageshow demos

Invoke `stageshow`, then `impeccable`.

**Files:**
- Modify: `src/pages/Landing.jsx`, `src/landing/HeroDemo.tsx`, `src/landing/hero-demo.css`, `src/landing/REHEARSAL.md`
- Create: `src/landing/DesktopDemo.tsx`, `src/landing/FeatureStills.tsx`, `src/landing/desktop-demo.css`

**Interfaces:**
- `HeroDemo`: Home screen rebuilt to Task 4's layout (greeting card with chest-up Ming and speech bubble, quick-action row, owed/owe cards). Story unchanged (+ → Add expense → ₱300 split with Vince → Owed to you ₱1,000 → ₱1,150, Ming celebrates; Vince's ₱150 banner resets). Ming chest-up peeks over the phone's top-right edge on the landing (outside the Stage, absolutely positioned).
- `DesktopDemo`: `Window` (title-less app chrome) with the sidebar dashboard at 960×560 (compact 358 wide shows the main column only); one beat: the Internet bill's "I paid my share" pressed, the bubble changes from the bill reminder to the mood line, the bill row leaves the Upcoming list.
- `FeatureStills`: three still `Stage`s (no script) 360×240: `ReceiptStill` (thermal receipt with three shares), `BillStill` (Internet bill row with "Tomorrow • Your share ₱500.00" and a reminder bell), `ChatStill` (user bubble "I spent 150 on rice" + Ming confirm card).
- `Landing` sections in order: nav (logo, Features `#features`, How it works `#how`, Log in, dark "Sign up" pill `bg-[#1c1b17]`); hero (headline "Your dorm's [gastos], sorted." with "gastos" in a yellow sticker highlight; subline with inline icon chips: Split [ShoppingBasket groceries], track [CalendarDays bills], and see [Wallet who owes whom]; Get started + Log in; `HeroDemo`); three white feature cards each topped by a FeatureStill (Split a receipt / Bills and reminders / Ask Ming); "DormMing on the web, too." wide card with copy left and `DesktopDemo` right; How it works receipt (existing); closing card "Start your dorm today." + Sign up; brown footer with logo, one-line description, link columns (Product: Features, How it works; Account: Sign up, Log in) and "© 2026 MING Dynasty · IT 2107 · OOP 101".
- [ ] **Step 1:** Implement; build OK.
- [ ] **Step 2: Rehearse:** if `df` shows ≥ 4 GB free, run the stageshow `film.mjs --gate` on HeroDemo and DesktopDemo; otherwise capture 4 beat stills at 1280 and 390 and note it in `REHEARSAL.md`.
- [ ] **Step 3: Manual check:** landing at 390 and 1280, no horizontal scroll, hero demo loop and banner hide correctly.
- [ ] **Step 4:** Commit `feat(web): landing page rebuilt with phone, desktop and feature demos`.

### Task 8: Polish, docs and verification

**Files:**
- Modify: any page flagged; `README.md` (dorm-only, spending report, desktop layout, font note); `PROJECT_BRIEF.md` §11 Decisions (dorm-only expenses; responsive redesign after Tarsi's patterns)
- [ ] **Step 1:** `impeccable` critique pass at 390, 768 and 1280 on Home, Expenses, Add expense, Bills, Balances, Sign up, Landing; fix in-scope findings. Check Review Focus 3 (set a 40-char dorm name and display name in Settings) and 4 (768px, no horizontal scroll).
- [ ] **Step 2:** `cd backend && mvn -q test` and `cd frontend && npx vitest run && npm run build` → all PASS.
- [ ] **Step 3:** Commit `docs: dorm-only and responsive redesign notes`.
