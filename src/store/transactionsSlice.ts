import {
  createAction,
  createAsyncThunk,
  createEntityAdapter,
  createReducer,
  createSelector,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit'

import SheetAPI, { transactionToRequest, transactionToRequestObject, transformTransactionFromResponse } from '../api'
import API from '../api'
import { Transaction, TransactionRemote } from '../types'
import { assert, dateToExcelFormat } from '../utils'
import { RootState } from '.'
import { selectAllFunds, selectFundById, selectFundByName, selectFundNamesById } from './fundsSlice'
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
    const result = { ...payload, id: nanoid() }
    dispatch(slice.actions.add(result))
    const { name: fundName } = selectFundById(getState(), payload.fundId)
    await api.appendRow(fundName, transactionToRequest(result))
    return { ...result, syncDate: dateToExcelFormat(new Date()) }
  }
)
// return ids of transtactions that was created
export const makeMonthIncome = createAsyncThunk(
  'transactions/makeMonthIncome',
  async (payload: { date: string; amount?: number } | undefined, { getState, dispatch }): Promise<string[]> => {
    const t: Transaction = {
      date: payload?.date || dateToExcelFormat(new Date()),
      amount: payload?.amount || 0,
      description: 'На месяц',
      synced: true,
      type: 'INCOME',
    }
    const state: RootState = getState()

    const funds = selectAllFunds(state)
    console.log('TRACE', funds)
    const token = state.auth.token

    const transactionsToCreate: TransactionRemote[] = funds.map(({ id, budget }) => ({
      ...t,
      id: nanoid(),
      amount: -(t.amount !== 0 ? t.amount : budget),
      fundId: id,
    }))

    dispatch(slice.actions.addMany(transactionsToCreate))

    let api = new API(token)
    await api.batchUpdate(
      transactionsToCreate.map((t) => ({
        appendCells: {
          fields: '*',
          sheetId: Number.parseInt(t.fundId),
          rows: [transactionToRequestObject(t)],
        },
      }))
    )
    return transactionsToCreate.map((t) => t.id)
  }
)

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
  },
})

const selectors = adapter.getSelectors((s: RootState) => s.transactions)

export const transactionsSlice = {
  ...slice,
  initialState: adapter.getInitialState(),
  actions: { ...slice.actions, add: addTransactionToFund },
}

export const { selectAll: selectAllTransactions } = selectors

export const selectFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId).reverse()
)

export const selectUnsyncedFundTransactions = createSelector(
  [selectAllTransactions, (_, fundId: string) => fundId],
  (transactions, fundId) => transactions.filter((t) => t.fundId === fundId && t.syncDate === undefined)
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
