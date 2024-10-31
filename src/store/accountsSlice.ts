import { createAsyncThunk, createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit'

import API, { transformAccountFromResponse, transformAccountToResponse } from '../api'
import { Account, AccountRemote } from '../types'
import { selectToken } from './authSlice'
import { RootState, getAPIFromStore } from './index'

export const getAccounts = createAsyncThunk('accounts/fetchAll', async (_, { getState }): Promise<AccountRemote[]> => {
  const api = getAPIFromStore(getState)

  return (await api.getRows('accounts!A2:F')).map((a, idx) => ({
    ...transformAccountFromResponse(a),
    id: `${idx + 1}`,
  }))
})

export const createAccount = createAsyncThunk<AccountRemote, Account, { rejectValue: { id: string; error: Error } }>(
  'accounts/create',
  async (payload: Account, { getState, dispatch, rejectWithValue }) => {
    const api = getAPIFromStore(getState)
    const result: AccountRemote = { ...payload, id: nanoid() }

    dispatch(slice.actions.add(result))
    try {
      await api.appendRow('accounts', transformAccountToResponse(result))
    } catch (e) {
      return rejectWithValue({
        id: result.id,
        error: e as Error,
      })
    }
    return { ...result }
  }
)

const adapter = createEntityAdapter({ selectId: (acc: AccountRemote) => acc.id })

const initialState = adapter.getInitialState()

const slice = createSlice({
  name: 'accounts',
  initialState,
  reducerPath: 'accounts',
  reducers: {
    add: adapter.addOne,
    remove: adapter.removeOne,
    update: adapter.updateOne,
    replace: adapter.setAll,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAccounts.fulfilled, (s, { payload }) => {
        adapter.setAll(s, payload)
      })
      .addCase(createAccount.rejected, (s, action) => {
        if (action.payload) {
          adapter.updateOne(s, { id: action.payload.id, changes: { ...s.entities[s.ids[0]] } })
        } else {
          console.error('createAccount.rejected have no payload, so temporal account not removed', action.error)
        }
      })
  },
})

export const selectors = adapter.getSelectors((s: RootState) => s.accounts)

export const accountsSlice = {
  ...slice,
  initialState,
}
