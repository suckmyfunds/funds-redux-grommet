import { useSelector } from 'react-redux'

import FundList from '../components/FundList'
import { selectFundsIds, selectStatus } from '../store/fundsSlice'

export function FundsPage() {
  const fundIds = useSelector(selectFundsIds)
  const fundsStatus = useSelector(selectStatus)
  if (fundIds.length === 0) {
    return <div>No funds found</div>
  }
  if (fundsStatus === 'loading') {
    return <div>Synchronizing...</div>
  }

  return <FundList fundIds={fundIds} />
}
