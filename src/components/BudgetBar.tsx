import {Progress} from '@mantine/core'

/**
 * Will render progress bar with special color based on budget and balance.
 * In cases when balance > budget will render the "overflow" part of the bar.
 * @param balance current balance
 * @param budget treated as 100% of the bar
 * @param warnPercent if balance percentage is below this percentage, color will be yellow
 */
export default function BudgetBar({
    balance,
    budget,
    warnPercent,
}: {
    balance: number
    budget: number
    warnPercent?: number
}) {
    // Calculate percentagre of balance agains the budget
    // If balance is 0 -
    // when balance between 0 (includes 0) and budget - will render 1 section of the bar describing the balance amount
    // if balance is negative - will render 1 sections - negative portion that mean how many debts you have
    // in that case negative section will have a length of the 100% of the bar
    // if balance > budget - will render 2 sections - budget and how extra you have.
    // Those sections should have proportion between them that will show how much balance is greater that budget, e.g.
    // if balance is 200, and budget - 100, then we should render section of budget wit length of 33% and balance - 67%.
    let color = 'blue'
    let percent = 0
    // let overflowPercent = 0
    // console.group(`progressBar budget: ${budget}, balance: ${balance} warnPercent ${warnPercent}`)
    if (balance > 0) {
        percent = (balance / budget) * 100
        // console.log('percent', percent)
        if (warnPercent) {
            if (percent <= warnPercent) {
                color = 'yellow'
            } else if (percent > 100) {
                // percent = (budget / balance) * 100
                // overflowPercent = 100 - percent
                // console.log('overflow', overflowPercent)
                percent = 100
            }
        }
    } else if (balance == 0) {
        percent = 100
        color = 'gray'
    } else {
        percent = 100
        color = 'red'
    }
    if (percent < 20) {
        color = "orange"
    }
    // console.groupEnd()
    return (
        <Progress.Root size="20" autoContrast >
            <Progress.Section value={percent} color={color}>
                {percent > 20 && <Progress.Label >{balance.toFixed(2)}</Progress.Label>}
            </Progress.Section>
            {percent <= 20 &&
                <Progress.Section value={100 - percent} color="var(--mantine-color-gray-2)">
                    <Progress.Label c={color}>{balance.toFixed(2)}</Progress.Label>
                </Progress.Section>
            }
        </Progress.Root>
    )
}
