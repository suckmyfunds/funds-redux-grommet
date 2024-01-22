import { useSelector } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ActionButton from './components/ActionButton';
import Button from './components/Button';
import FundDetailPage from './pages/FundDetailPage';
import { FundsPage } from './pages/FundsPage';
import SyncPage from './pages/SyncPage';
import { isSynchronizing } from './store/fundsSlice';
import { syncData } from "./store/syncData";
import { makeMonthIncome } from './store/transactionsSlice';
import StatsPage from './pages/Stats';
import { clearLocals } from './store/globalActions';

export default function App() {
  const navigate = useNavigate();
  const synchronization = useSelector(isSynchronizing)
  return <div>
    <ActionButton actionCreator={syncData}>synchronize</ActionButton>
    <ActionButton actionCreator={makeMonthIncome}>make month income</ActionButton>
    <ActionButton actionCreator={clearLocals}>cleanLocal</ActionButton>
    <Button onClick={() => navigate("/sync")}>sync</Button>
    <Button onClick={() => navigate("/stats")}>stats</Button>
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