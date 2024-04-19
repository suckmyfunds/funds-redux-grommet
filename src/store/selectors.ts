import { createSelector } from '@reduxjs/toolkit'

import { TransactionRemote } from '../types'
import { compareDates, dateFromExcelFormat, groupBy, median } from '../utils'
import { selectAllFundsBase, selectFundById } from './fundsSlice'
import { selectAllTransactions, selectTransactionsByFundId } from './transactionsSlice'

export const selectAllFunds = createSelector([selectAllFundsBase, selectAllTransactions], (fs, trs) =>
  fs.map((f) => {
    const balance = f.initialBalance - trs.filter((t) => t.fundId === f.id).reduce((acc, tr) => acc + tr.amount, 0)
    console.warn('selectAllFunds', f.name, balance)
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

export const selectFundsChartData = createSelector(
  [selectTransactionsByFundId, selectAllFunds, (_, treshhold: number) => treshhold],
  (transactions, funds, treshhold) =>
    funds.map((f) => {
      const trs = transactions[f.id].filter((t) => t.amount <= treshhold)
      const groups = groupBy(trs, (t) => dateFromExcelFormat(t.date).getMonth())
      return {
        name: f.name,
        transactions: Object.keys(groups).map((month) => {
          const g = groups[month].map((t) => t.amount)
          const sum = g.reduce((a, b) => a + b, 0)
          return {
            month,
            sum,
            avg: sum / groups[month].length,
            median: median(g.map((t) => t)),
          }
        }),
      }
    })
)

export const selectTransactionsOnDate = createSelector(
  [selectTransactionsByFundId, (_, date: Date, fundId?: string) => ({ date: date, fundId })],
  (transactions, { date, fundId }) =>
    (fundId ? transactions[fundId] : Object.values(transactions).flat()).filter(
      (t) => compareDates(dateFromExcelFormat(t.date), date) === 0
    )
)

export const selectFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId).reverse()
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
