# DormMing: Project Brief

- **Project type:** Online dorm finance management web app
- **Team:** MING Dynasty, Team 3
- **Section:** IT 2107
- **Course:** OOP 101, Object-Oriented Programming

## 1. Project overview

DormMing is an online dorm companion for managing expenses, splitting bills, tracking payments, and organizing dorm finances.

Users can create or join dorms, connect with friends, manage shared expenses, and use an AI Assistant for everyday financial tasks.

Powered by Ming, a customizable cat mascot.

## 2. Problem

Dormmates rely on group chats, notes, and manual calculations to manage shared expenses. Tracking payments, splitting bills, and identifying unpaid balances becomes confusing and time-consuming.

## 3. Proposed solution

A centralized dorm finance platform for personal expenses, shared bills, payments, and roommate collaboration.

A Gemini-powered AI Assistant simplifies expense recording, bill creation, payment monitoring, and everyday queries.

## 4. Target users

- College students
- Dorm residents
- Roommates
- Boarding-house tenants

### User roles

| Role | What they do |
|------|--------------|
| User | Manages profile, expenses, and connections. |
| Dorm Member | Participates in shared expenses and payments. |
| Dorm Creator | Creates dorms, invites members, and manages dorm activities. |

## 5. Core features

1. **Authentication:** Register, log in, and manage profiles.
2. **Dorm Management:** Create dorms, invite members, join via QR or code.
3. **Digital Financial Card:** Virtual bank-style card with flip-to-reveal personal QR for connecting with friends.
4. **Personal Expenses:** Record and categorize individual spending.
5. **Shared Expenses:** Split expenses among dormmates.
6. **Thermal Receipt:** Receipt-inspired bill splitting with itemized costs and individual shares.
7. **Bill Management:** Create bills, set due dates, and manage recurring payments.
8. **Payment Tracking:** Monitor debts, partial payments, and settlements.
9. **AI Assistant:** Add expenses, create bills, monitor payments, and chat using Gemini.
10. **Ming Mascot:** Customizable cat mascot with status-based expressions.
11. **Activity History:** Track expenses, bills, and payments.
12. **Cloud Synchronization:** Online database and cross-device updates.
13. **Landing Page:** Introduce DormMing, showcase features, and support registration.

## 6. Technology stack

| Technology | Purpose |
|------------|---------|
| React | Frontend |
| Java | Backend |
| Supabase | Authentication, database, storage, realtime |
| Google Gemini | AI Assistant |
| Vercel | Frontend hosting |

## 7. Main user flow

1. Visit landing page.
2. Create account or log in.
3. Set up personal profile.
4. Create a dorm or join an existing one.
5. Join via QR code or invitation code.
6. Access dorm dashboard.
7. Manage expenses, bills, and payments.
8. Split bills through the thermal receipt interface.
9. Use the AI Assistant for financial tasks.
10. Connect with friends through digital cards and QR codes.

## 8. Expected impact

- Simplify dorm financial management.
- Reduce manual calculations.
- Improve payment transparency.
- Encourage financial accountability.
- Make roommate collaboration easier.
- Automate routine financial tasks through AI.

## 9. Scope and limitations

- Online, account-based platform.
- Cloud-stored and synchronized records.
- AI-assisted financial management.
- Simulated banking experience only.
- No actual deposits, withdrawals, bank accounts, or money transfers.
- No real banking card issuance.

## 10. Brand and design

- **Brand files:** `~/Desktop/DORMMING/` (`ASSETS/dormming-logo.png`, `ASSETS/ming-mascot.png`, `BRANDING-GUIDE/1.png` to `3.png`)
- **Figma:** https://www.figma.com/design/MxvMGoJgvO3VadAOF8PlTx/Untitled?node-id=0-1
- **Mascot:** Ming, a pixel-art orange tabby cat in a green hoodie with a backpack and dorm ID, winking and waving.
- **Logo:** "DormMing" in rounded bold letters, yellow fill, dark brown outline, arched.

| Color | Hex | Use |
|-------|-----|-----|
| Olive green | `#6B7255` | Primary, buttons, "owed to you" |
| Orange | `#DD7B2F` | Accent, bills, "you owe" |
| Yellow | `#FFDE59` | Logo, highlights |
| Dark brown | `#240702` | Logo outline |

- **Fonts:** Poppins (headings), SF Pro Rounded (body)
- **Icons:** Lucide
- **Layout:** Phone first. Bottom nav: Home, Expenses, add (+), Bills, Balances. Settings from the gear icon.
- **Designed screens:** Home (Ming greeting, bill alert, owed to you and you owe cards, upcoming bills, recent activity), Expenses (search and list), Add a record sheet (add expense, record payment, set bill reminder), Add expense (personal or shared, amount, category, notes, date), Bills (paid and upcoming), Balances, Settings.
- **Expense categories:** Food & Groceries, Rent & Utilities, Internet & Load, Transportation, School, Personal Care, Health, Leisure, Others.

## 11. Decisions

- **Deadline:** Friday, 13 November 2026.
- **Demo scope:** All 13 core features.
- **Backend:** Java is required by the course. Java holds the core logic as classes (splitting, balances, payments, Gemini calls). Supabase provides login, database, storage and realtime.
- **Mascot:** Ming is a cat.
- **Starting point:** Designs exist. Code lives in `~/DormMing` (this folder), built fresh. The older scaffold in `~/App & Web Development/DormMing` is not used.

## 12. Open questions

- **Java backend hosting:** Vercel hosts only the React frontend. Where does the Java server run?
- **Currency:** Philippine peso (₱) only?
- **Split rounding:** Who absorbs the extra centavo when ₱100 splits 3 ways?
- **Payment confirmation:** Who marks a debt paid, the payer or the receiver?
- **Leaving a dorm:** What happens to a member's unpaid balance?
- **Edit rights:** Who can edit or delete a shared expense or bill?
- **Devices:** Phone first, desktop first, or both?
