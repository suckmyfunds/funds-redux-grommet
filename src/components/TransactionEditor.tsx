import { useCallback, useState } from "react"
import { useAppDispatch } from "../store"
import { transactionsSlice } from "../store/transactionsSlice"
import Grid5 from "./layout/Grid5"
import GridCell from "./layout/GridCell"
import styled from "styled-components"

const FullWidthButton = styled.button`
    width: 100%;
`

export default function TransactionEditor({ fundId }: { fundId: string }) {

    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState(0)
    const dispatch = useAppDispatch()

    const onClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(transactionsSlice.actions.add({
            description,
            amount,
            // formatted date as "YYYY-MM-DD"
            date: new Date().toISOString().slice(0, 10),
            synced: false,
            id: "-1",
            fundId
        }))
    }, [dispatch])

    return <Grid5 $rows={2} $cols={2}>
        <GridCell $row={1} $col={1}><input type="text" placeholder="description" name="desctiprion" value={description} onChange={e => setDescription(e.target.value)} /></GridCell>
        <GridCell $row={1} $col={2}><input type="number" placeholder="amount" name="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} /></GridCell>
        <GridCell $row={2} $col={"1/3"}>
            <FullWidthButton onClick={onClick}>Add</FullWidthButton>
            </GridCell>
    </Grid5>
}
