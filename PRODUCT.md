# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
College students who share a dorm room or unit in the Philippines. They pay for groceries, food and receipts for each other and need to know who owes whom without a group-chat spreadsheet. They use it mostly on their phones (installed to the home screen or in Safari/Chrome), sometimes on a laptop.

## Product Purpose
DormMing does four things, one tab each:
- **Home**: the date, a greeting, Ming's message about your money, what you're owed and what you owe, recent expenses.
- **Expenses**: shared expenses, split equally and automatically with everyone in the dorm (who's in it can be changed). Shows what the dorm spent together this month, by category.
- **Bills**: personal payment reminders (internet, water, rent). Only the owner sees them; monthly bills come back after you mark them paid.
- **Balances**: your balance, then each dormmate's card: owes you, you owe (with Pay), or settled.
Success: everyone in the dorm agrees on the numbers without arguing.

## Positioning
Built for one dorm, not friends in general: you join your dormmates with a 6-character code or by scanning the dorm's QR, and Ming the cat keeps count. Debts between two people cancel out, so you only see what is left. Amounts are kept to the centavo, and leftover centavos never land on the payer.

## Operating Context
Used right after someone pays (at the grocery, after ordering food) and when settling up. Phones on the same Wi-Fi, screens refresh every 5 seconds. Installed to the home screen as a full-screen web app (PWA) or used in Safari/Chrome. Also demoed live at a class defense (OOP 101) on a laptop and phones.

## Capabilities and Constraints
- Register, log in (stays logged in for 90 days), optional 4-digit PIN lock on the device (offered once after sign-up, managed in Settings → Security), log out, delete account.
- Create, join (code, QR or link), rename (creator only) and leave a dorm.
- Simulated banking only: no real money moves; payments are records.
- You can't leave a dorm or delete your account while you owe or are owed; you can't pay more than you owe.
- Error screens: offline, server unreachable (with retry), crash, page not found.
- Settings: Account, Appearance (light/dark/system, reduce motion), Notifications (bill reminder window), Dormitory, Security, Privacy, Help & Support (FAQ), About.
- Philippine pesos (₱), stored as centavos.
- Stack: Spring Boot (Java 21) backend, React + Vite + Tailwind + shadcn frontend. In-memory data, reset on restart. Dev server runs on HTTPS (self-signed) so the camera works for QR scanning.

## Brand Commitments
- Name: DormMing. Logo: `frontend/public/brand/dormming-logo.png` (yellow sticker lettering, dark brown outline). App icon: `frontend/public/brand/app-icon.png`.
- Mascot: Ming, an orange pixel-art cat in an olive hoodie, with four moods: happy, worried, celebrating, sleepy (`frontend/public/brand/ming/`, pre-cut by the team; place them, never re-cut). Ming appears only in the Home greeting, auth screens, error screens and the landing page.
- Colors: olive `#3f7a3d` (ink `#24521f`, soft `#e2efd9`), orange `#e5701f` (ink `#8f3f0b`, soft `#ffe6cf`), background `#f3f5f0`; dark mode supported.
- Signature surface: the green "cutting mat" grid (`.cutting-mat`), used on the Home greeting band, splash, lock/PIN screens, login/sign-up and the landing's Meet Ming band.
- Fonts: SF Pro Rounded via `ui-rounded`, Nunito fallback.
- Voice: warm, short, a little playful.
- Settings stay calm: gray icons, colour only for danger (Log out, Delete).
- Phone navigation: a frosted-glass pill with Home · Expenses · Bills · Balances, and a separate green circle beside it opening Add expense / Record payment / Set a reminder / Scan QR. Settings via a gear in the header.

## Evidence on Hand
No real users, testimonials, ratings or download counts. Do not invent any. Team: MING Dynasty, Team 3, IT 2107.

## Product Principles
1. The four functions come first; nothing else competes for attention.
2. Numbers must be unambiguous: who, how much, which direction.
3. Native on the phone: thumb-reachable actions, safe areas respected.
4. Ming reflects the state of your money, not decoration for its own sake.

## Accessibility & Inclusion
Readable at phone size in bright light; tap targets at least 44px; respects reduced motion.
