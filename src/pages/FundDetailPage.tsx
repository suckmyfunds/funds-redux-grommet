import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import Button from "../components/Button"
import FundComponent from "../components/Fund"
import Transaction from "../components/Transaction"
import { List } from "../components/layout/Flex"
import { selectFundTransactions } from "../store/transactionsSlice"

export default function FundDetailPage() {
    const { id } = useParams()
    const nav = useNavigate()
    const transactions = useSelector(s => selectFundTransactions(s, id!))

    return <>
        <Button onClick={() => nav("/")}>back</Button>
        <FundComponent fundId={id!} />
        <div style={{ marginTop: 20 }}>
            <List $gap={10}>
                {transactions.map(t => <Transaction key={t.id} t={t} />)}
            </List>
        </div>

    </>
}