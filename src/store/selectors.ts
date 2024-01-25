import { createSelector } from '@reduxjs/toolkit'

import { TransactionRemote } from '../types'
import { compareDates, groupBy, median, parseExcelDate } from '../utils'
import { selectAllFunds } from './fundsSlice'
import { selectTransactionsByFundId } from './transactionsSlice'

export const selectUnsyncedTransactions = createSelector(
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
      const groups = groupBy(trs, (t) => parseExcelDate(t.date).getMonth())
      return {
        name: f.name,
        transactions: Object.keys(groups).map((month) => {
          const g = groups[month].map((t) => t.amount)
          return {
            month,
            avg: g.reduce((a, b) => a + b, 0) / groups[month].length,
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
      (t) => compareDates(parseExcelDate(t.date), date) === 0
    )
)
