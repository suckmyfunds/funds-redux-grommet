import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { FundsPage } from './pages/FundsPage'
import FundDetailPage from './pages/FundDetailPage';
import { syncData } from "./store";
import ActionButton from './components/ActionButton';

const router = createBrowserRouter([
  {
    path: "/",
    element: <FundsPage />,
  },
  {
    path: '/detail/:id',
    element: <FundDetailPage />,
  }

]);

function App() {
  return <div>
    <ActionButton actionCreator={syncData} name="synchronize" />
    <RouterProvider router={router} />
  </div>
}

export default App
