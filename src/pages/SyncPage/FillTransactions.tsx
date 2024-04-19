import { em, Flex, Grid, Stack, Table, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Calendar as Calendar_ } from 'grommet'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import Button from '../../components/Button'
import TransactionEditor from '../../components/TransactionEditor'
import { RootState, selectAllFunds, useAppDispatch } from '../../store'
import { selectFund, selectTransactionsOnDate } from '../../store/selectors'
import { tempSlice } from '../../store/temp'
import { transactionsSlice } from '../../store/transactionsSlice'
import { dateFromExcelFormat, dateToExcelFormat } from '../../utils'
import { CalendarDayBox } from './CalendarDayBox'

export const FillTransactions = () => {
  const isMobile = useMediaQuery(`(max-width: ${em(1100)})`)
  return (
    <Grid>
      {isMobile ? (
        <>
          <Grid.Col span={12}>
            <Calendar />
            <FundsSelection />
          </Grid.Col>
        </>
      ) : (
        <>
          <Grid.Col span={6}>
            <Calendar />
          </Grid.Col>
          <Grid.Col span={6}>
            <FundsSelection />
          </Grid.Col>
        </>
      )}
    </Grid>
  )
}
function FundsSelection() {
  const dispatch = useAppDispatch()

  const date: string = useSelector((s: RootState) => s.temp.currentDate)
  const funds = useSelector(selectAllFunds)
  const currentFundId: string = useSelector((s: RootState) => s.temp.currentFund)

  const setCurrentFund = useCallback(
    (fund: string | undefined) => {
      dispatch(tempSlice.actions.setCurrentFund(fund))
    },
    [dispatch]
  )
  const maybeFund = useSelector((s) => (currentFundId ? selectFund(s, currentFundId) : undefined))

  const currentTransactions = useSelector((s) => selectTransactionsOnDate(s, dateFromExcelFormat(date), currentFundId))
  const createTransaction = useCallback(
    ({ description, amount }: { description: string; amount: string }) => {
      if (currentFundId === undefined) return
      dispatch(
        transactionsSlice.actions.add({
          fundId: currentFundId!,
          description,
          amount: parseFloat(amount),
          date: date,
          synced: false,
          type: 'EXPENSE',
        })
      )
    },
    [dispatch, date, currentFundId]
  )
  return (
    <Stack>
      <Flex gap="xs" wrap="wrap">
        <Button variant={currentFundId === undefined ? 'filled' : 'outline'} onClick={() => setCurrentFund(undefined)}>
          All
        </Button>
        {funds.map((f) => {
          return (
            <Button
              key={f.id}
              variant={currentFundId === f.id ? 'filled' : 'outline'}
              onClick={() => setCurrentFund(f.id)}
            >
              {f.name}
            </Button>
          )
        })}
      </Flex>
      <TransactionEditor onSubmit={createTransaction} disabled={currentFundId === undefined} />
      {maybeFund?.balance && maybeFund?.name && (
        <Text>
          {maybeFund?.name}: {maybeFund?.balance?.toFixed(2)}
        </Text>
      )}
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Description</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {currentTransactions.map((tr) => (
            <Table.Tr key={tr.id}>
              <Table.Td>{tr.date}</Table.Td>
              <Table.Td>{tr.amount}</Table.Td>
              <Table.Td>{tr.description}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}

function Calendar() {
  const currentFund = useSelector((s: RootState) => s.temp.currentFund)
  const dispatch = useAppDispatch()
  const setDate = useCallback(
    (date: Date) => {
      dispatch(tempSlice.actions.setDate(dateToExcelFormat(date)))
    },
    [dispatch]
  )
  const date: string = useSelector((s: RootState) => s.temp.currentDate)
  const onSelectDate = (nextDate: any) => {
    setDate(new Date(nextDate))
  }
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setDate(new Date())
        }}
      >
        Today
      </Button>
      <Calendar_ date={dateFromExcelFormat(date).toISOString()} onSelect={onSelectDate}>
        {(props: any) => (
          <CalendarDayBox
            key={dateToExcelFormat(props.date)}
            {...props}
            fundId={currentFund}
            onSelectDate={onSelectDate}
          />
        )}
      </Calendar_>
    </>
  )
}
