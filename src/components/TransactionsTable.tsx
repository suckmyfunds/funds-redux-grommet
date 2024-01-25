import { DataTable, Text } from 'grommet'

import { useAppDispatch } from '../store'
import { transactionsSlice } from '../store/transactionsSlice'
import { TransactionRemote } from '../types'
import { dateToExcelFormat, parseExcelDate } from '../utils'

export default ({ data }: { data: TransactionRemote[] }) => {
  const dispatch = useAppDispatch()
  return (
    <DataTable
      columns={[
        { property: 'key', render: () => null },
        { property: 'date', header: <Text>Date</Text>, render: ({ date }) => <Text>{dateToExcelFormat(date)}</Text> },
        { property: 'amount', header: <Text>Amount</Text>, aggregate: 'sum', footer: { aggregate: true } },
        { property: 'description', header: <Text>Description</Text> },
        {
          property: 'synced',
          header: <Text>Synced</Text>,
          render: (payload) => <Text>{payload.synced ? 'Yes' : 'No'}</Text>,
        },
      ]}
      data={data.map((t) => ({ ...t, key: t.id, date: parseExcelDate(t.date) }))}
      sortable
      onClickRow={({ datum }) => {
        if (datum.syncDate === undefined) {
          dispatch(transactionsSlice.actions.remove(datum.id))
        }
      }}
    />
  )
}
