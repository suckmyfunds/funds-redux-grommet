import React, { PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import FundComponent from '../components/Fund'
import TransactionsTable from '../components/TransactionsTable'
import { selectFundTransactions } from '../store/transactionsSlice'

class ErrorBoundary extends React.Component<PropsWithChildren, { hasError: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo)
    location.href = '/'
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}

export default function FundDetailPage() {
  const { id } = useParams()
  const transactions = useSelector((s) => selectFundTransactions(s, id!))
  return (
    <ErrorBoundary>
      <FundComponent fundId={id!} />
      <div style={{ marginTop: 20 }}>
        <TransactionsTable data={transactions} />
      </div>
    </ErrorBoundary>
  )
}
