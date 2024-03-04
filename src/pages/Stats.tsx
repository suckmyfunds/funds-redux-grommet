import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts'
import { getInstanceByDom, init } from 'echarts'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

//import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import Button from '../components/Button'
import { selectFundsChartData } from '../store/selectors'
import { useSelector } from 'react-redux'
import { Box, TextInput, Text } from 'grommet'

export interface ReactEChartsProps {
  option: EChartsOption
  style?: CSSProperties
  settings?: SetOptionOpts
  loading?: boolean
  theme?: 'light' | 'dark'
}

export function ReactECharts({ option, style, settings, loading, theme }: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme)
    }

    // Add chart resize listener
    // ResizeObserver is leading to a bit janky UX
    function resizeChart() {
      chart?.resize()
    }
    window.addEventListener('resize', resizeChart)

    // Return cleanup function
    return () => {
      chart?.dispose()
      window.removeEventListener('resize', resizeChart)
    }
  }, [theme])

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current)!
      chart.setOption(option, settings)
    }
  }, [option, settings, theme]) // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current)!

      loading === true ? chart.showLoading() : chart.hideLoading()
    }
  }, [loading, theme])

  return <div ref={chartRef} style={{ width: '100%', height: '100px', ...style }} />
}



/**
 *
 * @returns Graph view for transactions amount avg by month
 */
export default function StatsPage() {
  const navigate = useNavigate()
  const allTransactions = useSelector(s => selectFundsChartData(s, 10000))
  const [trashhold, setTrashhold] = useState(0)
  const chartsData = allTransactions.map(({ name, transactions }): { name: string, data: ReactEChartsProps['option'] } => {
    return {
      name,
      data: {
        dataset: {
          source: [
            ['Month', 'Median', 'AVG'],
            ...transactions.map(({ month, median, avg }) => [month, median, avg])
          ],
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: ['FundName', 'Month'],
        },
        grid: {
          left: '10%',
          right: '0%',
          top: '20%',
          bottom: '20%',
        },
        xAxis: {
          type: 'category',
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'bar',
            
          },
          {
            type: 'bar',
            
          },
        ],
      }
    }
  })

  return (
    <Box direction='column'>
      <Button onClick={() => navigate(-1)}>back</Button>
      <TextInput value={trashhold} type='number' onChange={(e) => setTrashhold(parseFloat(e.target.value) || 0)} />
      {chartsData.map(({ name, data }) => <Box>
        <Text>{name}</Text>
        <ReactECharts option={data} style={{ width: '100%' }} />
      </Box>)}

    </Box>
  )
}

// function ChartForFund({ name, transactions }: { name: string, transactions: { month: string, avg: number, median: number }[] }) {
// }

// function ChartForFund({ name, transactions }: { name: string, transactions: { month: string, avg: number, median: number }[] }) {
//     return <>
//         <h1>{name}</h1>
//         <BarChart width={730} height={250} data={transactions} margin={{ top: 20 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             {/* <Tooltip /> */}
//             <Legend />
//             <Bar dataKey="avg" fill={colors.barkBlue} label={{ fill: colors.black, position: 'top' }} />
//         </BarChart>
//     </>
// }
