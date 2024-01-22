import { createSelector } from "@reduxjs/toolkit"
import { groupBy, median, parseDate } from "../utils"
import { selectAllFunds } from "./fundsSlice"
import { selectTransactionsByFundId } from "./transactionsSlice"

export const selectUnsyncedTransactions = createSelector(
    [
        selectTransactionsByFundId, selectAllFunds
    ],
    (transactions, funds) => {
        return funds.map(f => ({ [f.name]: transactions[f.id].filter(t => !t.synced) }))
    }
)



export const selectFundsChartData = createSelector(
    [selectTransactionsByFundId, selectAllFunds, (_, treshhold: number) => treshhold],
    (transactions, funds, treshhold) => funds.map(f => {
        const trs = transactions[f.id].filter(t => t.amount <= treshhold)
        const groups = groupBy(trs, (t) => parseDate(t.date).getMonth())
        return {
            name: f.name,
            transactions: Object.keys(groups).map(month => {
                const g = groups[month].map(t => t.amount)
                return {
                    month,
                    avg: (g.reduce((a, b) => a + b, 0) / groups[month].length),
                    median: median(g.map(t => t)),
                }
            })
        }
    })
)