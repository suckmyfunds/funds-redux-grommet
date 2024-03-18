import { useSelector } from 'react-redux'

import FundList from '../components/FundList'
import { selectFundsIds } from '../store/fundsSlice'

export function FundsPage() {
  const fundIds = useSelector(selectFundsIds)
  //const fundsStatus = useSelector(selectStatus)
  if (fundIds.length === 0) {
    return <div>No funds found</div>
  }

  return <FundList fundIds={fundIds} />
}
