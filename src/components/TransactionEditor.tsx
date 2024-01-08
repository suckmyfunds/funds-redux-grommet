import { useCallback, useState } from "react"
import { useAppDispatch } from "../store"
import { transactionsSlice } from "../store/transactionsSlice"
import Grid5 from "./layout/Grid5"
import GridCell from "./layout/GridCell"
import styled from "styled-components"
import { nanoid } from "@reduxjs/toolkit"

const FullWidthButton = styled.button`
    width: 100%;
`
const floatRegExp = new RegExp("^[0-9]*[.,]?[0-9]{0,2}$")

export default function TransactionEditor({ fundId }: { fundId: string }) {

    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const dispatch = useAppDispatch()

    const onClick = useCallback((e: React.UIEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(transactionsSlice.actions.add({
            description,
            amount: parseFloat(amount),
            // formatted date as "YYYY-MM-DD"
            date: new Date().toISOString().slice(0, 10),
            synced: false,
            id: nanoid(),
            fundId,
            type: "EXPENSE"
        }))
    }, [dispatch, description, amount])

    function onChangeAmount(e: React.ChangeEvent<HTMLInputElement>) {

        if (floatRegExp.test(e.target.value)) {
            setAmount(e.target.value.startsWith("0") ? e.target.value.slice(1) : e.target.value)
        }
        if (e.target.value === "") {
            setAmount("0")
        }

    }

    return <Grid5 $rows={2} $cols={2}>
        <GridCell $row={1} $col={1}>
            <input type="text" placeholder="amount" name="amount" value={amount} onChange={onChangeAmount}
                autoFocus={true}
                onKeyUp={e => e.key === "Enter" && onClick(e)}
            />
        </GridCell>
        <GridCell $row={1} $col={2}>
            <input type="text" placeholder="description" name="desctiprion" value={description} onChange={e => setDescription(e.target.value)} />
        </GridCell>
        <GridCell $row={2} $col={"1/3"}>
            <FullWidthButton onClick={onClick}>Add</FullWidthButton>
        </GridCell>
    </Grid5>


}
