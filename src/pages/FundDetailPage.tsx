import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import Button from '../components/Button'
import FundComponent from '../components/Fund'
import TransactionsTable from '../components/TransactionsTable'
import { selectFundTransactions } from '../store/transactionsSlice'

export default function FundDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const transactions = useSelector((s) => selectFundTransactions(s, id!))

  return (
    <>
      <Button onClick={() => nav('/')}>back</Button>
      <FundComponent fundId={id!} />
      <div style={{ marginTop: 20 }}>
        <TransactionsTable data={transactions} />
      </div>
    </>
  )
}
