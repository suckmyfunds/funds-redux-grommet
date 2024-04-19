import { Box } from 'grommet'
import { useSelector } from 'react-redux'

import TransactionsTable from '../../components/TransactionsTable'
import { selectTransactionsForAccountSync } from '../../store/selectors'

export const SyncTransactions = () => {
  const unsyncedTransactions = useSelector(selectTransactionsForAccountSync)
  // const dispatch = useAppDispatch()
  // const makeTransactionSync = useCallback((id: string) => {
  //     dispatch(makeSync(id))
  // }, [dispatch])
  return (
    <Box gap="small" direction="row" flex fill>
      <TransactionsTable data={Object.values(unsyncedTransactions).flat()} />
    </Box>
  )
}
