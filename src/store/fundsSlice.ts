import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'

import API, { transformFundFromResponse } from '../api'
import type { FundRemote } from '../types'
import { groupBy, median, parseExcelDate } from '../utils'
import { selectToken } from './authSlice'
import { clearLocals } from './globalActions'
import { RootState } from './index'
import { selectFundTransactions } from './transactionsSlice'

export const fetchFunds = createAsyncThunk('funds/fetchAll', async (_, { getState }): Promise<FundRemote[]> => {
  const rootState = getState() as RootState
  const token = selectToken(rootState)
  let api = new API(token)
  return (await api.getRows('funds!A2:E')).map((f, idx) => ({
    ...transformFundFromResponse(f),
    id: `${idx + 2}`,
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

// export const createFund = createAsyncThunk("funds/create", async (fund: FundRemote, { getState }) => {
//     const token = (getState() as RootState).auth.token;
//     let api = new API(token);
//     let id = await api.appendRow("funds", fundToRequest(fund));
//     return { ...fund, id };
// })

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

export const { selectAll: selectAllFunds, selectIds: selectFundsIds, selectById: selectFundById } = selectors

export const selectFundNamesById = createSelector(selectAllFunds, (fs) =>
  fs.reduce((acc: Record<string, string>, f) => {
    acc[f.id] = f.name
    return acc
  }, {})
)

export const selectLocalFunds = createSelector([selectAllFunds], (funds) =>
  funds.filter((f) => f.syncDate === undefined)
)

export const selectFund = createSelector(
  [adapter.getSelectors((s: RootState) => s.funds).selectById, selectFundTransactions],
  (fund, transactions) => {
    const monthTransactions = groupBy(transactions, (t) => {
      const d = parseExcelDate(t.date)
      return `${d.getMonth()}.${d.getFullYear()}`
    })

    const expenseStat = Object.keys(monthTransactions).map((key) => {
      let monthAmounts = monthTransactions[key].map((t) => t.amount).filter((t) => t > 0)
      if (monthAmounts.length == 0) monthAmounts = [0]
      const sum = monthAmounts.reduce((a, i) => a + i, 0)
      return { date: key, median: median(monthAmounts), avg: sum / monthAmounts.length, sum }
    })
    const averageExpense =
      expenseStat.reduce((acc, exp) => (exp.median <= 0 ? acc : acc + exp.median), 0) / expenseStat.length
    return {
      ...fund,
      // transaction amount for expenses is negative, so we need to add it to balance
      balance: fund.initialBalance - transactions.reduce((a, b) => a + b.amount, 0),
      synced: transactions.every((t) => t.synced),
      transactions,
      expenseMedians: expenseStat,
      averageExpense,
    }
  }
)

export const selectFundByName = (fundName: string) => (state: RootState) =>
  adapter
    .getSelectors()
    .selectAll(state.funds)
    .find((f) => f.name === fundName)
