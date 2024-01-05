import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import FundList from "../components/FundList"
import { selectAllFunds, selectFund } from "../store/fundsSlice"

export default function FundDetailPage() {
    const { id } = useParams()

    let funds = useSelector(selectAllFunds)
    const fund = useSelector(s => selectFund(s, id!))
    return <>
        <FundList funds={funds} selectedId={id!} />
        <div>
            <table>
                <tbody>
                    {fund.transactions.map(t => <tr key={t.id}><td>{t.date}</td><td>{t.amount}</td></tr>)}
                </tbody>
            </table>
        </div>

    </>
}