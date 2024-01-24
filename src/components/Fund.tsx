import { Box, Card, Grid, Meter, Text, Tip } from "grommet";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { selectFund } from "../store/fundsSlice";
import { colors } from '../theme';
import TransactionEditor from "./TransactionEditor";
import GridCell from "./layout/GridCell";


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
                {value < max ? value.toFixed(2) : `${value.toFixed(2)} (+${(value - max).toFixed(2)})`}
            </ProgressBarContainer>
        </ProgressBar>
    </Bordered>
}

const RedPoint = styled.span`
    width: 5px;
    height: 5px;
    border-radius: 5px;
    background-color: ${colors.red};
`
export default function Fund(
    {
        fundId,
        onClick
    }: {
        fundId: string,
        onClick?: () => void
    }) {

    const { id, name, budget, balance, syncDate, synced, initialBalance } = useSelector(s => {
        const fund = selectFund(s, fundId)
        if (fund.budget === undefined) {
            console.log("no budget for fund", fundId, s, fund)
        }
        return fund
    })
    const handleOnClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClick && onClick()
    }, [onClick])

    return <Card onClick={handleOnClick}>
        <Grid
            rows={["auto", "3fr", "auto"]}
            pad={"20px"}
            columns={["3fr", "1fr"]}
            gap={"10px"}
            areas={[
                { name: "name", start: [0, 0], end: [2, 0] },
                { name: "balance", start: [0, 1], end: [2, 1] },
                { name: "transactions", start: [0, 2], end: [2, 2] }

            ]}
        >
            <Box gridArea="name" direction="row" flex fill="horizontal" >
                <Box flex direction="row">
                    {name}{synced ? null : <RedPoint />}
                </Box>
                <Box>
                    {budget.toFixed(2)}({initialBalance?.toFixed(2)})
                </Box>
            </Box>
            <Box gridArea="balance" gap="small">
                    <Meter value={balance} max={budget} thickness="small"/>
                <Box gridArea="transactions">
                    <TransactionEditor fundId={id} />
                </Box>
            </Box>
        </Grid>

    </Card>
}