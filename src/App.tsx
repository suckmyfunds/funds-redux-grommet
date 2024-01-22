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
import { Box } from 'grommet';

const AppBar = (props: any) => (
  <Box
    tag='header'
    direction='row'
    align='center'
    justify='between'
    background='light-2'
    pad={{ vertical: 'small', horizontal: 'medium' }}
    elevation='medium'
    {...props}
  />
);

export default function App() {
  const navigate = useNavigate();
  const synchronization = useSelector(isSynchronizing)
  return <div>
    <AppBar>
      <Box direction='column'>
        <ActionButton actionCreator={syncData}>synchronize</ActionButton>
        <ActionButton actionCreator={makeMonthIncome}>make month income</ActionButton>
        <ActionButton actionCreator={clearLocals}>cleanLocal</ActionButton>
        <Button onClick={() => navigate("/sync")}>sync</Button>
        <Button onClick={() => navigate("/stats")}>stats</Button>
      </Box>
    </AppBar>

    {/* <AnimatePresence> */}
    <Routes>
      <Route path="/" element={<FundsPage />} />
      <Route path="/detail/:id" element={<FundDetailPage />} />
      <Route path="/sync" element={<SyncPage />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
    {/* </AnimatePresence> */}

  </div>
}