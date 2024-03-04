import {
  createAction,
  createAsyncThunk,
  createEntityAdapter,
  createReducer,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'

import SheetAPI, { transformTransactionFromResponse } from '../api'
import API from '../api'
import { TransactionRemote } from '../types'
import { assert } from '../utils'
import { RootState } from '.'
import { selectFundByName } from './fundsSlice'
import { clearLocals } from './globalActions'

export const fetchTransactionsForFund = createAsyncThunk(
  'transactions/fetchAll',
  async (fundName: string, { getState }): Promise<TransactionRemote[]> => {
    const token = (getState() as RootState).auth.token
    let api = new SheetAPI(token)
    const fundId: string = selectFundByName(fundName)(getState() as RootState)?.id!
    assert(fundId === undefined, `Fund with name ${fundName} used to get transactions should exists is store`)

    return (await api.getRows(`${fundName}!A2:E`)).map((t, idx) => ({
      ...transformTransactionFromResponse(t),
      id: String(idx + 2),
      status: 'idle',
      fundId,
    }))
  }
)

export const addTransactionToFund = createAsyncThunk(
  'transactions/add',
  async (fundName: string, { getState }): Promise<TransactionRemote[]> => {
    const token = (getState() as RootState).auth.token
    let api = new API(token)
    const fundId: string = selectFundByName(fundName)(getState() as RootState)?.id!
    assert(fundId === undefined, `Fund with name ${fundName} used to get transactions should exists is store`)

    return (await api.getRows(`${fundName}!A2:E`)).map((t, idx) => ({
      ...transformTransactionFromResponse(t),
      id: String(idx + 2),
      status: 'idle',
      fundId,
    }))
  }
)

export const makeMonthIncome = createAction('transactions/makeMonthIncome', (date?: string, amount?: number) => ({
  payload: { date, amount },
}))

export const makeSync = createAction('transactions/sync', (id: string) => ({ payload: { id } }))

const adapter = createEntityAdapter({
  selectId: (t: TransactionRemote) => t.id,
})

const slice = createSlice({
  name: 'transactions',
  initialState: adapter.getInitialState(),
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
    addMany: adapter.addMany,
    sync: createReducer(adapter.getInitialState(), (builder) => {
      builder.addCase(makeSync, (s, a) => {
        s.entities[a.payload.id].synced = true
      })
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(clearLocals, (s, _) => {
      adapter.removeMany(
        s,
        s.ids.filter((id) => s.entities[id].syncDate === undefined)
      )
    })
  },
})

const selectors = adapter.getSelectors((s: RootState) => s.transactions)

export const transactionsSlice = { ...slice, initialState: adapter.getInitialState() }

export const { selectAll: selectAllTransactions } = selectors

export const selectFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId).reverse()
)

export const selectUnsyncedFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId && !t.synced)
)

export const selectLocalTransactions = createSelector([selectAllTransactions], (transactions) =>
  transactions.filter((t) => t.syncDate === undefined)
)

export const selectTransactionsByFundId = createSelector([selectAllTransactions], (trs) => {
  return trs.reduce((acc: Record<string, TransactionRemote[]>, t) => {
    acc[t.fundId] = acc[t.fundId] || []
    acc[t.fundId].push(t)
    return acc
  }, {})
})
