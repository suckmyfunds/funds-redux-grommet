import { useSelector } from "react-redux";
import FundList from "../components/FundList";

import { selectAllFunds, selectStatus } from "../store/fundsSlice";


export function FundsPage() {
    const funds = useSelector(selectAllFunds)

    const fundsStatus = useSelector(selectStatus)
    if (funds.length === 0) {
        return <div>No funds found</div>
    }
    if (fundsStatus === 'loading') {
        return <div>Synchronizing...</div>
    }

    return <>

        <FundList funds={funds}/>
    </>

}