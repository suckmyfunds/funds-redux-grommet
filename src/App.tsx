import { Box, Nav, Sidebar } from 'grommet';
import { useSelector } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ActionButton from './components/ActionButton';
import Button from './components/Button';
import FundDetailPage from './pages/FundDetailPage';
import { FundsPage } from './pages/FundsPage';
import StatsPage from './pages/Stats';
import SyncPage from './pages/SyncPage';
import { isSynchronizing } from './store/fundsSlice';
import { clearLocals } from './store/globalActions';
import { syncData } from "./store/syncData";
import { makeMonthIncome } from './store/transactionsSlice';

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
  const navigate = useNavigate();
  const synchronization = useSelector(isSynchronizing)
   const isFirstMonthDay = (new Date()).getDate() === 1

  return <Box direction="row" height={{ min: '100%' }}>
    <Sidebar width={'small'}>
      <Nav background="brand" pad={"10px"}>
        <ActionButton actionCreator={syncData} label="Update" />
        <ActionButton actionCreator={makeMonthIncome} label="New Month" disabled={!isFirstMonthDay} />
        <ActionButton actionCreator={clearLocals} label="Fix" />
        <Button onClick={() => navigate("/sync")} label="Sync" />
        <Button onClick={() => navigate("/stats")} label="Stats" />
      </Nav>
    </Sidebar >
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
  </Box >
}