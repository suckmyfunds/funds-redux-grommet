import { createEntityAdapter, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FundRemote } from '../types';
import API, { fundToRequest, transformFundFromResponse } from '../api';
import { RootState } from "./index";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import hardSet from "redux-persist/es/stateReconciler/hardSet";

export const fetchFunds = createAsyncThunk("funds/fetchAll", async (_, { getState }): Promise<FundRemote[]> => {
    const token = (getState() as RootState).auth.token;

    let api = new API(token);
    return (await api.getRows("funds!A2:E")).map((f, idx) => ({ ...transformFundFromResponse(f), id: idx + 2, status: 'idle'}));
});
export const updateFund = createAsyncThunk("funds/update", async (fund: FundRemote, { getState }) => {
    const token = (getState() as RootState).auth.token;
    let api = new API(token);
    let id = await api.updateRow("funds", fundToRequest(fund), fund.id);
    return { ...fund, id };
});

export const createFund = createAsyncThunk("funds/create", async (fund: FundRemote, { getState }) => {
    const token = (getState() as RootState).auth.token;
    let api = new API(token);
    let id = await api.appendRow("funds", fundToRequest(fund));
    return { ...fund, id };
})

const fundsAdapter = createEntityAdapter({
    selectId: (fund: FundRemote) => fund.id
});

// with fetching status
const initialState = fundsAdapter.getInitialState({ status: 'idle' });

const slice = createSlice({
    name: 'funds',
    initialState,
    reducers: {
        add: fundsAdapter.addOne,
        remove: fundsAdapter.removeOne,
        update: fundsAdapter.updateOne,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFunds.pending, (state) => {
            state.status = 'loading';
        })

        builder.addCase(fetchFunds.fulfilled, (state, action) => {
            fundsAdapter.upsertMany(state, action.payload)
            state.status = 'idle';

        });

        builder.addCase(updateFund.fulfilled, (state, { payload }) => {
            const { id, ...changes } = payload;
            fundsAdapter.updateOne(state, { id, changes });
        });
    },
});

const { actions, name } = slice
const persistConfig = {
    key: name,
    storage,
    stateReconciler: hardSet,
}
const reducer = persistReducer(persistConfig, slice.reducer)
export const fundsSlice = { actions, name, reducer }

export const selectStatus = (state: RootState) => state.funds.status;
export const { selectAll } = fundsAdapter.getSelectors((s: RootState) => s.funds)
