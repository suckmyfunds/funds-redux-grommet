import { useSelector } from 'react-redux'
import { FundsPage } from './pages/FundsPage'
import { selectStatus } from './store/fundsSlice'

import { RootState, authorize, useAppDispatch } from './store'
import { useCallback } from 'react'
import Button from './components/Button'

function AuthButton() {
  const dispatch = useAppDispatch()
  const _authorize = useCallback(() => dispatch(authorize()), [dispatch])
  return <Button onClick={_authorize}>
    Login
  </Button>
}

function App() {
  const authorized = useSelector((state: RootState) => state.auth.token !== "")
  return <div>
    {!authorized && <AuthButton />}
    <FundsPage />
  </div>
}

export default App
