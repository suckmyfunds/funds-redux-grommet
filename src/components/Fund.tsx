import { Box, Card, DataChart, Grid, ResponsiveContext, Stack, Text } from 'grommet'
import React, { useCallback, useContext } from 'react'
import { useSelector } from 'react-redux'

import { useAppDispatch } from '../store'
import { selectFund } from '../store/fundsSlice'
import { addTransactionToFund } from '../store/transactionsSlice'
import { dateToExcelFormat } from '../utils'
import BudgetBar from './BudgetBar'
import TransactionEditor from './TransactionEditor'

export default function Fund({ fundId, onClick }: { fundId: string; onClick?: () => void }) {
  const { name, budget, balance, synced, initialBalance, expenseMedians } = useSelector((s) => selectFund(s, fundId))
  const size = useContext(ResponsiveContext)
  const handleOnClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onClick && onClick()
    },
    [onClick]
  )

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
              {synced && <Box background="status-critical" pad={{ horizontal: 'xsmall' }} round></Box>}
            </Stack>
          </Box>
          <Box>
            {budget.toFixed(2)}({initialBalance?.toFixed(2)})
          </Box>
        </Box>
        <Box gridArea="balance" gap="small">
          <Box direction="column" fill align="center">
            {size !== 'small' && (
              <Box fill align="center" pad="small">
                <DataChart
                  data={expenseMedians}
                  series={[
                    { property: 'date', label: 'Month' },
                    { property: 'sum', label: 'Expense', render: (v) => v.toFixed(2) },
                  ]}
                  chart="sum"
                  detail
                  guide
                  axis
                />
              </Box>
            )}
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
