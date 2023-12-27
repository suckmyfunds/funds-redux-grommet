import { useSelector } from "react-redux";
import { FundList } from "../components/FundList";
import { RootState, selectFunds, useAppDispatch } from "../store";

import { fetchFunds, selectStatus } from "../store/fundsSlice";
import { useEffect } from "react";



export function FundsPage() {
    const funds = useSelector(selectFunds)
    const dispatch = useAppDispatch()
    const fundsStatus = useSelector(selectStatus)
    const authenticated = useSelector((state: RootState) => state.auth.token !== "")

    useEffect(() => {
        if (authenticated) {
            dispatch(fetchFunds())
        }
    }, [authenticated])

    if (fundsStatus == "loading") return <div>Loading funds...</div>
    else return <FundList funds={funds} />

}