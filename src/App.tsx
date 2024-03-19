import { Box, Collapsible, ResponsiveContext, Sidebar } from 'grommet'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import ActionButton from './components/ActionButton'
import Button from './components/Button'
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
  return (
    <Sidebar>
      <Box direction="column" gap={size} fill>
        <Button size={size} onClick={() => navigate('/')} label="Home" disabled={location == '/'} />
        <Button size={size} onClick={() => navigate('/sync')} label="Sync" disabled={location == '/sync'} />
        <Button size={size} onClick={() => navigate('/stats')} label="Stats" disabled={location == '/stats'} />
        <Button size={size} onClick={() => navigate(-1)} label="back" disabled={location == '/'} />
        <ActionButton size={size} actionCreator={clearLocals} label="Fix" color="status-critical" />
        <ActionButton size={size} actionCreator={makeMonthIncome} label="New Month" />
      </Box>
    </Sidebar>
  )
}
export default function App() {
  const authorized = useSelector(selectIsAuthorized)
  const dispatch = useAppDispatch()
  const size = useContext(ResponsiveContext)
  const [menuShown, setMenuShown] = useState(false)
  const init = useCallback(async () => {
    await dispatch(authorize()).unwrap()
  }, [authorize, fetchFunds, fetchTransactions])

  //const synchronization = useSelector(isSynchronizing)
  //const isFirstMonthDay = new Date().getDate() === 1
  console.log('SIZE', size)
  const navigate = useNavigate()
  const location = useLocation().pathname

  useEffect(() => {
    if (authorized) {
      dispatch(fetchFunds())
        .unwrap()
        .then(() => {
          dispatch(fetchTransactions())
        })
    }
  }, [authorized, fetchFunds, fetchTransactions])

  if (!authorized) {
    return (
      <Box dir="column">
        <Button onClick={init} label="Authorize" />
      </Box>
    )
  }

  return (
    <Box direction="column">
      <Box direction="row" fill flex justify="between">
        <Button onClick={() => setMenuShown(!menuShown)} label="menu" size={size} />
        {location !== '/' && <Button onClick={() => navigate('/')} label="back" size={size} />}
      </Box>

      {size == 'small' && (
        <Collapsible direction="vertical" open={menuShown}>
          <Menu
            navigate={(path: any) => {
              setMenuShown(false)
              navigate(path)
            }}
          />
        </Collapsible>
      )}
      <Box direction="row" height={{ min: '100%' }}>
        {(size == 'medium' || size == 'large') && <Menu navigate={(p) => navigate(p)} />}
        <Box pad="small" fill>
          {/* <AnimatePresence> */}
          <Routes>
            <Route path="/" element={<FundsPage />} />
            <Route path="/detail/:id" element={<FundDetailPage />} />
            <Route path="/sync" element={<SyncPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
          {/* </AnimatePresence> */}
        </Box>
      </Box>
    </Box>
  )
}
