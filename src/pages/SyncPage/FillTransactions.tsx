import { em, Flex, Grid, Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Calendar as Calendar_ } from 'grommet'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import Button from '../../components/Button'
import TransactionEditor from '../../components/TransactionEditor'
import TransactionsTable from '../../components/TransactionsTable'
import { RootState, selectAllFunds, useAppDispatch } from '../../store'
import { selectTransactionsOnDate } from '../../store/selectors'
import { tempSlice } from '../../store/temp'
import { transactionsSlice } from '../../store/transactionsSlice'
import { dateFromExcelFormat, dateToExcelFormat } from '../../utils'
import { CalendarDayBox } from './CalendarDayBox'

export const FillTransactions = () => {
  const currentFund = useSelector((s: RootState) => tempSlice.getSelectors().getCurrentFund(s))
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`)
  return (
    <Grid>
      {isMobile ? (
        <>
          <Grid.Col span={6}>
            <Calendar currentFund={currentFund} />
            <FundsSelection />
          </Grid.Col>
        </>
      ) : (
        <>
          <Grid.Col span={6}>
            <Calendar currentFund={currentFund} />
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

  const date = useSelector((s: RootState) => s.temp.currentDate)
  const funds = useSelector(selectAllFunds)
  const currentFund = useSelector((s: RootState) => tempSlice.getSelectors().getCurrentFund(s))
  const setCurrentFund = useCallback(
    (fund: string | undefined) => {
      dispatch(tempSlice.actions.setCurrentFund(fund))
    },
    [dispatch]
  )

  const currentTransactions = useSelector((s) => selectTransactionsOnDate(s, dateFromExcelFormat(date), currentFund))
  const createTransaction = useCallback(
    ({ description, amount }: { description: string; amount: string }) => {
      dispatch(
        transactionsSlice.actions.add({
          fundId: currentFund!,
          description,
          amount: parseFloat(amount),
          date: dateToExcelFormat(date),
          synced: false,
          type: 'EXPENSE',
        })
      )
    },
    [dispatch, date, currentFund]
  )
  return (
    <Stack>
      <Flex gap="xs" wrap="wrap">
        <Button variant={currentFund === undefined ? 'filled' : 'outline'} onClick={() => setCurrentFund(undefined)}>
          All
        </Button>
        {funds.map((f) => {
          return (
            <Button
              key={f.id}
              variant={currentFund === f.id ? 'filled' : 'outline'}
              onClick={() => setCurrentFund(f.id)}
            >
              {f.name}
            </Button>
          )
        })}
      </Flex>
      <TransactionEditor onSubmit={createTransaction} disabled={currentFund === undefined} />
      <TransactionsTable data={currentTransactions} withoutDate />
    </Stack>
  )
}

function Calendar({ currentFund }: { currentFund: string | undefined }) {
  const dispatch = useAppDispatch()
  const setDate = useCallback(
    (date: Date) => {
      dispatch(tempSlice.actions.setDate(dateToExcelFormat(date)))
    },
    [dispatch]
  )
  const date = useSelector((s: RootState) => s.temp.currentDate)
  console.log('calendar', date)
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
