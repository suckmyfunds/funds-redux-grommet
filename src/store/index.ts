import { combineReducers, configureStore, createAsyncThunk, createReducer, nanoid } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import {
  createTransform,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist'
import storage from 'reduxjs-toolkit-persist/lib/storage'

import GoogleSpreadsheetAPI, { API, transactionToRequestObject } from '../api'
import { Transaction, TransactionRemote } from '../types'
import { dateToExcelFormat } from '../utils'
import { accountsSlice } from './accountsSlice'
import { authSlice, selectToken } from './authSlice'
import { fundsSlice } from './fundsSlice'
import { selectAllFunds } from './selectors'
import { tempSlice } from './temp'
import { transactionsSlice } from './transactionsSlice'
export * from './selectors'

const expireConfig = {
  expireKey: 'expiresAt',
  defaultState: { token: '', expiresAt: 0 },
}

function inboundByPass<T = any>(s: T) {
  return s
}
const combinedReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [fundsSlice.reducerPath]: fundsSlice.reducer,
  [transactionsSlice.reducerPath]: transactionsSlice.reducer,
  [tempSlice.reducerPath]: tempSlice.reducer,
  [accountsSlice.reducerPath]: accountsSlice.reducer,
})

export const initialState = {
  [authSlice.reducerPath]: authSlice.initialState,
  [fundsSlice.reducerPath]: fundsSlice.initialState,
  [transactionsSlice.reducerPath]: transactionsSlice.initialState,
  [accountsSlice.reducerPath]: accountsSlice.initialState,
}

const persistReducer_ = persistReducer(
  {
    key: 'root',
    storage,
    transforms: [
      createTransform(inboundByPass, (s: any, k: string) => {
        if (k === authSlice.name) {
          const expiresDate = s[expireConfig.expireKey]
          //console.log("transform auth", s, new Date(expiresDate), new Date())
          if (expiresDate <= Date.now()) {
            //console.log("transform expired")
            s.expiresAt = expireConfig.defaultState.expiresAt
            s.token = expireConfig.defaultState.token
          }
        }
        return s
      }),
    ],
  },
  combinedReducer
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
      fromAccount: 'input',
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
      fromAccount: 'input',
    }))

    dispatch(transactionsSlice.actions.addMany(transactionsToCreate))

    let api = new GoogleSpreadsheetAPI(token)
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

// TODO: check that in this month income was done. Transaction should have a type?
const newIncomeReducer = createReducer(initialState, (builder) => {
  builder.addCase(makeMonthIncome.fulfilled, (s, a) => {
    a.payload.map((tId) => (s.transactions.entities[tId].syncDate = dateToExcelFormat(new Date())))
  })
  builder.addCase(makeMonthIncome.rejected, (_, a) => {
    console.error(a.error)
  })
})

const reducers = [persistReducer_, newIncomeReducer]
export const store = configureStore({
  reducer: (state, a) => reducers.reduce((s, r) => r(s, a), state),

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch

export { authorize } from './authSlice'

export function getAPIFromStore(getState: ()=> RootState): API {
  const rootState = getState() as RootState
  const token = selectToken(rootState)
  let api = new GoogleSpreadsheetAPI(token)
  return api
}