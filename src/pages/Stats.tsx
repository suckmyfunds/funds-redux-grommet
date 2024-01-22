import type { ECharts, EChartsOption, SetOptionOpts } from "echarts";
import { getInstanceByDom, init } from "echarts";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
//import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import Button from "../components/Button";
import { selectFundsChartData } from "../store/selectors";

export interface ReactEChartsProps {
    option: EChartsOption;
    style?: CSSProperties;
    settings?: SetOptionOpts;
    loading?: boolean;
    theme?: "light" | "dark";
}

export function ReactECharts({
    option,
    style,
    settings,
    loading,
    theme,
}: ReactEChartsProps): JSX.Element {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chart
        let chart: ECharts | undefined;
        if (chartRef.current !== null) {
            chart = init(chartRef.current, theme);
        }

        // Add chart resize listener
        // ResizeObserver is leading to a bit janky UX
        function resizeChart() {
            chart?.resize();
        }
        window.addEventListener("resize", resizeChart);

        // Return cleanup function
        return () => {
            chart?.dispose();
            window.removeEventListener("resize", resizeChart);
        };
    }, [theme]);

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current)!;
            chart.setOption(option, settings);
        }
    }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current)!;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            loading === true ? chart.showLoading() : chart.hideLoading();
        }
    }, [loading, theme]);

    return <div ref={chartRef} style={{ width: "100%", height: "100px", ...style }} />;
}


const option: ReactEChartsProps["option"] = {
    dataset: {
      source: [
        ["Commodity", "Owned", "Financed"],
        ["Commodity 1", 4, 1],
        ["Commodity 2", 2, 4],
        ["Commodity 3", 3, 6],
        ["Commodity 4", 5, 3],
      ],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Owned", "Financed"],
    },
    grid: {
      left: "10%",
      right: "0%",
      top: "20%",
      bottom: "20%",
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
    },
    series: [
      {
        type: "bar",
        stack: "total",
        label: {
          show: true,
        },
      },
      {
        type: "bar",
        stack: "total",
        label: {
          show: true,
        },
      },
    ],
  }


/**
 *
 * @returns Graph view for transactions amount avg by month
 */
export default function StatsPage() {
    const navigate = useNavigate()
    const statData = useSelector(s => selectFundsChartData(s, 80000))
    return <>
        <Button onClick={() => navigate(-1)}>back</Button>
        <ReactECharts option={option} style={{ width: "100%" }}/>
        {/* {statData.map(data => <ChartForFund key={data.name} {...data} />)} */}

    </>
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