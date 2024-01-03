import { useSelector } from "react-redux";
import FundList from "../components/FundList";
import { selectFunds } from "../store";


export function FundsPage() {
    const funds = useSelector(selectFunds)
    if (funds.length === 0)
    return <div>No funds found</div>
    return <FundList funds={funds} />

}