import { nanoid } from "@reduxjs/toolkit"
import { Box, Button, TextInput } from "grommet"
import { useCallback, useState } from "react"
import { useAppDispatch } from "../store"
import { transactionsSlice } from "../store/transactionsSlice"
import { dateToExcelFormat } from "../utils"

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
            date: dateToExcelFormat(new Date()),
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

    return <Box gap="small">
        <Box flex direction="row" gap="small">
            <TextInput type="text" placeholder="amount" name="amount" value={amount} onChange={onChangeAmount}
                autoFocus={true}
                onKeyUp={e => e.key === "Enter" && onClick(e)}
            />
            <TextInput type="text" placeholder="description" name="desctiprion" value={description} onChange={e => setDescription(e.target.value)} />
        </Box>
        <Box><Button onClick={onClick} label="Add"/></Box>
    </Box>


}
