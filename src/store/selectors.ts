import { createSelector } from '@reduxjs/toolkit'

import { TransactionRemote } from '../types'
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
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId).reverse()
)

export const getFundChartData = (transactions: TransactionRemote[], treshhold: number = 0) => {
  const trs = transactions.filter((t) => t.amount > 0 && t.amount <= (treshhold == 0 ? Number.MAX_VALUE : treshhold))
  const groups = groupBy(trs, (t) => {
    const date = dateFromExcelFormat(t.date)
    return `${date.getMonth() + 1}.${date.getFullYear() - 2000}`
  })
  let avgWindow: number[] = []
  const avgWindowSize = 4
  return {
    transactions: Object.keys(groups).map((month) => {
      const amounts = groups[month].map((t) => t.amount)
      const sum = amounts.reduce((a, b) => a + b, 0)
      avgWindow.push(sum)
      if (avgWindow.length > avgWindowSize) avgWindow.shift()
      return {
        date: month,
        sum,
        avg: avgWindow.reduce((a, b) => a + b, 0) / avgWindow.length,
        median: median(amounts.map((t) => t)),
      }
    }),
  }
}

export const selectTransactionsOnDate = createSelector(
  [selectTransactionsByFundId, (_, date: Date, fundId?: string) => ({ date: date, fundId })],
  (transactions, { date, fundId }) =>
    (fundId ? transactions[fundId] : Object.values(transactions).flat()).filter(
      (t) => compareDates(dateFromExcelFormat(t.date), date) === 0
    )
)

export const selectFund = createSelector([selectFundById, selectFundTransactions], (fund, transactions) => {
  return {
    ...fund,
    // transaction amount for expenses is negative, so we need to add it to balance
    balance: fund.initialBalance - transactions.reduce((a, b) => a + b.amount, 0),
    synced: transactions.every((t) => t.synced),
    transactions,
  }
})

export const selectFundsChartData = createSelector(
  [selectTransactionsByFundId, selectAllFunds, (_, treshhold: number) => treshhold],
  (transactions, funds, treshhold) =>
    funds.map((f) => {
      return { ...getFundChartData(transactions[f.id], treshhold), name: f.name, budget: f.budget }
    })
)

export const selectFundChartData = createSelector([selectFundById, selectFundTransactions], (fund, transactions) => ({
  ...getFundChartData(transactions),
  name: fund.name,
  budget: fund.budget,
}))
