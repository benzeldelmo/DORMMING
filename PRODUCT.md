# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
College students who share a dorm room or unit in the Philippines. They pay for groceries, food and receipts for each other and need to know who owes whom without a group-chat spreadsheet. They use it mostly on their phones (installed to the home screen or in Safari/Chrome), sometimes on a laptop.

## Product Purpose
DormMing does four things: split a bill (a receipt, item by item), add a shared expense (equal or custom split), record a payment back to a dormmate, and view balances (who owes you, whom you owe). Success: everyone in the dorm agrees on the numbers without arguing.

## Positioning
Built for one dorm, not friends in general: you join your dormmates with a 6-character code, and Ming the cat keeps count. Debts between two people cancel out, so you only see what is left. Amounts are kept to the centavo, and leftover centavos never land on the payer.

## Operating Context
Used right after someone pays (at the grocery, after ordering food) and when settling up. Phones on the same Wi-Fi, screens refresh every 5 seconds. Also demoed live at a class defense (OOP 101) on a laptop and phones.

## Capabilities and Constraints
- Register, log in, create/join/leave a dorm by code, log out.
- Simulated banking only: no real money moves; payments are records.
- You can't leave a dorm while you owe or are owed; you can't pay more than you owe.
- Philippine pesos (₱), stored as centavos.
- Stack: Spring Boot (Java 21) backend, React + Vite + Tailwind + shadcn frontend. In-memory data, reset on restart.

## Brand Commitments
- Name: DormMing. Logo: `frontend/public/brand/dormming-logo.png` (yellow sticker lettering, dark brown outline).
- Mascot: Ming, an orange pixel-art cat in an olive hoodie, with four moods: happy, worried, celebrating, sleepy (`frontend/public/brand/ming/`).
- Colors in use: olive `#6b7255`, orange, cream; fonts Nunito (headings) and Google Sans (body).
- Voice: warm, short, a little playful ("Ming missed you").
- No dotted/patterned backgrounds (user preference).
- Phone navigation: floating pill bar, Home · Expenses · (+) · Split Bill · Balances, with the + in the middle opening Add expense / Split bill / Record payment; Settings via a gear in the header.

## Evidence on Hand
No real users, testimonials, ratings or download counts. Do not invent any. Team: MING Dynasty, Team 3, IT 2107.

## Product Principles
1. The four functions come first; nothing else competes for attention.
2. Numbers must be unambiguous: who, how much, which direction.
3. Native on the phone: thumb-reachable actions, safe areas respected.
4. Ming reflects the state of your money, not decoration for its own sake.

## Accessibility & Inclusion
Readable at phone size in bright light; tap targets at least 44px; respects reduced motion.
