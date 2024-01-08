import { colors } from "../theme";
import { TransactionRemote } from "../types";
import styled from "styled-components";

const Card = styled.div<{$color?: string}>`
    padding: 5px;
    border-radius: 5px;
    border: 1px solid black;
    background-color: ${props => props.$color || "white"};
`

export default function ({ t }: { t: TransactionRemote }) {
    return <Card $color={`${t.synced ? colors.white : colors.red}`}>
        <div>{t.description}</div>
        <div>{t.date}</div>
        <div>{t.amount.toFixed(2)}</div>
        </Card>
}