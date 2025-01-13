import '@mantine/core/styles.css'

import {AppShell, Box, Burger, Button, Flex, Progress, Stack, Text, TextInput} from '@mantine/core'
import {useDisclosure} from '@mantine/hooks'
import {ResponsiveContext} from 'grommet'
import {useCallback, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom'

import ActionButton from './components/ActionButton'
import Accounts from './pages/Accounts'
import FundDetailPage from './pages/FundDetailPage'
import {FundsPage} from './pages/FundsPage'
import StatsPage from './pages/Stats'
import SyncPage from './pages/SyncPage'
import {makeMonthIncome, selectAllFunds, selectFundThisMonthExpense, selectThisMonthExpense, useAppDispatch} from './store'
import {authorize, selectIsAuthorized} from './store/authSlice'
import {createFund, fetchFunds, selectFundById, selectFundsIds} from './store/fundsSlice'
import {clearLocals} from './store/globalActions'
import {fetchTransactions, sendTempTransactions} from './store/transactionsSlice'
import {WantsPage} from './pages/Wants'

function Menu({navigate}: {navigate: (path: any) => void}) {
    const location = useLocation().pathname
    const size = useContext(ResponsiveContext)
    const authorized = useSelector(selectIsAuthorized)
    const dispatch = useAppDispatch()

    const init = useCallback(() => {
        dispatch(authorize())
    }, [authorize])
    return (
        <Stack>
            {!authorized && (
                <Button variant="filled" onClick={init}>
                    Authorize
                </Button>
            )}
            <Button size={size} onClick={() => navigate('/')} disabled={location == '/'} variant="fill">
                Home
            </Button>
            <Button size={size} onClick={() => navigate('/sync')} disabled={location == '/sync'}>
                Sync
            </Button>
            <Button size={size} onClick={() => navigate('/stats')} disabled={location == '/stats'}>
                Stats
            </Button>
            <Button size={size} onClick={() => navigate('/accounts')} disabled={location == '/accounts'}>
                Accounts
            </Button>
            <Button size={size} onClick={() => navigate('/wants')} disabled={location == '/wants'}>
                Wants
            </Button>

            <ActionButton size={size} actionCreator={clearLocals} variant="outline" color="red">
                Fix
            </ActionButton>
            <ActionButton size={size} actionCreator={makeMonthIncome}>
                New Month
            </ActionButton>
            <Button size={size} onClick={() => navigate('/new-fund')}>
                Add Fund
            </Button>
        </Stack>
    )
}
export default function App() {
    const authorized = useSelector(selectIsAuthorized)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (authorized) {
            dispatch(fetchFunds())
                .unwrap()
                .then(() => {
                    dispatch(sendTempTransactions())
                        .unwrap()
                        .then(() => dispatch(fetchTransactions()))
                })
        }
    }, [authorized, fetchFunds, fetchTransactions])

    const [opened, {toggle}] = useDisclosure()

    const navigate_ = useCallback(
        (path: string) => {
            navigate(path)
            console.log('burger state', opened)
            toggle()
        },
        [opened]
    )
    const overallBudget = useSelector((s) => {
        return selectAllFunds(s).reduce((s, f) => s + f.budget, 0)
    })

    const overallMonthSpend = useSelector(selectThisMonthExpense)
    const budgetDiff = overallMonthSpend - overallBudget

    return (
        <AppShell
            header={{height: 60}}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: {mobile: !opened},
            }}
            padding="md"
        >
            <AppShell.Header p="xs">
                <Flex align="center" gap="sm">
                    <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Stack gap="0">
                            <Flex>
                                <Text>Budget: {overallBudget.toFixed(2)}</Text>
                                <Text>This month: {overallMonthSpend.toFixed(2)}, left: ({Math.abs(budgetDiff).toFixed(2)})</Text>
                            </Flex>
                            <Progress.Root size="xl">
                                <Progress.Section value={budgetDiff >= 0 ? 0 : (overallBudget-overallMonthSpend)/overallBudget*100}>
                                <Progress.Label>{Math.abs(budgetDiff).toFixed(2)}</Progress.Label>
                                </Progress.Section>
                            </Progress.Root>
                        </Stack>
                </Flex>
            </AppShell.Header>
            <AppShell.Navbar p="sm">
                <Menu navigate={navigate_} />
            </AppShell.Navbar>
            <AppShell.Main>
                <Routes>
                    <Route path="/" element={<FundsPage />} />
                    <Route path="/detail/:id" element={<FundDetailPage />} />
                    <Route path="/sync" element={<SyncPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/new-fund" element={<NewFund />} />
                    <Route path="/wants" element={<WantsPage />} />
                </Routes>
            </AppShell.Main>
        </AppShell>
    )
}

export function NewFund() {
    const [name, setName] = useState('')
    const [budget, setBudget] = useState(0)
    const dispatch = useAppDispatch()

    const submit = useCallback(() => {
        dispatch(createFund({name, budget, initialBalance: 0}))
    }, [dispatch, name, budget])
    return (
        <Box>
            <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput label="Budget" value={budget} onChange={(e) => setBudget(Number.parseFloat(e.target.value))} />
            <Button onClick={submit}>Submit</Button>
        </Box>
    )
}
