import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, nanoid } from '@reduxjs/toolkit'

import SheetAPI, { transactionToRequest, transactionToRequestObject, transformTransactionFromResponse } from '../api'
import API from '../api'
import { Transaction, TransactionRemote } from '../types'
import { assert, dateToExcelFormat } from '../utils'
import { RootState } from '.'
import { selectFundById, selectFundByName, selectFundNamesById } from './fundsSlice'
import { clearLocals } from './globalActions'

export const fetchTransactionsForFund = createAsyncThunk(
  'transactions/fetchTransactionsForFund',
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

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_, { getState }): Promise<TransactionRemote[]> => {
    const rootState = getState() as RootState
    const token = rootState.auth.token

    let api = new SheetAPI(token)
    const fundNames = selectFundNamesById(rootState)
    const fundIds = Object.keys(fundNames)
    return (await api.batchGet(fundIds.map((id) => `${fundNames[id]}!A2:E`))).valueRanges.flatMap((trs, fundIdx) => {
      return trs.values.map((t) => {
        return {
          ...transformTransactionFromResponse(t),
          id: nanoid(),
          status: 'idle',
          fundId: fundIds[fundIdx],
          syncDate: dateToExcelFormat(new Date()),
        }
      })
    })
  }
)

export const addTransactionToFund = createAsyncThunk(
  'transactions/addTransactionToFund',
  async (payload: Transaction & { fundId: string }, { getState, dispatch }): Promise<TransactionRemote> => {
    const state: RootState = getState()
    const token = state.auth.token
    let api = new API(token)
    const result: TransactionRemote = { ...payload, id: nanoid() }
    dispatch(slice.actions.add(result))
    const { name: fundName } = selectFundById(getState(), payload.fundId)
    await api.appendRow(fundName, transactionToRequest(result))
    return { ...result, syncDate: dateToExcelFormat(new Date()) }
  }
)

export const sendTempTransactions = createAsyncThunk('transactions/sendTempTransactions', async (_, { getState }) => {
  const token = (getState() as RootState).auth.token
  let api = new API(token)
  const today = dateToExcelFormat(new Date())
  const transactions = selectUnsyncedTransactions(getState())
  if (Object.keys(transactions).length < 1) {
    return { ids: [], date: today }
  }
  console.warn('got temp transactions', transactions)

  await api.batchUpdate(
    Object.keys(transactions).map((fundId) => ({
      appendCells: {
        sheetId: Number.parseInt(fundId),
        fields: '*',
        rows: transactions[fundId].map(transactionToRequestObject),
      },
    }))
  )
  return { ids: Object.keys(transactions).flatMap((fid) => transactions[fid].map((t) => t.id)), date: today }
})

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearLocals, (s, _) => {
        adapter.removeMany(
          s,
          s.ids.filter((id) => s.entities[id].syncDate === undefined)
        )
      })
      .addCase(addTransactionToFund.fulfilled, (s, { payload: transaction }) => {
        adapter.updateOne(s, {
          id: transaction.id,
          changes: { syncDate: dateToExcelFormat(new Date()) },
        })
      })
      .addCase(fetchTransactions.fulfilled, (s, { payload: transactions }) => {
        adapter.setAll(s, transactions)
      })
      .addCase(fetchTransactionsForFund.fulfilled, (s, { payload: transactions }) => {
        adapter.addMany(s, transactions)
      })
      .addCase(sendTempTransactions.fulfilled, (s, { payload: { ids, date } }) => {
        adapter.updateMany(
          s,
          ids.map((id) => ({ id, changes: { syncDate: date } }))
        )
      })
      .addCase(sendTempTransactions.rejected, () => {
        console.log('sendTempTransactions.rejected')
      })
  },
})

const selectors = adapter.getSelectors((s: RootState) => s.transactions)

export const transactionsSlice = {
  ...slice,
  initialState: adapter.getInitialState(),
  actions: { ...slice.actions, add: addTransactionToFund },
}

export const { selectAll: selectAllTransactions } = selectors

export const selectUnsyncedFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId && t.syncDate === undefined)
)
/** returns transactions that not send to remote*/
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

export const selectUnsyncedTransactions = createSelector([selectTransactionsByFundId], (transactions) => {
  const result: Record<string, TransactionRemote[]> = {}
  Object.keys(transactions).forEach((k) => {
    const unsync = transactions[k].filter((t) => t.syncDate === undefined)
    if (unsync.length > 0) result[k] = unsync
  })
  return result
})
