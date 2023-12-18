import { useSelector } from "react-redux";
import { FundList } from "../components/FundList";
import { selectFunds, useAppDispatch } from "../store";

import { fetchFunds, selectStatus } from "../store/fundsSlice";
import { useEffect } from "react";



export function FundsPage() {
    const funds = useSelector(selectFunds)
    const dispatch = useAppDispatch()
    const fundsStatus = useSelector(selectStatus)
    useEffect(() => {
        dispatch(fetchFunds())
    })

    if (fundsStatus == "loading") return <div>Loading funds...</div>
    return <FundList funds={funds} />

}