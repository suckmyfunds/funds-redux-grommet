import { Link } from "react-router-dom";
import styled from "styled-components";
import theme, { colors } from '../theme';
import { FundRemote } from "../types";
import GridCell from "./layout/GridCell";
import TransactionEditor from "./TransactionEditor";

const FundStyled = styled.div<{ $selected: boolean }>`
    border-radius: 5px;
    display: grid;
    background-color: ${props => props.$selected ? colors.lightBlue : colors.white};
    grid-template-columns: 3fr 1fr;
    grid-column-gap: calc(${theme.contentPadding}*3);
    grid-template-rows:  1fr 1fr auto;
    grid-row-gap: calc(${theme.contentPadding}*1);
    padding: ${theme.contentPadding};
    box-shadow: 1px 3px 5px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.24);
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
const Bordered = styled(GridCell)`
    border: 1px solid black;
    border-radius: 3px;
`
const ProgressBarContainer = styled.div`
    padding: 0 5px 0 5px;
`

function Progress({ value, max, alertPercent }: { value: number, max: number, alertPercent: number }) {
    return <Bordered $row={2} $col={"1/3"}>
        <ProgressBar $alertPercent={alertPercent} $progress={value / (max / 100)} >
            <ProgressBarContainer>
                {value < max ? value : `${value} (+${value - max})`}
            </ProgressBarContainer>
        </ProgressBar>
    </Bordered>
}

export default function Fund({ fund, selected }: { fund: FundRemote, selected?: boolean }) {
    return <FundStyled key={fund.name} $selected={!!selected}>
        <GridCell $row={1} $col={"1/3"} className="name">
            {selected ? fund.name : <Link style={{ display: 'block', width: "100%" }} to={`/detail/${fund.id}`}>{fund.name}</Link>}
        </GridCell>
        <Progress value={fund.balance} max={fund.budget} alertPercent={15} />
        <GridCell $row={3} $col={"1/3"}><TransactionEditor fundId={fund.id} /></GridCell>
    </FundStyled>
}