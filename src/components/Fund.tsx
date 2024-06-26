import { Box, Card, Grid, Stack, Text } from 'grommet'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useAppDispatch } from '../store'
import { selectFund, selectFundAVGExpense } from '../store/selectors'
import { addTransactionToFund } from '../store/transactionsSlice'
import { dateToExcelFormat } from '../utils'
import BudgetBar from './BudgetBar'
import TransactionEditor from './TransactionEditor'

export default function Fund({ fundId, onClick }: { fundId: string; onClick?: () => void }) {
  const { name, budget, balance, synced } = useSelector((s) => selectFund(s, fundId))
  const handleOnClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onClick && onClick()
    },
    [onClick]
  )
  const avgExpense = useSelector((s) => selectFundAVGExpense(s, fundId))

  const dispatch = useAppDispatch()
  const createTransaction = useCallback(
    ({ description, amount }: { description: string; amount: string }) => {
      dispatch(
        addTransactionToFund({
          description,
          amount: parseFloat(amount),
          date: dateToExcelFormat(new Date()),
          synced: false,
          fundId,
          type: 'EXPENSE',
        })
      )
    },
    [dispatch]
  )

  return (
    <Card>
      <Grid
        rows={['auto', '3fr', 'auto']}
        pad={'20px'}
        columns={['3fr', '1fr']}
        gap={'10px'}
        areas={[
          { name: 'name', start: [0, 0], end: [2, 0] },
          { name: 'balance', start: [0, 1], end: [2, 1] },
          { name: 'transactions', start: [0, 2], end: [2, 2] },
        ]}
      >
        <Box gridArea="name" direction="row" flex fill="horizontal" onClick={handleOnClick} wrap>
          <Box flex direction="row">
            <Stack>
              <Text>{name}</Text>
              {/* <Text>initial: {initialBalance?.toFixed(2)}</Text> */}
              {synced && <Box background="status-critical" pad={{ horizontal: 'xsmall' }} round></Box>}
            </Stack>
          </Box>
          <Box direction="row" gap={'xsmall'}>
            <Text>{budget.toFixed(2)}</Text>
            <Text color={budget >= avgExpense ? 'green' : 'red'}>(~ {avgExpense.toFixed(2)})</Text>
          </Box>
        </Box>
        <Box gridArea="balance" gap="small">
          <Box direction="column" fill align="center">
            <Text>{balance.toFixed(2)}</Text>
            <BudgetBar budget={budget} balance={balance} warnPercent={15} />
          </Box>
        </Box>
        <Box gridArea="transactions">
          <TransactionEditor onSubmit={createTransaction} />
        </Box>
      </Grid>
    </Card>
  )
}
