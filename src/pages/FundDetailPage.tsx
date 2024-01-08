import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import Button from "../components/Button"
import Transaction from "../components/Transaction"
import { List } from "../components/layout/Flex"
import { selectFund } from "../store/fundsSlice"
import FundComponent from "../components/Fund";

export default function FundDetailPage() {
    const { id } = useParams()
    const nav = useNavigate()
    //let fundIds = useSelector(selectFundsIds)
    const fund = useSelector(s => selectFund(s, id!))

    return <>
        <Button onClick={() => nav("/")}>back</Button>
        <FundComponent fundId={id!}/>
        <div style={{ marginTop: 20 }}>
            <List $gap={10}>
                {fund.transactions.map(t => <Transaction key={t.id} t={t} />)}
            </List>
        </div>

    </>
}