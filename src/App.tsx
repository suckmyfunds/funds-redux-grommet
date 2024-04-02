import '@mantine/core/styles.css'

import { AppShell, Burger, Container, Stack } from '@mantine/core'
import { Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ResponsiveContext } from 'grommet'
import { useCallback, useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import ActionButton from './components/ActionButton'
import FundDetailPage from './pages/FundDetailPage'
import { FundsPage } from './pages/FundsPage'
import StatsPage from './pages/Stats'
import SyncPage from './pages/SyncPage'
import { useAppDispatch } from './store'
import { authorize } from './store/authSlice'
import { selectIsAuthorized } from './store/authSlice'
import { fetchFunds } from './store/fundsSlice'
import { clearLocals } from './store/globalActions'
import { fetchTransactions, makeMonthIncome } from './store/transactionsSlice'
// const AppBar = (props: any) => (
//   <Box
//     tag='header'
//     direction='row'
//     align='center'
//     justify='between'
//     background='light-2'
//     pad={{ vertical: 'small', horizontal: 'medium' }}
//     elevation='medium'
//     {...props}
//   />
// );
function Menu({ navigate }: { navigate: (path: any) => void }) {
  const location = useLocation().pathname
  const size = useContext(ResponsiveContext)
  const authorized = useSelector(selectIsAuthorized)
  const dispatch = useAppDispatch()

  const init = useCallback(async () => {
    await dispatch(authorize()).unwrap()
  }, [authorize])

  return (
    <Container size="md">
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
        <ActionButton size={size} actionCreator={clearLocals} variant="outline" color="red">
          Fix
        </ActionButton>
        <ActionButton size={size} actionCreator={makeMonthIncome}>
          New Month
        </ActionButton>
      </Stack>
    </Container>
  )
}
export default function App() {
  const authorized = useSelector(selectIsAuthorized)
  const dispatch = useAppDispatch()
  const size = useContext(ResponsiveContext)

  //const synchronization = useSelector(isSynchronizing)
  //const isFirstMonthDay = new Date().getDate() === 1
  console.log('SIZE', size)
  const navigate = useNavigate()
  //const location = useLocation().pathname

  useEffect(() => {
    if (authorized) {
      dispatch(fetchFunds())
        .unwrap()
        .then(() => {
          dispatch(fetchTransactions())
        })
    }
  }, [authorized, fetchFunds, fetchTransactions])

  const [opened, { toggle }] = useDisclosure()
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </AppShell.Header>
      <AppShell.Navbar>
        <Menu navigate={navigate} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<FundsPage />} />
          <Route path="/detail/:id" element={<FundDetailPage />} />
          <Route path="/sync" element={<SyncPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}
