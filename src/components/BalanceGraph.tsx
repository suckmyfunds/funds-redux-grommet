import { DataChart } from 'grommet'
import { useSelector } from 'react-redux'

import { selectFundTransactions } from '../store/transactionsSlice'
import { TransactionRemote } from '../types'
import { groupBy, parseExcelDate } from '../utils'

export function BalanceGraph({ fundId }: { fundId: string }) {
  const transactionsByMonth: Record<string, TransactionRemote[]> = groupBy(
    useSelector((s) => selectFundTransactions(s, fundId)),
    (t) => `${parseExcelDate(t.date).getMonth()}.${parseExcelDate(t.date).getFullYear()}`
  )
  return (
    <DataChart
      data={Object.keys(transactionsByMonth).map((month) => {
        const trs = transactionsByMonth[month]
        const amount = trs.reduce((acc, t) => acc + t.amount, 0)
        return {
          month,
          amount,
        }
      })}
      series={[
        { property: 'month', label: 'Month' },
        { property: 'amount', label: 'Amount', render: (value) => value.toFixed(2) },
      ]}
      chart="percent"
      axis={{ x: { property: 'month', granularity: 'fine' } }}
    />
  )
}
