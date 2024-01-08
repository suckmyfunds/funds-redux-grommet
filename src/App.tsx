import { BrowserRouter, Route, Routes, createBrowserRouter } from 'react-router-dom';
import ActionButton from './components/ActionButton';
import FundDetailPage from './pages/FundDetailPage';
import { FundsPage } from './pages/FundsPage';
import { syncData } from "./store/syncData";
import { makeMonthIncome } from './store/transactionsSlice';

const router = createBrowserRouter([
  {
    path: "/",
    element: <FundsPage />,
  },
  {
    path: '/detail/:id',
    element: <FundDetailPage />,
  },

]);

function App() {
  return <div>
    <ActionButton actionCreator={syncData} name="synchronize" />
    <ActionButton actionCreator={makeMonthIncome} name="make month income" />
    <BrowserRouter>
      {/* <AnimatePresence> */}
        <Routes>
          <Route path="/" element={<FundsPage />} />
          <Route path="/detail/:id" element={<FundDetailPage />} />
        </Routes>
      {/* </AnimatePresence> */}
    </BrowserRouter>
  </div>
}

export default App
