import {Card, Flex, Group, Stack, Text} from '@mantine/core'
import React, {useCallback} from 'react'
import {useSelector} from 'react-redux'

import {useAppDispatch} from '../store'
import {selectFund, selectFundAVGExpense} from '../store/selectors'
import {addTransactionToFund} from '../store/transactionsSlice'
import {dateToExcelFormat, dayMY} from '../utils'
import BudgetBar from './BudgetBar'
import TransactionEditor from './TransactionEditor'
import InlineMonthExpenseChart from './InlineMonthExpenseChart'

export default function Fund({fundId, onClick}: {fundId: string; onClick?: () => void}) {
    const {name, budget, balance, lastMonthExpensed, transactions} = useSelector((s) => selectFund(s, fundId))
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
    const thisMonth = dayMY(new Date())

    console.log("render fund ", name)
    return (
        <Card padding="lg" withBorder>
            <Stack>
                <Flex justify="space-between">
                    <Flex onClick={handleOnClick}>
                        {/* <Indicator color="red" disabled={synced} zIndex={10} size='7'> */}
                        <Text>{name}</Text>
                        {/* <Text>initial: {initialBalance?.toFixed(2)}</Text> */}
                        {/* </Indicator> */}
                    </Flex>
                    <Group gap="xs">
                        { /*<InlineMonthExpenseChart monthesCount={5} transactions={transactions} height={30} width={300}/>*/}
                        <Text>{budget.toFixed(2)}</Text>
                        <Text color={lastMonthExpensed > budget ? 'red' : 'orange'}>({lastMonthExpensed.toFixed(2)})</Text>
                        <Text color={budget >= avgExpense ? 'green' : 'red'}>(avg: {avgExpense.toFixed(2)})</Text>
                    </Group>
                </Flex>
                <BudgetBar budget={budget} balance={balance} warnPercent={15} />
                <TransactionEditor onSubmit={createTransaction} />
            </Stack>
        </Card>
    )
}
