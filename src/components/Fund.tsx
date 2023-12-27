import { FundRemote } from "../types";
import styled from "styled-components";
import theme from '../theme'
import {colors} from "../theme";


const FundStyled = styled.div`
    border-radius: 5px;
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-column-gap: calc(${theme.contentPadding}*3);
    grid-template-rows:  1fr 1fr;
    grid-row-gap: calc(${theme.contentPadding}*1);
    padding: ${theme.contentPadding};
    box-shadow: 1px 3px 5px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.24);
`


const GridCell = styled.div<{ $row: number, $col: number | string }>`
    grid-row: ${props => props.$row};
    grid-column: ${props => props.$col};
`

const colorMap = (value: number, max: number, alert: number, colors: { overflow: string, alert: string, normal: string, negative: string }) => {
    if (value > max) {
        return colors.overflow
    } else if (value < 0 || value === 0) {
        return colors.negative
    } else if (value <= alert) {
        return colors.alert
    } else {
        return colors.normal
    }
}

const fgColorMap = { negative: colors.red, alert: colors.black, normal: colors.black, overflow: colors.white }
const bgColorMap = { negative: colors.red, alert: colors.yellow, normal: colors.gray, overflow: colors.blue }

const ProgressBar = styled.div<{
    $progress: number,
    $alertPercent: number,
}>`
    color: ${props => colorMap(props.$progress, 100, props.$alertPercent, fgColorMap)};
    background-color: ${props => colorMap(props.$progress, 100, props.$alertPercent, bgColorMap)};
    width: ${props => Math.max(Math.min(100, props.$progress), 0)}%;
    border-radius: 2px;
`
const FullWidthBorder = styled(GridCell)`
    width: 100%;
    min-width: 200px;
    border: 1px solid black;
    border-radius: 3px;
`
const ProgressBarContainer = styled.div`
    padding: 0 5px 0 5px;
`

function Progress({ value, max, alertPercent }: { value: number, max: number, alertPercent: number }) {
    return <FullWidthBorder $row={2} $col={"1/4"}>
        <ProgressBar $alertPercent={alertPercent} $progress={value / (max / 100)} >
            <ProgressBarContainer>
                {value < max ? value : `${value} (+${value - max})`}
            </ProgressBarContainer>
        </ProgressBar>
    </FullWidthBorder>
}
// budget / 100 = balance / x
// x = balance * (budget/100)

export function Fund({ fund, onClick }: { fund: FundRemote, onClick: (fund: FundRemote) => void }) {
    return (
        <FundStyled key={fund.name} onClick={() => onClick(fund)} >
            <GridCell $row={1} $col={1} className="name">{fund.name}</GridCell>
            <GridCell $row={1} $col={2} className="budget"></GridCell>
            <Progress value={fund.balance} max={fund.budget} alertPercent={15} />
        </FundStyled>
    )

}