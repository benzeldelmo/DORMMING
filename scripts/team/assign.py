#!/usr/bin/env python3
"""Who owns which file. First matching rule wins; anything unmatched belongs to the leader.

Usage:
  python3 scripts/team/assign.py                # coverage report: how many files each owner has
  python3 scripts/team/assign.py <owner>        # list the files one owner owns (used by daily.sh)
  python3 scripts/team/assign.py --check        # fail if a file would match two owners by accident
  python3 scripts/team/assign.py --codeowners   # write .github/CODEOWNERS (reviews requested automatically)
"""
import fnmatch, subprocess, sys

OWNERS = {
    # Member 2: the core features (expenses, bills, payments, balances)
    "member2": [
        "backend/src/main/java/com/dormming/model/split/*",
        "backend/src/main/java/com/dormming/model/{SharedExpense,Transaction,Payment,Ledger,Debt,Money,Category,Bill}.java",
        "backend/src/main/java/com/dormming/controller/{ExpenseController,PaymentController,BalanceController,BillController}.java",
        "backend/src/main/java/com/dormming/controller/dto/{ExpenseDtos,MoneyDtos,BillDtos}.java",
        "backend/src/main/java/com/dormming/service/{ExpenseService,PaymentService,BalanceService,BillService,SharedExpenseInput}.java",
        "backend/src/main/java/com/dormming/repository/{Bill,Transaction}Repository.java",
        "backend/src/main/java/com/dormming/repository/memory/{InMemoryBill,InMemoryTransaction}Repository.java",
        "backend/src/test/java/com/dormming/model/{LedgerTest,MoneyTest,TransactionTest}.java",
        "backend/src/test/java/com/dormming/model/split/*",
        "backend/src/test/java/com/dormming/service/{ExpenseService,PaymentService,BillService}Test.java",
        "backend/src/test/java/com/dormming/controller/ExpenseApiTest.java",
        "frontend/src/pages/{Expenses,AddExpense,Bills,AddBill,RecordPayment,Balances}.jsx",
        "frontend/src/components/{AmountInput,Rows,PersonPicker,BalanceCard}.jsx",
        "frontend/src/lib/{calc,calc.test,spending,spending.test,money,money.test,categories,people,people.test}.js",
    ],
    # Member 3: the dorm and account set-up (dorms, joining, profile, settings)
    "member3": [
        "backend/src/main/java/com/dormming/model/{User,Dorm,DormMember,DormCreator,InviteCode}.java",
        "backend/src/main/java/com/dormming/controller/{DormController,MeController}.java",
        "backend/src/main/java/com/dormming/controller/dto/{DormDtos,MeDto}.java",
        "backend/src/main/java/com/dormming/service/{DormService,AccountService}.java",
        "backend/src/main/java/com/dormming/repository/{User,Dorm}Repository.java",
        "backend/src/main/java/com/dormming/repository/memory/InMemory{User,Dorm}Repository.java",
        "backend/src/test/java/com/dormming/model/DormTest.java",
        "backend/src/test/java/com/dormming/service/{DormService,AccountService}Test.java",
        "frontend/src/pages/{DormSetup,JoinLink,Scan,Settings}.jsx",
        "frontend/src/components/{DormQr,QrScanner,ScanButton}.jsx",
        "frontend/src/lib/{qr,qr.test,photo}.js",
    ],
}
# GitHub usernames for reviews. Replace the placeholders before running --codeowners.
HANDLES = {
    "leader": "@benzeldelmo",
    "member2": "@kaisen2202",
    "member3": "@sednii",
}
# Everything else (landing, security, sign-in, app shell, design system, deployment, docs) is the leader's.
LEADER = "leader"

def owner_of(path):
    hits = []
    for owner, patterns in OWNERS.items():
        for pat in patterns:
            # expand {a,b} alternatives, then match the path
            for expanded in expand(pat):
                if fnmatch.fnmatch(path, expanded):
                    hits.append(owner)
    if len(set(hits)) > 1:
        raise SystemExit(f"CONFLICT: {path} matches {sorted(set(hits))}. Fix the rules in assign.py.")
    return hits[0] if hits else LEADER

def expand(pat):
    if "{" not in pat:
        return [pat]
    head, rest = pat.split("{", 1)
    alts, tail = rest.split("}", 1)
    return [h + a + t for a in alts.split(",") for h in [head] for t in expand(tail)]

def tracked_files():
    out = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"], capture_output=True, text=True, check=True).stdout
    return [f for f in out.splitlines() if not f.startswith("handoff/")]

def codeowners():
    lines = ["# Reviews are requested automatically from the owner of each area.",
             "# Owners are defined in scripts/team/assign.py; keep both in step.",
             f"* {HANDLES[LEADER]}"]
    for owner, patterns in OWNERS.items():
        for pat in patterns:
            for expanded in expand(pat):
                lines.append(f"/{expanded} {HANDLES[owner]}")
    return "\n".join(lines) + "\n"

if __name__ == "__main__":
    files = tracked_files()
    if len(sys.argv) > 1 and sys.argv[1] == "--codeowners":
        open(".github/CODEOWNERS", "w").write(codeowners())
        print("wrote .github/CODEOWNERS")
    elif len(sys.argv) > 1 and sys.argv[1] != "--check":
        for f in files:
            if owner_of(f) == sys.argv[1]:
                print(f)
    else:
        counts = {}
        for f in files:
            counts[owner_of(f)] = counts.get(owner_of(f), 0) + 1
        for o in ["leader", "member2", "member3"]:
            print(f"{o:8} {counts.get(o, 0):4} files")
        print(f"{'total':8} {len(files):4} files")
