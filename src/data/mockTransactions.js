// In a real app, this data would come from a backend database.
// We keep it in its own file so components don't need to know
// where the data physically lives — they just import it.
export const MOCK_TRANSACTIONS = [
  { id: 1, name: "Salary Deposit",       category: "Income",        date: "2026-09-10", amount: 45000 },
  { id: 2, name: "Swiggy",               category: "Food",          date: "2026-09-10", amount: -420 },
  { id: 3, name: "Electricity Bill",     category: "Utilities",     date: "2026-09-09", amount: -1350 },
  { id: 4, name: "Amazon Purchase",      category: "Shopping",      date: "2026-09-08", amount: -2199 },
  { id: 5, name: "Freelance Payment",    category: "Income",        date: "2026-09-07", amount: 8000 },
  { id: 6, name: "Netflix Subscription", category: "Entertainment", date: "2026-09-05", amount: -649 },
  { id: 7, name: "Gym Membership",       category: "Health",        date: "2026-09-03", amount: -1200 },
  { id: 8, name: "Mobile Recharge",      category: "Utilities",     date: "2026-09-02", amount: -299 },
];
