import { DataTable, Text } from 'grommet'

import { useAppDispatch } from '../store'
import { transactionsSlice } from '../store/transactionsSlice'
import { TransactionRemote } from '../types'
import { dateToExcelFormat, parseExcelDate } from '../utils'

export default ({ data, withoutDate }: { data: TransactionRemote[]; withoutDate?: boolean }) => {
  const dispatch = useAppDispatch()
  let columns: any[] = [
    {
      property: 'amount',
      header: 'Amount',
      aggregate: 'sum',
      footer: { aggregate: true },
      render: ({ amount }: { amount: number }) => <Text>{amount.toFixed(2)}</Text>,
    },
    { property: 'description', header: 'Description' },
    {
      property: 'synced',
      header: 'Synced',
      render: (payload: TransactionRemote) => <Text>{payload.synced ? 'Yes' : 'No'}</Text>,
    },
  ]
  if (!withoutDate) {
    columns = [
      {
        property: 'date',
        header: 'Date',
        render: ({ date }: { date: Date }) => <Text>{date ? dateToExcelFormat(date) : null}</Text>,
      },
      ...columns,
    ]
  }
  return (
    <DataTable
      size="small"
      primaryKey="id"
      columns={columns}
      data={data.map((t) => ({
        ...t,
        date: parseExcelDate(t.date),
        month: `${parseExcelDate(t.date).getMonth()}.${parseExcelDate(t.date).getFullYear()}`,
      }))}
      onClickRow={({ datum }) => {
        if (datum.syncDate === undefined) {
          dispatch(transactionsSlice.actions.remove(datum.id))
        }
      }}
    />
  )
}
