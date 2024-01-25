import { Meter } from "grommet";


export default function BudgetBar({ balance, budget, warnPercent }: { balance: number, budget: number, warnPercent: number }) {
    let color = "status-ok"
    const overflow = balance > budget
    const negative = balance < 0
    const warn = balance <= budget * (warnPercent / 100)

    if (overflow) color = "accent-4"
    if (warn) color = "status-warning"
    if (negative) color = "status-critical"


    const maxValue = budget > balance ? budget : balance
    return <Meter
        value={balance > 0 ? balance : maxValue}
        max={maxValue}
        thickness="small"
        color={color}
        round={true}
        background="light-4"
    />
}