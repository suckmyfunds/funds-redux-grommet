import { Stack } from '@mantine/core'
import { Text, TextInput } from 'grommet'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

//import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import Button from '../components/Button'
import { selectFundsChartData } from '../store/selectors'
import { ECharts, ReactEChartsProps } from './ECharts'

/**
 *
 * @returns Graph view for transactions amount avg by month
 */
export default function StatsPage() {
  const navigate = useNavigate()
  const [trashhold, setTrashhold] = useState(0)
  const funds = useSelector((s) => selectFundsChartData(s, trashhold))
  const chartsData = funds.map(
    ({ name, transactions, budget }): { name: string; data: ReactEChartsProps['option'] } => {
      return {
        name,
        data: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            data: ['spended', 'budget', 'balance'],
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
            data: [...transactions.map(({ date }) => date)],
          },
          yAxis: {
            type: 'value',
            axisLabel: { formatter: '{value}' },
          },
          series: [
            {
              type: 'line',
              name: 'spended',
              data: [...transactions.map(({ spended }) => spended)],
            },
            {
              type: 'line',
              name: 'budget',
              data: [...transactions.map(() => budget)],
            },
            {
              type: 'line',
              name: 'balance',
              data: [...transactions.map(({ balance }) => balance)],
            },
          ],
        },
      }
    }
  )

  return (
    <Stack gap="sm">
      <Button onClick={() => navigate(-1)}>back</Button>
      <TextInput value={trashhold} type="number" onChange={(e) => setTrashhold(parseFloat(e.target.value) || 0)} />
      {chartsData.map(({ name, data }) => (
        <Stack gap="xs" key={name}>
          <Text>{name}</Text>
          <ECharts option={data} style={{ width: '100%', height: '300px' }} />
        </Stack>
      ))}
    </Stack>
  )
}
