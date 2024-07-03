import { Box, Card, Chip, Flex, Indicator, Stack, Text } from '@mantine/core'
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
    <Card padding="lg" withBorder>
      <Flex justify="space-between">
        <Flex onClick={handleOnClick}>
          <Indicator color="red" disabled={synced}>
            <Text>{name}</Text>
            {/* <Text>initial: {initialBalance?.toFixed(2)}</Text> */}
          </Indicator>
        </Flex>
        <Flex gap="xs">
          <Text>{budget.toFixed(2)}</Text>
          <Text color={budget >= avgExpense ? 'green' : 'red'}>(~ {avgExpense.toFixed(2)})</Text>
        </Flex>
      </Flex>
      <Stack align="stretch" gap="xs">
        <Text>{balance.toFixed(2)}</Text>
        <BudgetBar budget={budget} balance={balance} warnPercent={15} />
      </Stack>
      <TransactionEditor onSubmit={createTransaction} />
    </Card>
  )
}
