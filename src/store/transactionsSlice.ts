import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { Entity, Transaction, TransactionRemote } from "../types";



// export const fetchTransactionsForFund = createAsyncThunk("transactions/fetchAll",
//     async (fundName: string, { getState }): Promise<TransactionRemote[]> => {
//         const token = (getState() as RootState).auth.token;
//         let api = new API(token);
//         const fundId: number = selectFundByName(fundName)(getState() as RootState)?.id!
//         assert(fundId === undefined, `Fund with name ${fundName} used to get transactions should exists is store`)

//         return (await api.getRows(`${fundName}!A2:E`)).map((t, idx) => ({ ...transformTransactionFromResponse(t), id: idx + 2, status: 'idle', fundId }));
//     });

// export const addTransactionToFund = createAsyncThunk("transactions/add",
//     async (fundName: string, { getState }): Promise<TransactionRemote[]> => {
//         const token = (getState() as RootState).auth.token;
//         let api = new API(token);
//         const fundId: number = selectFundByName(fundName)(getState() as RootState)?.id!
//         assert(fundId === undefined, `Fund with name ${fundName} used to get transactions should exists is store`)

//         return (await api.getRows(`${fundName}!A2:E`)).map((t, idx) => ({ ...transformTransactionFromResponse(t), id: idx + 2, status: 'idle', fundId }));
//     });
 

const adapter = createEntityAdapter({
    selectId: (t: TransactionRemote) => t.id
})

const slice = createSlice({
    name: "transactions",
    initialState: adapter.getInitialState(),
    reducers: {
        add: adapter.addOne,
        remove: adapter.removeOne,
        update: adapter.updateOne,
    }
})


export const transactionsSlice = slice

export const selectTransactions = (state: RootState) => (fundId: number) => {
    return adapter.getSelectors().selectAll(state.transactions).filter(t => t.fundId === fundId)
}