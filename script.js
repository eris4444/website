import { Chart } from "@/components/ui/chart"
// Initialize data structures
const transactions = JSON.parse(localStorage.getItem("transactions")) || []
const goals = JSON.parse(localStorage.getItem("goals")) || []

// DOM elements
const totalBalanceEl = document.getElementById("total-balance")
const totalIncomeEl = document.getElementById("total-income")
const totalExpensesEl = document.getElementById("total-expenses")
const transactionFormEl = document.getElementById("transaction-form")
const transactionListEl = document.getElementById("transaction-list")
const goalFormEl = document.getElementById("goal-form")
const goalListEl = document.getElementById("goal-list")
const expenseChartEl = document.getElementById("expense-chart")

// Helper functions
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions))
  localStorage.setItem("goals", JSON.stringify(goals))
}

function calculateTotals() {
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount
      } else {
        acc.expenses += transaction.amount
      }
      return acc
    },
    { income: 0, expenses: 0 },
  )

  totals.balance = totals.income - totals.expenses
  return totals
}

function updateDashboard() {
  const totals = calculateTotals()
  totalBalanceEl.textContent = `$${totals.balance.toFixed(2)}`
  totalIncomeEl.textContent = `$${totals.income.toFixed(2)}`
  totalExpensesEl.textContent = `$${totals.expenses.toFixed(2)}`
  updateExpenseChart()
}

function updateTransactionList() {
  transactionListEl.innerHTML = ""
  transactions.forEach((transaction, index) => {
    const li = document.createElement("li")
    li.innerHTML = `
            ${transaction.name} - $${transaction.amount.toFixed(2)} 
            (${transaction.type})
            <button onclick="deleteTransaction(${index})">Delete</button>
        `
    transactionListEl.appendChild(li)
  })
}

function updateGoalList() {
  goalListEl.innerHTML = ""
  goals.forEach((goal, index) => {
    const li = document.createElement("li")
    li.innerHTML = `
            ${goal.name} - $${goal.amount.toFixed(2)}
            <button onclick="deleteGoal(${index})">Delete</button>
        `
    goalListEl.appendChild(li)
  })
}

function updateExpenseChart() {
  const expenseData = {}
  transactions.forEach((transaction) => {
    if (transaction.type === "expense") {
      expenseData[transaction.name] = (expenseData[transaction.name] || 0) + transaction.amount
    }
  })

  new Chart(expenseChartEl, {
    type: "pie",
    data: {
      labels: Object.keys(expenseData),
      datasets: [
        {
          data: Object.values(expenseData),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Expense Breakdown",
      },
    },
  })
}

// Event listeners
transactionFormEl.addEventListener("submit", (e) => {
  e.preventDefault()
  const name = document.getElementById("transaction-name").value
  const amount = Number.parseFloat(document.getElementById("transaction-amount").value)
  const type = document.getElementById("transaction-type").value

  transactions.push({ name, amount, type })
  updateLocalStorage()
  updateDashboard()
  updateTransactionList()
  transactionFormEl.reset()
})

goalFormEl.addEventListener("submit", (e) => {
  e.preventDefault()
  const name = document.getElementById("goal-name").value
  const amount = Number.parseFloat(document.getElementById("goal-amount").value)

  goals.push({ name, amount })
  updateLocalStorage()
  updateGoalList()
  goalFormEl.reset()
})

// Delete functions
function deleteTransaction(index) {
  transactions.splice(index, 1)
  updateLocalStorage()
  updateDashboard()
  updateTransactionList()
}

function deleteGoal(index) {
  goals.splice(index, 1)
  updateLocalStorage()
  updateGoalList()
}

// Initial render
updateDashboard()
updateTransactionList()
updateGoalList()

