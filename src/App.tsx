import { Box, Nav, Sidebar } from 'grommet'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import ActionButton from './components/ActionButton'
import Button from './components/Button'
import FundDetailPage from './pages/FundDetailPage'
import { FundsPage } from './pages/FundsPage'
import StatsPage from './pages/Stats'
import SyncPage from './pages/SyncPage'
import { syncData } from './store/syncData'
import { makeMonthIncome } from './store/transactionsSlice'

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

export default function App() {
  const navigate = useNavigate()
  const location = useLocation().pathname

  //const synchronization = useSelector(isSynchronizing)
  const isFirstMonthDay = new Date().getDate() === 1

  return (
    <Box direction="row" height={{ min: '100%' }}>
      <Sidebar width={'small'}>
        <Nav pad={'10px'}>
          <Button onClick={() => navigate('/')} label="Home" disabled={location == '/'} />
          <ActionButton actionCreator={syncData} label="Update" />
          <Button onClick={() => navigate('/sync')} label="Sync" disabled={location == '/sync'} />
          <Button onClick={() => navigate('/stats')} label="Stats" disabled={location == '/stats'} />
          <Button onClick={() => navigate(-1)} label="back" disabled={location == '/'} />
          {/* <ActionButton actionCreator={clearLocals} label="Fix" color='status-critical'/> */}
          <ActionButton actionCreator={makeMonthIncome} label="New Month" disabled={!isFirstMonthDay} />
        </Nav>
      </Sidebar>
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
  )
}
