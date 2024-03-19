import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import FundComponent from '../components/Fund'
import TransactionsTable from '../components/TransactionsTable'
import { selectFundTransactions } from '../store/transactionsSlice'

export default function FundDetailPage() {
  const { id } = useParams()
  const transactions = useSelector((s) => selectFundTransactions(s, id!))

  return (
    <>
      <FundComponent fundId={id!} />
      <div style={{ marginTop: 20 }}>
        <TransactionsTable data={transactions} />
      </div>
    </>
  )
}
