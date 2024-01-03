import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { FundRemote } from '../types';
import { RootState } from "./index";
import { selectTransactions } from "./transactionsSlice";
import { persistReducer } from "reduxjs-toolkit-persist";
import storage from "reduxjs-toolkit-persist/lib/storage";

// export const fetchFunds = createAsyncThunk("funds/fetchAll", async (_, { getState }): Promise<FundRemote[]> => {
//     const token = (getState() as RootState).auth.token;
//     let api = new API(token);
//     return (await api.getRows("funds!A2:E")).map((f, idx) => ({ ...transformFundFromResponse(f), id: idx + 2, status: 'idle' }));
// });
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
    selectId: (fund: FundRemote) => fund.id
});

// with fetching status
const initialState = adapter.getInitialState({ status: 'idle' });

const slice = createSlice({
    name: 'funds',
    initialState,
    reducers: {
        add: adapter.addOne,
        remove: adapter.removeOne,
        update: adapter.updateOne,
    },
});

const { actions, name } = slice
const persistConfig = {
    key: name,
    storage,
}
const reducer = persistReducer(persistConfig, slice.reducer)

export const fundsSlice = { actions, name, reducer: reducer }

export const selectStatus = (state: RootState) => state.funds.status;
export const { selectAll } = adapter.getSelectors((s: RootState) => s.funds)

export const selectFund = (fundId: number) => (state: RootState) => ({
    ...state.funds.entities[fundId],
    transactions: selectTransactions(state)(fundId)
})

export const selectFundByName = (fundName: string) => (state: RootState) =>
    adapter.getSelectors().selectAll(state.funds).find(f => f.name === fundName)