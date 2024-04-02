import { Box, DataTable, Text } from 'grommet'
import { useSelector } from 'react-redux'

import { selectUnsyncedTransactions } from '../../store/selectors'
import { amountFormatter } from '.'

export const SyncTransactions = () => {
  const unsyncedTransactions = useSelector(selectUnsyncedTransactions)
  // const dispatch = useAppDispatch()
  // const makeTransactionSync = useCallback((id: string) => {
  //     dispatch(makeSync(id))
  // }, [dispatch])
  return (
    <Box gap="small" direction="row" flex fill>
      <DataTable
        columns={[
          { property: 'id', render: () => null, primary: true },
          { property: 'fundName', header: <Text>Fund</Text>, size: '150px' },
          { property: 'date', header: <Text>Date</Text>, size: '100px' },
          {
            property: 'amount',
            header: <Text>Amount</Text>,
            size: '150px',
            aggregate: 'sum',
            footer: { aggregate: true },
            render: (datum) => <Text>{amountFormatter.format(datum.amount)}</Text>,
          },
          { property: 'description', header: <Text>Description</Text> },
          { property: 'synced', header: <Text>Synced</Text>, align: 'end' },
        ]}
        groupBy="fundName"
        data={Object.keys(unsyncedTransactions).flatMap((fundName) =>
          unsyncedTransactions[fundName].map((t) => ({ ...t, fundName }))
        )}
      />
    </Box>
  )
}
