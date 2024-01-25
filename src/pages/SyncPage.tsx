import { nanoid } from "@reduxjs/toolkit";
import { Box, Calendar, DataTable, Grid, RadioButtonGroup, Stack, Text } from "grommet";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../components/Button";
import TransactionEditor from "../components/TransactionEditor";
import TransactionsTable from "../components/TransactionsTable";
import { selectAllFunds, useAppDispatch } from "../store";
import { selectTransactionsOnDate, selectUnsyncedTransactions } from "../store/selectors";
import { makeSync, transactionsSlice } from "../store/transactionsSlice";
import { dateToExcelFormat } from "../utils";


const amountFormatter = new Intl.NumberFormat('ru-RU',
    {
        style: 'currency',
        currency: "RUB",
        maximumFractionDigits: 2
    })

const SyncTransactions = () => {
    const unsyncedTransactions = useSelector(selectUnsyncedTransactions)
    const dispatch = useAppDispatch()
    const makeTransactionSync = useCallback((id: string) => {
        dispatch(makeSync(id))
    }, [dispatch])

    return <Box gap="small" direction="row" flex fill>
        <DataTable
            columns={[
                { property: 'id', render: () => null, primary: true },
                { property: 'fundName', header: <Text>Fund</Text>, size: "150px" },
                { property: "date", header: <Text>Date</Text>, size: "100px" },
                {
                    property: "amount", header: <Text>Amount</Text>, size: "150px",
                    aggregate: 'sum', footer: { aggregate: true }, render: (datum) => <Text>{amountFormatter.format(datum.amount)}</Text>,

                },
                { property: "description", header: <Text>Description</Text> },
                { property: "synced", header: <Text>Synced</Text>, align: "end" },



            ]}

            groupBy="fundName"
            data={
                Object.keys(unsyncedTransactions)
                    .flatMap((fundName) => unsyncedTransactions[fundName].map(t => ({ ...t, fundName })))
            } />

    </Box >
}

const CalendarDayBox = ({ date, day, isSelected, onSelectDate, fundId }: { date: Date, day: number, isSelected: boolean, onSelectDate: (nextDate: any) => void, fundId?: string }) => {
    const trCount = useSelector(s => selectTransactionsOnDate(s, date, fundId).length)

    return <Box
        background={isSelected ? 'light-3' : 'white'}
        onClick={() => onSelectDate(date.toISOString())}
        fill
    >
        <Stack anchor="top-right" fill>
            <Box pad="small" align="center" justify="center" fill>
                <Text size="large">{day}</Text>
            </Box>
            {trCount ? (
                <Box align="right" justify="start" color="accent-1"><Text color="brandc" size="xsmall">{trCount}</Text></Box>
            ) : null}
        </Stack>
    </Box>

}


const FillTransactions = () => {
    const funds = useSelector(selectAllFunds)
    const [currentFund, setCurrentFund] = useState<string | undefined>(undefined)

    const [date, setDate] = useState(new Date());
    const dispatch = useAppDispatch()

    const currentTransactions = useSelector(s => selectTransactionsOnDate(s, date, currentFund))
    //console.log(currentTransactions, dateToExcelFormat(date), currentFund)
    const createTransaction = useCallback(({ description, amount }: { description: string, amount: string }) => {
        dispatch(transactionsSlice.actions.add({
            fundId: currentFund!,
            description,
            amount: parseFloat(amount),
            date: dateToExcelFormat(date),
            synced: false,
            type: "EXPENSE",
            id: nanoid()
        }))
    }, [dispatch, date, currentFund])
    const onSelectDate = (nextDate: any) => {
        setDate(new Date(nextDate));
    };

    return <Grid gap="medium" columns={["medium", "auto"]} fill>
        <Box direction="column" gap="xsmall">
            <Button secondary onClick={() => { setDate(new Date()) }} label="Today" />
            <Calendar date={date.toISOString()} onSelect={onSelectDate}>
                {(props) => <CalendarDayBox key={dateToExcelFormat(props.date)} {...props} fundId={currentFund} onSelectDate={onSelectDate} />}
            </Calendar>
        </Box>
        <Box direction="column" gap="xsmall">
            <Grid gap="small" columns={["1fr", "1fr", "1fr", "1fr"]}>
                <Button secondary primary={currentFund === undefined} onClick={() => setCurrentFund(undefined)} label="All" />
                {funds.map(f => {
                    return <Button key={f.id}
                        secondary primary={currentFund === f.id}
                        onClick={() => setCurrentFund(f.id)} label={f.name} />
                })}
            </Grid>
            <TransactionEditor onSubmit={createTransaction} disabled={currentFund === undefined} />
            <TransactionsTable data={currentTransactions} />
        </Box>
    </Grid>
}

const modeComponent: Record<string, JSX.Element> = {
    st: <SyncTransactions />,
    ft: <FillTransactions />
}

export default function () {


    const postMethods = [
        { label: 'Sync transactions', value: 'st' },
        { label: 'Fill transactions', value: 'ft' },
    ];
    const [mode, setMode] = useState('ft')
    return (
        <Box flex gap="small">
            <RadioButtonGroup
                name="radio"
                options={postMethods}
                value={mode}
                onChange={(event: any) => setMode(event.value)}
            />

            {modeComponent[mode]}
        </Box>
    )
}