import { createSelector } from '@reduxjs/toolkit'

import { Fund, TransactionRemote } from '../types'
import { compareDates, dateFromExcelFormat, groupBy, median } from '../utils'
import { selectAllFundsBase, selectFundById } from './fundsSlice'
import { selectAllTransactions, selectTransactionsByFundId } from './transactionsSlice'

export const selectAllFunds = createSelector([selectAllFundsBase, selectAllTransactions], (fs, trs) =>
  fs.map((f) => {
    const balance = f.initialBalance - trs.filter((t) => t.fundId === f.id).reduce((acc, tr) => acc + tr.amount, 0)
    return {
      ...f,
      balance,
    }
  })
)

export const selectTransactionsForAccountSync = createSelector(
  [selectTransactionsByFundId, selectAllFunds],
  (transactions, funds) => {
    return funds.reduce((acc: Record<string, TransactionRemote[]>, fund) => {
      if (acc[fund.name] === undefined) {
        acc[fund.name] = []
      }
      acc[fund.name].push(...transactions[fund.id].filter((t) => !t.synced))
      return acc
    }, {})
  }
)

export const selectFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => {
    return transactions.filter((t) => t.fundId === fundId).reverse()
  }
)

export const getTransactionExpencesByMonth = (transactions: TransactionRemote[]): Record<string, number> => {
  const onlyExpenses = (t: TransactionRemote) => t.amount > 0
  const groups = groupBy(transactions, (t) => {
    const date = dateFromExcelFormat(t.date)
    return `${date.getMonth() + 1}.${date.getFullYear() - 2000}`
  })
  let result: Record<string, number> = {}

  Object.keys(groups).forEach((month) => {
    const monthSpends = groups[month].filter(onlyExpenses).map((t) => t.amount)
    result[month] = monthSpends.reduce((a, b) => a + b, 0)
  })
  return result
}
export const getTransactionsAVG = (transactions: TransactionRemote[]): number => {
  const sums = getTransactionExpencesByMonth(transactions)
  if (Object.keys(sums).length == 0) {
    return 0
  }
  return Object.values(sums).reduce((a, b) => a + b, 0) / Object.keys(sums).length
}

export const getFundChartData = (transactions: TransactionRemote[], treshhold: number = 0, fund: Fund) => {
  const onlyExpenses = (t: TransactionRemote) =>
    t.amount > 0 && t.amount <= (treshhold == 0 ? Number.MAX_VALUE : treshhold)
  const groups = groupBy(transactions, (t) => {
    const date = dateFromExcelFormat(t.date)
    return `${date.getMonth() + 1}.${date.getFullYear() - 2000}`
  })
  let avgWindow: number[] = []
  let balance = fund.initialBalance
  const avgWindowSize = 4

  const sums = getTransactionExpencesByMonth(transactions)
  const avg = Object.values(sums).reduce((a, b) => a + b, 0) / Object.keys(sums).length
  const medianValue = median(Object.values(sums))
  return {
    transactions: Object.keys(groups).map((month) => {
      const amounts = groups[month].filter(onlyExpenses).map((t) => t.amount)
      const spended = amounts.reduce((a, b) => a + b, 0)
      balance += groups[month].reduce((a, b) => a - b.amount, 0)
      avgWindow.push(spended)
      if (avgWindow.length > avgWindowSize) avgWindow.shift()
      return {
        date: month,
        spended,
        avg: avg,
        balance,
        median: medianValue,
      }
    }),
  }
}

export const selectFundAVGExpense = createSelector([selectFundTransactions], (transactions) =>
  getTransactionsAVG(transactions)
)

export const selectTransactionsOnDate = createSelector(
  [selectTransactionsByFundId, (_, date: Date, fundId?: string) => ({ date: date, fundId })],
  (transactions, { date, fundId }) =>
    (fundId ? transactions[fundId] : Object.values(transactions).flat()).filter(
      (t) => compareDates(dateFromExcelFormat(t.date), date) === 0
    )
)

export const selectFund = createSelector([selectFundById, selectFundTransactions], (fund, transactions) => {
  // console.log("selectFund", fund.name, transactions)
  return {
    ...fund,
    // transaction amount for expenses is negative, so we need to add it to balance
    balance: fund.initialBalance - transactions.reduce((a, b) => a + b.amount, 0),
    synced: transactions.every((t) => t.synced),
    transactions: transactions,
  }
})

export const selectFundsChartData = createSelector(
  [selectTransactionsByFundId, selectAllFunds, (_, treshhold: number) => treshhold],
  (transactions, funds, treshhold) =>
    funds.map((f) => {
      return { ...getFundChartData(transactions[f.id], treshhold, f), name: f.name, budget: f.budget }
    })
)

export const selectFundChartData = createSelector([selectFundById, selectFundTransactions], (fund, transactions) => ({
  ...getFundChartData(transactions, 0, fund),
  name: fund.name,
  budget: fund.budget,
}))
