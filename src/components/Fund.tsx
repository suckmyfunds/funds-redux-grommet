import {Card, Flex, Group, Stack, Text} from '@mantine/core'
import React, {useCallback} from 'react'
import {useSelector} from 'react-redux'

import {useAppDispatch} from '../store'
import {selectFund} from '../store/selectors'
import {addTransactionToFund} from '../store/transactionsSlice'
import {dateToExcelFormat} from '../utils'
import BudgetBar from './BudgetBar'
import TransactionEditor from './TransactionEditor'

export default function Fund({fundId, onClick}: {fundId: string; onClick?: () => void}) {
    const {name, budget, balance, lastMonthExpensed} = useSelector((s) => selectFund(s, fundId))
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
        ({description, amount}: {description: string; amount: string}) => {
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
    console.log("render fund ", name)
    return (
        <Card padding="xs" withBorder>
            <Stack gap="xs" >
                <Flex justify="space-between" onClick={handleOnClick}>
                    <Text>{name}: {budget.toFixed(2)}</Text>
                    <Group gap="xs">
                        {balance < 0 && <Text c="red">долг: {balance.toFixed(2)}</Text>}
                    </Group>
                </Flex>
                <BudgetBar budget={budget} balance={balance > 0 ? balance : budget - lastMonthExpensed} warnPercent={15} />
                <TransactionEditor onSubmit={createTransaction} />
            </Stack>
        </Card>
    )
}
