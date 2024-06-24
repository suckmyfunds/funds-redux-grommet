import { Stack } from '@mantine/core'
import React, { PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import FundComponent from '../components/Fund'
import TransactionsTable from '../components/TransactionsTable'
import { selectFundChartData, selectFundTransactions } from '../store/selectors'
import { ECharts, ReactEChartsProps } from './ECharts'

class ErrorBoundary extends React.Component<PropsWithChildren, { hasError: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
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
  const fundData = useSelector((s) => selectFundChartData(s, id!))
  const chartData: ReactEChartsProps['option'] = {
    data: {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['sum', 'budget', 'avg'],
      },
      grid: {
        left: '10%',
        right: '0%',
        top: '5%',
        bottom: '10%',
      },
      xAxis: {
        type: 'category',
        name: 'date',
        data: [...fundData.transactions.map(({ date }) => date)],
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}' },
      },
      series: [
        {
          type: 'line',
          name: 'sum',
          data: [...fundData.transactions.map(({ sum }) => sum)],
        },
        {
          type: 'line',
          name: 'budget',
          data: [...fundData.transactions.map(() => fundData.budget)],
        },
        {
          type: 'line',
          name: 'avg',
          data: [...fundData.transactions.map(({ avg }) => avg)],
        },
      ],
    },
  }

  return (
    <ErrorBoundary>
      <Stack gap="md">
        <FundComponent fundId={id!} />
        <ECharts option={chartData} style={{ width: '100%', height: '300px' }} />
        <TransactionsTable data={transactions} />
      </Stack>
    </ErrorBoundary>
  )
}
