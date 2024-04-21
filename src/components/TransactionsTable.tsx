import { DataTable, Text } from 'grommet'

import { useAppDispatch } from '../store'
import { transactionsSlice } from '../store/transactionsSlice'
import { TransactionRemote } from '../types'
import { dateFromExcelFormat, dateToExcelFormat } from '../utils'

export default ({ data, withoutDate }: { data: TransactionRemote[]; withoutDate?: boolean }) => {
  const dispatch = useAppDispatch()
  let columns: any[] = [
    {
      property: 'amount',
      header: 'Amount',
      render: ({ amount }: { amount: number }) => <Text>{amount.toFixed(2)}</Text>,
    },
    { property: 'description', header: 'Description' },
    {
      property: 'synced',
      header: 'Synced',
      render: (payload: TransactionRemote) => <Text>{payload.synced ? 'Yes' : 'No'}</Text>,
    },
    {
      property: 'syncDate',
      header: 'SyncDate',
      render: (t: TransactionRemote) => <Text>{t.syncDate ? t.syncDate : 'none'}</Text>,
    },
  ]
  if (!withoutDate) {
    columns = [
      {
        property: 'date',
        header: 'Date',
        render: ({ date }: { date: Date }) => {
          if (!date) return null
          try {
            return <Text>{dateToExcelFormat(date)}</Text>
          } catch (e) {
            console.warn("can't format date", date)
            return null
          }
        },
      },
      ...columns,
    ]
  }
  return (
    <DataTable
      size="small"
      primaryKey="id"
      columns={columns}
      data={data.map((t) => {
        try {
          dateToExcelFormat(dateFromExcelFormat(t.date))
        } catch (e) {
          console.warn('date issue', t)
        }
        return {
          ...t,
          date: dateFromExcelFormat(t.date),
          month: `${dateFromExcelFormat(t.date).getMonth()}.${dateFromExcelFormat(t.date).getFullYear()}`,
        }
      })}
      onClickRow={({ datum }) => {
        if (datum.syncDate === undefined) {
          dispatch(transactionsSlice.actions.remove(datum.id))
        }
      }}
    />
  )
}
