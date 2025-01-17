import { dateFromExcelFormat, dayMY as dayAsMonthYear, makeScaler } from '../utils'
import { TransactionRemote } from '../types'
import { makeOnlyExpensesWithTreshhold } from '../bl/utils'

function subtractMonth(date: Date, months: number = 1): Date {
  return new Date(date.getTime() + -months * 30 * 24 * 60 * 60 * 1000)
}

export default function InlineMonthExpenseChart({
  monthesCount,
  transactions,
  height = 30,
  width = 300,
}: {
  monthesCount: number
  transactions: TransactionRemote[]
  height: number
  width: number
}) {
  const today = new Date()
  let transactionGroups: Record<string, number> = {}
  const onlyExpenses = makeOnlyExpensesWithTreshhold()
  const expenses = transactions.filter(onlyExpenses)
  for (let i = monthesCount - 1; i > 0; i--) {
    const date = dayAsMonthYear(subtractMonth(today, i))
    transactionGroups[date] = expenses
      .filter((t) => dayAsMonthYear(dateFromExcelFormat(t.date)) == date)
      .reduce((acc, i) => acc + i.amount, 0)
  }
  console.log(transactionGroups)
  const max = Object.values(transactionGroups).reduce((m, v) => (v > m ? v : m))
  const min = Object.values(transactionGroups).reduce((m, v) => (v < m ? v : m))
  const topBound = height

  const scaleY = makeScaler(max, min, topBound)
  const scaleX = makeScaler(monthesCount, 1, width)

  const points = Object.values(transactionGroups).map((v, idx) => ({ x: scaleX(idx), y: scaleY(v) }))
  return (
    <svg width={width} height={height}>
      <rect x="0" y="0" width={width} height={height} fill="#eee" />
      {points.map((point, index) => (
        <path
          key={index}
          d={`M ${points[index - 1]?.x} ${points[index - 1]?.y} L ${point.x} ${point.y}`}
          stroke="black"
          strokeWidth={2}
        />
      ))}
    </svg>
  )
}
