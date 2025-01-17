import {createEntityAdapter, createSlice} from "@reduxjs/toolkit"
import {useState} from "react"
import {RootState} from "../../store"
import {dateToExcelFormat} from "../../utils"
import {useDispatch, useSelector} from "react-redux"
import {ActionIcon, Button, Card, Chip, Group, NumberInput, Stack, Text, TextInput} from "@mantine/core"
/*
Plan expenses. 
- Set up a wanted thing name, price and date.
- Can contains many wants 
*/

interface Want {
  name: string
  price: number
  dueDate: string
}

// logic

// store

const adapter = createEntityAdapter<Want, string>({selectId: w => w.name})

const _slice = createSlice({
  name: "wants",
  initialState: adapter.getInitialState(),
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
  }
})

export const slice = {..._slice, initialState: adapter.getInitialState()}

export const selectors = {...adapter.getSelectors((s: RootState) => s.wants)}

// ui

export function WantsPlan() {
  const wants = useSelector(selectors.selectAll)
  const dispatch = useDispatch()
  const [name, setName] = useState("")
  const [dueDate, setDate] = useState(dateToExcelFormat(new Date()));
  const [price, setPrice] = useState(0)
  return <>
    {wants.map(w => <Card padding="lg">
      <Card>
      <Stack>
        <Group>
          <Chip>{w.name}</Chip><Text>{w.price}</Text>
          <ActionIcon onClick={() => dispatch(slice.actions.remove(w.name))}>x</ActionIcon>
        </Group>
        <Text>{w.dueDate}</Text>
      </Stack>
      </Card>
    </Card>)}

    <TextInput value={name} onChange={e => setName(e.target.value)} />
    <NumberInput value={price} onChange={e => setPrice(parseInt(e.toString()))} />
    <TextInput value={dueDate} onChange={e => setDate(e.target.value)} />

    <Button onClick={(_) => {
      dispatch(slice.actions.add({name, price, dueDate}))
    }}>Add want</Button>
  </>
}
