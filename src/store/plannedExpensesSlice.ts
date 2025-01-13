import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { PlannedExpenseRemote } from '../types'

const adapter = createEntityAdapter({
  selectId: (fund: PlannedExpenseRemote) => fund.id,
})
const initialState = adapter.getInitialState()

export const slice = createSlice({
  name: 'targets',
  initialState,
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
  },
})
