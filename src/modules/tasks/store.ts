import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../store'
import { Task } from './types'


const adapter = createEntityAdapter({ selectId: (task: Task) => task.id })

const initialState = adapter.getInitialState<{ status: 'idle' | 'loading' | 'error'}>({ status: 'idle'})

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducerPath: 'tasks',
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
    setStatus(s, { payload }: { payload: 'loading' | 'idle' | 'error' }) {
      s.status = payload
    },
  },
  
  extraReducers: (_) => {
      // firstArgOfThisFunctions
      // .addCase(getAccounts.fulfilled, (s, { payload }) => {
      //   adapter.setAll(s, payload)
      // })
      // .addCase(createAccount.rejected, (s, action) => {
      //   if (action.payload) {
      //     adapter.updateOne(s, { id: action.payload.id, changes: { ...s.entities[s.ids[0]] } })
      //   } else {
      //     console.error('createAccount.rejected have no payload, so temporal account not removed', action.error)
      //   }
      // })
  },
})

export const selectors = adapter.getSelectors((s: RootState) => s.tasks)
export const selectStatus = (state: RootState) => state.funds.status

export const tasksSlice = {
  ...slice,
  initialState,
}
