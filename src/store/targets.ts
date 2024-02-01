import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { TargetRemote } from '../types'

const adapter = createEntityAdapter({
  selectId: (fund: TargetRemote) => fund.id,
})
const initialState = adapter.getInitialState()

export const targetsSlice = createSlice({
  name: 'targets',
  initialState,
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
  },
})
