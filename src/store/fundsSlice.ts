import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'

import { fundToRequest, transformFundFromResponse } from '../api'
import type { Fund, FundRemote } from '../types'
import { clearLocals } from './globalActions'
import { RootState, getAPIFromStore } from './index'

export const fetchFunds = createAsyncThunk('funds/fetchAll', async (_, { getState }): Promise<FundRemote[]> => {
  const api = getAPIFromStore(getState)
  return (await api.getRows('funds!A2:F')).map((f) => ({
    ...transformFundFromResponse(f),
    status: 'idle',
    syncDate: new Date().toISOString(),
  }))
})

// export const updateFund = createAsyncThunk("funds/update", async (fund: FundRemote, { getState }) => {
//     const token = (getState() as RootState).auth.token;
//     let api = new API(token);
//     let id = await api.updateRow("funds", fundToRequest(fund), fund.id);
//     return { ...fund, id };
// });

export const createFund = createAsyncThunk('funds/create', async (fund: Fund, { getState }) => {
  const api = getAPIFromStore(getState)
  let res = await api.createSheet(fund.name)
  const id = String(res.addSheet.properties.sheetId)
  await api.appendRow('funds', fundToRequest({ ...fund, id }))
  return { ...fund, id }
})

const adapter = createEntityAdapter({
  selectId: (fund: FundRemote) => fund.id,
})

// with fetching status
const initialState = adapter.getInitialState({ status: 'idle' })

const slice = createSlice({
  name: 'funds',
  initialState,
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
    setStatus(s, { payload }: { payload: 'loading' | 'idle' | 'synchronization' }) {
      s.status = payload
    },
  },
  // actual change of state will happens in syncData
  // because we need there to get funds sheet ids.
  // or we can move all the funds update related staff to fetchFunds action
  extraReducers: (builder) => {
    builder.addCase(fetchFunds.pending, (s, _) => {
      if (s.status !== 'synchronization') {
        s.status = 'loading'
      }
    })
    builder.addCase(fetchFunds.fulfilled, (s, { payload }) => {
      if (s.status !== 'synchronization') {
        s.status = 'idle'
      }
      adapter.setAll(s, payload)
    })
    builder.addCase(clearLocals, (s, _) => {
      adapter.removeMany(
        s,
        s.ids.filter((id) => s.entities[id].syncDate === undefined)
      )
    })
  },
})

export const fundsSlice = { ...slice, initialState }

export const selectStatus = (state: RootState) => state.funds.status

export const isSynchronizing = (state: RootState) => state.funds.status === 'synchronization'

const selectors = adapter.getSelectors((s: RootState) => s.funds)

export const { selectAll: selectAllFundsBase, selectIds: selectFundsIds, selectById: selectFundById } = selectors

export const selectFundNamesById = createSelector(selectAllFundsBase, (fs) =>
  fs.reduce((acc: Record<string, string>, f) => {
    acc[f.id] = f.name
    return acc
  }, {})
)

export const selectLocalFunds = createSelector([selectAllFundsBase], (funds) =>
  funds.filter((f) => f.syncDate === undefined)
)

export const selectFundByName = (fundName: string) => (state: RootState) =>
  adapter
    .getSelectors()
    .selectAll(state.funds)
    .find((f) => f.name === fundName)
