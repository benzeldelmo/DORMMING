# DormMing: Responsive Redesign and Dorm-Only Expenses

Date: 12 November 2026
Builds on: `2026-11-11-dormming-design.md` (branch `feat/dormming-mvp`, tasks 1–21 done)
Reference product for layout and system: Tarsi (https://www.tarsi.cloud landing, https://web.tarsi.cloud sign-in)

## 1. Intent and why

The team wants DormMing to look and work like a polished product on both phones and laptops, using Tarsi's layout and design-system patterns as the model: its landing structure, its split sign-in screen, and its app layout with a mascot greeting card. The OOP grade still depends on the Java backend, so backend changes stay small and keep the four pillars visible.

Three content changes come with it:
- **Dorm-only expenses.** DormMing records what the dorm spends ("gastos"), not personal spending. Personal expenses are removed everywhere. *(Team's decision: option A.)*
- **Ming shown chest-up**, not full body, wherever Ming appears in the app, especially the greeting card at the top of Home.
- **Font:** SF Pro Rounded (SF Rounded) everywhere.

## 2. Goals, non-goals, anti-goals

**Goals**
- Every screen works at 375px phone width and at 1280px+ desktop width, with a real desktop layout (not a phone column in the middle).
- Landing, sign-up/log-in and app shell follow Tarsi's patterns, in DormMing's own brand.
- Home shows the dorm's spending this month as a main card (after the greeting, quick actions and owed/owe). *(My call: the owed/owe cards stay right under the greeting, as in the mockups.)*
- Stageshow demos on the landing page show the new Home on a phone and the desktop dashboard.

**Non-goals**
- Supabase/Gemini switch-over (still deferred).
- Dark mode. New mascot artwork. Google/Apple sign-in (DormMing keeps email and password).

**Anti-goals**
- Copying Tarsi's identity: no green palette, no tarsier, no Tarsi wording, no store badges, no invented social proof (download counts, reviews, "#1" claims).
- Breaking the Friday demo: every step must leave the app working.

## 3. Constraints

- Deadline: Friday, 13 November 2026.
- SF Pro Rounded may only be used on Apple platforms. The stack is `ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif`: Apple devices render the real SF Rounded; Windows and Android get Nunito (Google Fonts) as the closest rounded match. Poppins is dropped.
- Only one mascot image exists (`ming-mascot.png`, 512×512 pixel art). Chest-up is a crop of it, not new art.
- Disk on the build laptop is near full (about 2 GB free): keep screenshots and stageshow filming small.

## 4. Approaches

| | Approach | Trade-off |
|---|---|---|
| **1 (chosen)** | One responsive React app: the shell switches from bottom bar (phone) to left sidebar (desktop); pages reflow into a two-column dashboard on desktop. | One codebase; least work for a real desktop layout. |
| 2 | Separate desktop versions of each page. | Richer desktop, but double the screens; no time before Friday. |
| 3 | Phone column centered on desktop with art around it. | Fastest, but desktop is not really supported. |

## 5. Backend changes (Java)

### 5.1 Remove personal expenses
- Delete `PersonalExpense`, `TransactionType.PERSONAL_EXPENSE`, `TransactionRepository.personalByUser`, `ExpenseService.addPersonal/updatePersonal`, `POST/PUT /api/expenses/personal`, and the `scope` filter on `GET /api/expenses` (all expenses are dorm expenses; `q` search stays).
- `ActivityService.recent` lists only dorm records (shared expenses, payments, bills).
- AI assistant: `ADD_PERSONAL_EXPENSE` is removed. "I spent 150 on rice" with no names becomes `ADD_SHARED_EXPENSE` split equally among **all** dorm members with the user as payer. Named dormmates ("split with Vince") still limit the split to those people plus the user.
- Seed: drop the "Jeep fare" personal expense. Mockup numbers (₱1,000 owed / ₱900 owe) stay. Add last month's Internet (₱1,500) and Water (₱1,000) bills, fully paid and already rolled over, so "vs last month" has a real baseline without touching balances (bills never create debts). This month then totals ₱7,200 (₱2,000 + ₱2,700 shared, ₱1,500 + ₱1,000 bills) against ₱2,500 last month. *(My call.)*
- Tests that covered personal expenses are rewritten for shared expenses or removed with the feature.

### 5.2 Dorm spending report (new)
- `domain/spending/SpendingReport` (encapsulation: built once, read-only): for one dorm and one month, the total spent and the total per `Category`, sorted largest first, plus the previous month's total for comparison.
- What counts as dorm spending in a month: shared expenses dated in that month (full amount) plus bills due in that month (full amount). Payments are not spending.
- `GET /api/spending?month=YYYY-MM` (default: current month) → `{ month, totalCentavos, previousTotalCentavos, byCategory: [{ category, label, totalCentavos }] }`.
- JUnit tests for the report (totals, category grouping, month boundaries, empty month).

## 6. Frontend design system

- **Ground and surfaces (from Tarsi):** page ground off-white `#F6F6F3`; content in white cards with 24px radius and a soft, offset shadow; small, precise type; generous spacing between groups.
- **Brand (unchanged):** olive `#6B7255` primary, orange `#DD7B2F` accent, yellow `#FFDE59` highlight, brown `#240702` for the logo outline and the footer.
- **Type:** SF Rounded stack above for everything; weights 400/600/700/800; headings tight (-0.02em). Numbers use tabular figures.
- **Inline chips (from Tarsi's hero):** small rounded pills with an icon inside sentences, used in the landing hero and empty states.
- **`MingBust` component:** the mascot cropped to head and chest (show the top ~62% of the art, scaled up so the chest sits at the container's bottom edge, `object-position: top`). Used on the Home greeting card, the desktop sidebar, auth screens, chat avatars, the card watermark and the setup screens. Moods (motion + badge) work the same as today. The full-body image is no longer used inside the app.

## 7. App layout

### 7.1 Shell
- **Phone (< 1024px):** today's bottom bar and "Add a record" bottom sheet. Content column max 640px.
- **Desktop (≥ 1024px):** fixed left sidebar 248px: logo, a "New" button (opens the same Add-a-record choices as a menu), nav items with icon and label (Home, Expenses, Bills, Balances, Ask Ming, My card), dorm name with member avatars at the bottom, and the settings link. Main area max 1120px with 32px gutters.
- Detail sheets (expense, bill) open from the bottom on phone and from the right on desktop.
- Forms (Add expense, Split a receipt, Set bill reminder, Record payment, Settings) are a single centered column (max 560px) on desktop; the receipt screen shows the editor and the receipt preview side by side on desktop.

### 7.2 Home
- **Greeting card (top, full width):** olive card; Ming chest-up anchored to the card's bottom-left edge; "Good evening, Benzel!" (time-of-day greeting) with the dorm name; a white speech bubble from Ming with the bill reminder or mood line ("Your Internet is due tomorrow. Your share: ₱500.00").
- **Quick actions row** (from Tarsi): Add expense, Record payment, Set bill reminder, Split a receipt, Ask Ming, as icon tiles.
- **Owed to you / You owe** cards.
- **Dorm spending this month:** total, change vs last month, and a category bar list (top 4 categories, the rest grouped as Others).
- **Upcoming bills** and **Recent activity** lists.
- Desktop arrangement: greeting card and quick actions span the top; below, left column (owed/owe, dorm spending) and right column (upcoming bills, recent activity). Phone: the same blocks stacked in that order.

### 7.3 Other pages
- Expenses: search plus the list (no Personal/Shared toggle). Tapping an expense opens its detail sheet (bottom on phone, right side on desktop), the same as Bills. *(My call: one sheet pattern, no two-pane page.)*
- Bills, Balances, Activity, Card, Assistant, Settings: same content, reflowed into the shell; Balances shows its two cards side by side and the debts list below on all widths.

## 8. Sign-up, log-in and setup (from Tarsi web sign-in)
- **Desktop:** split screen. Left half: an olive art panel (soft pattern, Ming chest-up large, the DormMing logo, the tagline "Your dorm's money, in one place."). Right half: the form, max 400px, with a small label above the heading ("DormMing for web" style is not used; just the heading and subtitle).
- **Phone:** the olive art panel fills the background; the form sits in a white rounded card over it with Ming chest-up peeking over the card's top edge.
- Applies to Sign up, Log in, Forgot, Reset, Profile setup and Dorm setup.

## 9. Landing page (structure from Tarsi, brand from DormMing)
1. Nav: logo, Features, How it works, Log in, and a dark "Sign up" pill.
2. Hero: headline with an inline highlight ("Your dorm's [gastos], sorted."), a subline with inline icon chips ("Split [groceries], track [bills], and see [who owes whom]"), Get started and Log in buttons. Right: the stageshow phone demo (updated to the new Home), with Ming chest-up peeking over the phone's edge.
3. Three feature cards (white, 24px radius), each topped with a small stageshow still: Split a receipt, Bills and reminders, Ask Ming.
4. "DormMing on the web, too": a wide card with copy on the left and a stageshow desktop window showing the dashboard on the right.
5. How it works: the existing thermal receipt.
6. Closing card: "Start your dorm today." with the Sign up button.
7. Dark footer (brown `#240702`): logo, short description, link columns (Product, Account), "© 2026 MING Dynasty · IT 2107 · OOP 101".

## 10. Stageshow work
- **Hero phone demo:** rebuilt on the new Home (greeting card with Ming chest-up and speech bubble, quick actions, owed/owe). Story unchanged: add a ₱300 dorm expense, "Owed to you" rolls up, Ming celebrates, Vince's payment resets the loop.
- **Desktop window demo:** a `Window` with the sidebar dashboard; one short beat (a bill marked paid, the reminder bubble clears).
- **Three feature stills** for the feature cards.
- Rehearse with the stageshow film `--gate` if disk allows; otherwise stills at 1280 and 390, noted in `REHEARSAL.md`.

## 11. Build order
1. Backend: remove personal expenses; add `SpendingReport` and `/api/spending`; update assistant and seed; tests green.
2. Design tokens and font stack; `MingBust`; responsive shell (sidebar + bottom bar).
3. Home redesign (greeting card, quick actions, spending, two-column desktop).
4. Auth and setup screens (split layout).
5. Reflow remaining pages for desktop; remove the Personal tab and scope toggle.
6. Landing page rebuild with the stageshow demos.
7. Polish pass at 375 and 1280 with impeccable; full test run; README and brief updated.

## 12. Left to the builder
- Exact breakpoints between 640 and 1024 (tablet) behavior, within "single column below 1024".
- Pattern used in the olive art panel.
- Icons for nav and quick actions (Lucide).
- Which three stageshow stills best show each feature.
