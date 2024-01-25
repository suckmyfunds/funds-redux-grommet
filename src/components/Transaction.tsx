import { Card } from "grommet";
import { colors } from "../theme";
import { TransactionRemote } from "../types";


export default function ({ t }: { t: TransactionRemote }) {
    return <Card color={`${t.synced ? colors.white : colors.red}`}>
        <div>{t.description}</div>
        <div>{t.date}</div>
        <div>{t.amount.toFixed(2)}</div>
        </Card>
}