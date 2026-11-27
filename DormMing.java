
import java.util.*;

public class DormMing {

    static Scanner sc = new Scanner(System.in);

    static ArrayList<User> users = new ArrayList<>();
    static ArrayList<Dormmate> dormmates = new ArrayList<>();
    static ArrayList<Expense> expenses = new ArrayList<>();
    static ArrayList<Payment> payments = new ArrayList<>();
    static ArrayList<Chore> chores = new ArrayList<>();

    static User currentUser;

    public static void main(String[] args) {

        System.out.println("=================================");
        System.out.println("         DORMMATE SYSTEM");
        System.out.println("=================================");

        while (true) {

            System.out.println("\n1. Register");
            System.out.println("2. Login");
            System.out.println("3. Exit");

            int choice = readInt("Choose: ");

            switch (choice) {
                case 1:
                    register();
                    break;

                case 2:
                    login();
                    break;

                case 3:
                    System.out.println("Thank you for using DormMate!");
                    return;

                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    // =================================
    // REGISTRATION
    // =================================

    static void register() {

        System.out.println("\n--- REGISTER ACCOUNT ---");

        System.out.print("Enter username: ");
        String username = sc.nextLine().trim();

        if (username.isEmpty() || findUser(username) != null) {
            System.out.println("Invalid or existing username.");
            return;
        }

        System.out.print("Enter password: ");
        String password = sc.nextLine();

        System.out.print("Enter full name: ");
        String name = sc.nextLine().trim();

        if (password.isEmpty() || name.isEmpty()) {
            System.out.println("Fields cannot be empty.");
            return;
        }

        if (findDormmate(name) != null) {
            System.out.println("This name is already registered as a dormmate.");
            return;
        }

        users.add(new User(username, password, name));

        System.out.println("Account registered successfully!");
    }

    // =================================
    // LOGIN
    // =================================

    static void login() {

        System.out.println("\n--- LOGIN ---");

        System.out.print("Username: ");
        String username = sc.nextLine();

        System.out.print("Password: ");
        String password = sc.nextLine();

        User user = findUser(username);

        if (user != null && user.password.equals(password)) {

            currentUser = user;

            System.out.println("\nWelcome, " + currentUser.name + "!");

            mainMenu();

        } else {
            System.out.println("Invalid username or password.");
        }
    }

    // =================================
    // MAIN MENU
    // =================================

    static void mainMenu() {

        while (currentUser != null) {

            System.out.println("\n=================================");
            System.out.println("          DORMMATE MENU");
            System.out.println("=================================");
            System.out.println("1. Manage Dormmates");
            System.out.println("2. Add Expense");
            System.out.println("3. View Expenses");
            System.out.println("4. View Debts");
            System.out.println("5. Record Payment");
            System.out.println("6. View Payment Records");
            System.out.println("7. Manage House Chores");
            System.out.println("8. Transaction History");
            System.out.println("9. Logout");

            int choice = readInt("Choose: ");

            switch (choice) {

                case 1:
                    manageDormmates();
                    break;

                case 2:
                    addExpense();
                    break;

                case 3:
                    viewExpenses();
                    break;

                case 4:
                    viewDebts();
                    break;

                case 5:
                    recordPayment();
                    break;

                case 6:
                    viewPayments();
                    break;

                case 7:
                    manageChores();
                    break;

                case 8:
                    transactionHistory();
                    break;

                case 9:
                    currentUser = null;
                    System.out.println("Successfully logged out.");
                    break;

                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    // =================================
    // GET ALL DORM MEMBERS
    // =================================

    static ArrayList<String> getPeople() {

        ArrayList<String> people = new ArrayList<>();

        // Include all registered accounts.
        for (User u : users) {
            if (!containsName(people, u.name)) {
                people.add(u.name);
            }
        }

        // Include dormmates without accounts.
        for (Dormmate d : dormmates) {
            if (!containsName(people, d.name)) {
                people.add(d.name);
            }
        }

        return people;
    }

    static boolean containsName(ArrayList<String> people, String name) {

        for (String person : people) {
            if (person.equalsIgnoreCase(name)) {
                return true;
            }
        }

        return false;
    }

    // =================================
    // MANAGE DORMMATES
    // =================================

    static void manageDormmates() {

        while (true) {

            System.out.println("\n--- DORMMATE MANAGEMENT ---");
            System.out.println("1. Add Dormmate");
            System.out.println("2. View Dormmates");
            System.out.println("3. Back");

            int choice = readInt("Choose: ");

            switch (choice) {

                case 1:

                    System.out.print("Enter dormmate name: ");
                    String name = sc.nextLine().trim();

                    if (name.isEmpty()) {
                        System.out.println("Name cannot be empty.");
                    } else if (containsName(getPeople(), name)) {
                        System.out.println("This person is already registered.");
                    } else {
                        dormmates.add(new Dormmate(name));
                        System.out.println(name + " added successfully!");
                    }

                    break;

                case 2:

                    System.out.println("\n--- DORM MEMBERS ---");

                    ArrayList<String> people = getPeople();

                    for (int i = 0; i < people.size(); i++) {
                        System.out.println((i + 1) + ". " + people.get(i));
                    }

                    break;

                case 3:
                    return;

                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    // =================================
    // ADD EXPENSE
    // =================================

    static void addExpense() {

        System.out.println("\n--- ADD EXPENSE ---");

        System.out.println("1. Grocery");
        System.out.println("2. Electricity");
        System.out.println("3. Water");
        System.out.println("4. Internet");
        System.out.println("5. Other");

        int categoryChoice = readInt("Choose category: ");

        String category;

        switch (categoryChoice) {

            case 1: category = "Grocery"; break;
            case 2: category = "Electricity"; break;
            case 3: category = "Water"; break;
            case 4: category = "Internet"; break;
            case 5: category = "Other"; break;

            default:
                System.out.println("Invalid category.");
                return;
        }

        System.out.print("Enter expense description: ");
        String description = sc.nextLine().trim();

        if (description.isEmpty()) {
            System.out.println("Description cannot be empty.");
            return;
        }

        double amount = readDouble("Enter total amount: ");

        if (!Double.isFinite(amount) || amount <= 0) {
            System.out.println("Invalid amount.");
            return;
        }

        ArrayList<String> people = getPeople();

        if (people.isEmpty()) {
            System.out.println("No dorm members found.");
            return;
        }

        System.out.println("\n--- WHO PAID FOR THIS EXPENSE? ---");

        for (int i = 0; i < people.size(); i++) {
            System.out.println((i + 1) + ". " + people.get(i));
        }

        int payerChoice = readInt("Select payer: ");

        if (payerChoice < 1 || payerChoice > people.size()) {
            System.out.println("Invalid selection.");
            return;
        }

        String paidBy = people.get(payerChoice - 1);

        double share = amount / people.size();

        Expense expense = new Expense(
                category,
                description,
                amount,
                paidBy,
                share,
                new ArrayList<>(people)
        );

        expenses.add(expense);

        System.out.println("\nExpense successfully recorded!");
        System.out.println("Description: " + description);
        System.out.println("Paid by: " + paidBy);

        System.out.printf("Total amount: PHP %.2f%n", amount);
        System.out.printf("Each person's share: PHP %.2f%n", share);

        System.out.println("\n--- DEBT BREAKDOWN ---");

        for (String person : people) {

            if (!person.equalsIgnoreCase(paidBy)) {
                System.out.printf(
                        "%s owes %s PHP %.2f%n",
                        person,
                        paidBy,
                        share
                );
            }
        }
    }

    // =================================
    // VIEW EXPENSES
    // =================================

    static void viewExpenses() {

        System.out.println("\n--- EXPENSE RECORDS ---");

        if (expenses.isEmpty()) {
            System.out.println("No expenses recorded.");
            return;
        }

        for (int i = 0; i < expenses.size(); i++) {

            Expense e = expenses.get(i);

            System.out.println("\nExpense #" + (i + 1));
            System.out.println("Category: " + e.category);
            System.out.println("Description: " + e.description);
            System.out.println("Paid by: " + e.paidBy);

            System.out.printf("Total: PHP %.2f%n", e.amount);
            System.out.printf("Each share: PHP %.2f%n", e.share);
        }
    }

    // =================================
    // CALCULATE REMAINING DEBT
    // =================================

    static double getRemainingDebt(String debtor, String creditor) {

        double totalOwed = 0;
        double totalPaid = 0;

        // Calculate how much the debtor owes the creditor.
        for (Expense e : expenses) {

            if (e.paidBy.equalsIgnoreCase(creditor)
                    && !debtor.equalsIgnoreCase(creditor)
                    && containsName(e.participants, debtor)) {

                totalOwed += e.share;
            }
        }

        // Calculate payments already made.
        for (Payment p : payments) {

            if (p.payer.equalsIgnoreCase(debtor)
                    && p.receiver.equalsIgnoreCase(creditor)) {

                totalPaid += p.amount;
            }
        }

        return Math.max(0, totalOwed - totalPaid);
    }

    // =================================
    // VIEW DEBTS
    // =================================

    static void viewDebts() {

        System.out.println("\n--- DORMMATE DEBT SUMMARY ---");

        ArrayList<String> people = getPeople();

        boolean hasDebt = false;

        for (String debtor : people) {

            for (String creditor : people) {

                if (debtor.equalsIgnoreCase(creditor)) {
                    continue;
                }

                double remaining = getRemainingDebt(debtor, creditor);

                if (remaining > 0.001) {

                    hasDebt = true;

                    System.out.printf(
                            "%s owes %s: PHP %.2f%n",
                            debtor,
                            creditor,
                            remaining
                    );
                }
            }
        }

        if (!hasDebt) {
            System.out.println("Everyone is settled! No outstanding debts.");
        }
    }

    // =================================
    // RECORD PAYMENT
    // =================================

    static void recordPayment() {

        System.out.println("\n--- RECORD PAYMENT ---");

        ArrayList<String> people = getPeople();

        if (people.size() < 2) {
            System.out.println("You need at least two dorm members.");
            return;
        }

        // Select who is paying.
        System.out.println("\nWho is making the payment?");

        for (int i = 0; i < people.size(); i++) {
            System.out.println((i + 1) + ". " + people.get(i));
        }

        int payerChoice = readInt("Select person paying: ");

        if (payerChoice < 1 || payerChoice > people.size()) {
            System.out.println("Invalid selection.");
            return;
        }

        String payer = people.get(payerChoice - 1);

        // Select who receives the payment.
        System.out.println("\nWho will receive the payment?");

        ArrayList<String> creditors = new ArrayList<>();

        for (String person : people) {

            if (!person.equalsIgnoreCase(payer)) {

                double debt = getRemainingDebt(payer, person);

                if (debt > 0.001) {
                    creditors.add(person);
                }
            }
        }

        if (creditors.isEmpty()) {
            System.out.println(payer + " has no outstanding debt.");
            return;
        }

        for (int i = 0; i < creditors.size(); i++) {

            String creditor = creditors.get(i);

            double debt = getRemainingDebt(payer, creditor);

            System.out.printf(
                    "%d. %s (Remaining debt: PHP %.2f)%n",
                    i + 1,
                    creditor,
                    debt
            );
        }

        int receiverChoice = readInt("Select receiver: ");

        if (receiverChoice < 1 || receiverChoice > creditors.size()) {
            System.out.println("Invalid selection.");
            return;
        }

        String receiver = creditors.get(receiverChoice - 1);

        double remainingDebt = getRemainingDebt(payer, receiver);

        System.out.printf(
                "\nCurrent debt: PHP %.2f%n",
                remainingDebt
        );

        double amount = readDouble("Enter payment amount: ");

        if (!Double.isFinite(amount) || amount <= 0
                || amount > remainingDebt + 0.001) {

            System.out.println("Invalid payment amount.");
            return;
        }

        // Save the payment.
        payments.add(new Payment(
                payer,
                receiver,
                amount,
                currentUser.name
        ));

        System.out.println("\nPayment successfully recorded!");

        System.out.println("Paid by: " + payer);
        System.out.println("Received by: " + receiver);

        System.out.printf("Amount paid: PHP %.2f%n", amount);

        double newBalance = getRemainingDebt(payer, receiver);

        System.out.printf(
                "Remaining debt: PHP %.2f%n",
                newBalance
        );
    }

    // =================================
    // VIEW PAYMENT RECORDS
    // =================================

    static void viewPayments() {

        System.out.println("\n--- PAYMENT RECORDS ---");

        if (payments.isEmpty()) {
            System.out.println("No payments recorded yet.");
            return;
        }

        for (int i = 0; i < payments.size(); i++) {

            Payment p = payments.get(i);

            System.out.println("\nPayment #" + (i + 1));

            System.out.println("From: " + p.payer);
            System.out.println("To: " + p.receiver);

            System.out.printf(
                    "Amount: PHP %.2f%n",
                    p.amount
            );

            System.out.println("Recorded by: " + p.recordedBy);
        }
    }

    // =================================
    // HOUSE CHORES
    // =================================

    static void manageChores() {

        while (true) {

            System.out.println("\n--- HOUSE CHORES ---");
            System.out.println("1. Add Chore");
            System.out.println("2. Generate Weekly Rotation");
            System.out.println("3. View Chores");
            System.out.println("4. Mark My Chore Complete");
            System.out.println("5. Back");

            int choice = readInt("Choose: ");

            switch (choice) {

                case 1:
                    addChore();
                    break;

                case 2:
                    generateRotation();
                    break;

                case 3:
                    viewChores();
                    break;

                case 4:
                    completeChore();
                    break;

                case 5:
                    return;

                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    static void addChore() {

        System.out.print("Enter chore name: ");
        String name = sc.nextLine().trim();

        if (name.isEmpty()) {
            System.out.println("Chore name cannot be empty.");
            return;
        }

        chores.add(new Chore(name));

        System.out.println("Chore added successfully!");
    }

    static void generateRotation() {

        if (chores.isEmpty()) {
            System.out.println("Please add chores first.");
            return;
        }

        ArrayList<String> people = getPeople();

        System.out.println("\n--- WEEKLY CHORE ROTATION ---");

        for (int i = 0; i < chores.size(); i++) {

            Chore c = chores.get(i);

            int assignedIndex = (i + c.rotationCount) % people.size();

            c.assignedTo = people.get(assignedIndex);
            c.status = "Pending";
            c.rotationCount++;

            System.out.println(
                    c.name + " - Assigned to: " + c.assignedTo
            );
        }

        System.out.println("\nRotation generated!");
    }

    static void viewChores() {

        System.out.println("\n--- CHORE LIST ---");

        if (chores.isEmpty()) {
            System.out.println("No chores available.");
            return;
        }

        for (int i = 0; i < chores.size(); i++) {

            Chore c = chores.get(i);

            System.out.println("\nChore #" + (i + 1));
            System.out.println("Task: " + c.name);
            System.out.println("Assigned to: " + c.assignedTo);
            System.out.println("Status: " + c.status);
        }
    }

    static void completeChore() {

        System.out.println("\n--- COMPLETE CHORE ---");

        boolean found = false;

        for (Chore c : chores) {

            if (c.assignedTo.equalsIgnoreCase(currentUser.name)
                    && c.status.equals("Pending")) {

                System.out.println("\nChore: " + c.name);
                System.out.println("1. Mark Complete");
                System.out.println("2. Skip");

                int choice = readInt("Choose: ");

                if (choice == 1) {
                    c.status = "Completed";
                    System.out.println("Chore completed!");
                }

                found = true;
            }
        }

        if (!found) {
            System.out.println("You have no pending chores assigned.");
        }
    }

    // =================================
    // TRANSACTION HISTORY
    // =================================

    static void transactionHistory() {

        System.out.println("\n--- TRANSACTION HISTORY ---");

        if (expenses.isEmpty() && payments.isEmpty()) {
            System.out.println("No transactions recorded.");
            return;
        }

        for (Expense e : expenses) {

            System.out.printf(
                    "\nEXPENSE | %s | %s | PHP %.2f | Paid by: %s%n",
                    e.category,
                    e.description,
                    e.amount,
                    e.paidBy
            );
        }

        for (Payment p : payments) {

            System.out.printf(
                    "\nPAYMENT | %s paid %s PHP %.2f | Recorded by: %s%n",
                    p.payer,
                    p.receiver,
                    p.amount,
                    p.recordedBy
            );
        }
    }

    // =================================
    // SEARCH METHODS
    // =================================

    static User findUser(String username) {

        for (User u : users) {

            if (u.username.equalsIgnoreCase(username)) {
                return u;
            }
        }

        return null;
    }

    static Dormmate findDormmate(String name) {

        for (Dormmate d : dormmates) {

            if (d.name.equalsIgnoreCase(name)) {
                return d;
            }
        }

        return null;
    }

    // =================================
    // INPUT VALIDATION
    // =================================

    static int readInt(String message) {

        while (true) {

            System.out.print(message);

            try {
                return Integer.parseInt(sc.nextLine());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid number.");
            }
        }
    }

    static double readDouble(String message) {

        while (true) {

            System.out.print(message);

            try {
                return Double.parseDouble(sc.nextLine());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid amount.");
            }
        }
    }
}

// =================================
// USER CLASS
// =================================

class User {

    String username;
    String password;
    String name;

    User(String username, String password, String name) {

        this.username = username;
        this.password = password;
        this.name = name;
    }
}

// =================================
// DORMMATE CLASS
// =================================

class Dormmate {

    String name;

    Dormmate(String name) {
        this.name = name;
    }
}

// =================================
// EXPENSE CLASS
// =================================

class Expense {

    String category;
    String description;
    double amount;
    String paidBy;
    double share;

    ArrayList<String> participants;

    Expense(
            String category,
            String description,
            double amount,
            String paidBy,
            double share,
            ArrayList<String> participants
    ) {

        this.category = category;
        this.description = description;
        this.amount = amount;
        this.paidBy = paidBy;
        this.share = share;
        this.participants = participants;
    }
}

// =================================
// PAYMENT CLASS
// =================================

class Payment {

    String payer;
    String receiver;
    double amount;
    String recordedBy;

    Payment(
            String payer,
            String receiver,
            double amount,
            String recordedBy
    ) {

        this.payer = payer;
        this.receiver = receiver;
        this.amount = amount;
        this.recordedBy = recordedBy;
    }
}

// =================================
// CHORE CLASS
// =================================

class Chore {

    String name;
    String assignedTo = "Not assigned";
    String status = "Pending";
    int rotationCount = 0;

    Chore(String name) {
        this.name = name;
    }
}
