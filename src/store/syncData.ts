import { createAsyncThunk, createReducer, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'

import API, { transactionToRequestObject, transformTransactionFromResponse } from '../api'
import { BatchRequest, TransactionRemote } from '../types'
import { assert } from '../utils'
import { type RootState } from '.'
import { authorize, selectIsAuthorized } from './authSlice'
import { fundsSlice, selectAllFunds, syncFunds } from './fundsSlice'
import { selectLocalTransactions, transactionsSlice } from './transactionsSlice'

/**
 * Steps:
 * 1. Authorize
 * 2. Fetch updates from remote
 * 3. Select unsynced (local) funds and send to remote
 * 4. Update Ids for sent funds
 * 5. Update Ids for transactions of sent funds
 * 6. Send local transactions
 * 7. Update transactions ids
 *
 */
export const syncData = createAsyncThunk('root/sync', async (_, { dispatch, getState }): Promise<void> => {
  dispatch(fundsSlice.actions.setStatus('synchronization'))

  let rootState: RootState = getState() as RootState

  const api = await getAuthorizedApi(rootState, dispatch)

  await dispatch(syncFunds()).unwrap()
  // name, index should match with remote
  await syncTransactions(rootState, api, dispatch)

  dispatch(fundsSlice.actions.setStatus('idle'))
})

const getAuthorizedApi = async (
  rootState: RootState,
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>
): Promise<API> => {
  let token = rootState.auth.token
  if (!selectIsAuthorized(rootState)) {
    token = (await dispatch(authorize()).unwrap()).token
  }
  return new API(token)
}

export async function syncTransactions(
  rootState: RootState,
  api: API,
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>
) {
  let requests: BatchRequest[] = []

  const funds = selectAllFunds(rootState)

  let remoteTransactions = (await api.batchGet(funds.map((f) => `${f.name}!A2:E`))).valueRanges.flatMap(
    (v, idx): TransactionRemote[] => {
      return v.values.map((tr, id) => {
        const transaction = transformTransactionFromResponse(tr)
        return {
          ...transaction,
          syncDate: new Date().toISOString(),
          fundId: funds[idx].id,
          id: String(10000000 + idx * 10000000 + id),
        }
      })
    }
  )

  // TODO: we need to append local transactions, and resolve conflicts with local transactions
  // remote and local transaction conflicts if they have same date and same amout
  // if we see conflict - we need to note user that we merge them
  const localTransactions = selectLocalTransactions(rootState)
  let transactionsToSync = []
  for (let transaction of localTransactions) {
    if (remoteTransactions.findIndex((t) => t.date === transaction.date && t.amount === transaction.amount) == -1) {
      transactionsToSync.push(transaction)
    }
  }

  if (transactionsToSync.length > 0) {
    const transactionsByFundId = transactionsToSync.reduce((groups: Record<string, TransactionRemote[]>, t) => {
      // skip transactions for unsyncd fund
      // TODO: sync fund first and then transactions
      assert(parseInt(t.fundId) > 0, `fund unsynced fund: ${t.fundId}, ${parseInt(t.fundId)} ${t}`)

      if (!groups[t.fundId]) {
        groups[t.fundId] = []
      }
      groups[t.fundId].push(t)
      return groups
    }, {})

    requests = requests.concat(
      Object.keys(transactionsByFundId).map((key) => {
        return {
          appendCells: {
            sheetId: parseInt(key),
            rows: transactionsByFundId[key].map((t) => transactionToRequestObject(t)),
            fields: 'userEnteredValue',
          },
        }
      })
    )
  }
  if (requests.length > 0) {
    // TODO: process response?
    await api.batchUpdate(requests)
  }

  // TODO: more effective sync. Maybe try to merge remoteTransactions with fundTransactionsPages
  remoteTransactions = (await api.batchGet(funds.map((f) => `${f.name}!A2:D`))).valueRanges.flatMap(
    (v, idx): TransactionRemote[] => {
      return v.values.map((tr, id) => {
        const transaction = transformTransactionFromResponse(tr)
        return {
          ...transaction,
          syncDate: new Date().toISOString(),
          fundId: funds[idx].id,
          id: String(10000000 + idx * 10000000 + id),
        }
      })
    }
  )
  dispatch(transactionsSlice.actions.replace(remoteTransactions))
}

let initialState = { [fundsSlice.reducerPath]: { status: 'idle' } }

export const syncReducer = createReducer(initialState, (builder) => {
  builder.addCase(syncData.fulfilled, (state, _) => {
    state[fundsSlice.reducerPath].status = 'idle'
  })
  builder.addCase(syncData.pending, (state, _) => {
    state[fundsSlice.reducerPath].status = 'loading'
  })
  builder.addCase(syncData.rejected, (state, _) => {
    state[fundsSlice.reducerPath].status = 'error'
  })
})
