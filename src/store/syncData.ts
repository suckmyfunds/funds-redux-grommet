import { ThunkDispatch, UnknownAction, createAsyncThunk, createReducer } from "@reduxjs/toolkit";
import API, { fundToRequestObject, transactionToRequestObject, transformTransactionFromResponse } from '../api';
import { authorize, selectIsAuthorized } from "./authSlice";
import { fetchFunds, fundsSlice, selectLocalFunds } from "./fundsSlice";
import { selectLocalTransactions, transactionsSlice } from "./transactionsSlice";
import { BatchRequest, Fund, FundRemote, TransactionRemote } from "../types";
import { AppDispatch, type RootState } from ".";
import { assert } from "../utils";


export const syncData = createAsyncThunk(
    "root/sync", async (_, { dispatch, getState }): Promise<void> => {
        dispatch(fundsSlice.actions.setStatus('synchronization'));

        let rootState: RootState = getState() as RootState;

        let token = rootState.auth.token;
        if (!selectIsAuthorized(rootState)) {
            token = (await dispatch(authorize()).unwrap()).token;
        }
        const api = new API(token);
        const remoteFunds = await dispatch(fetchFunds()).unwrap();


        const info = await api.spreadSheetInfo();
        const fundByName = remoteFunds.reduce((acc: Record<string, Fund>, f) => { acc[f.name] = f; return acc; }, {});

        const fundsWithIds = info.sheets.reduce((acc: FundRemote[], sheet) => {
            if (fundByName[sheet.properties.title]) {
                acc.push({
                    ...fundByName[sheet.properties.title],
                    id: String(sheet.properties.sheetId)
                });
            }
            return acc;
        }, []);
        dispatch(fundsSlice.actions.replace(fundsWithIds));

        const transactionsData = (await api.batchGet(remoteFunds.map(f => `${f.name}!A2:D`)))
            .valueRanges.flatMap((v, idx): TransactionRemote[] => {
                return v.values.map((tr, id) => {
                    const transaction= transformTransactionFromResponse(tr)
                    return {
                        ...transaction,
                        syncDate: new Date().toISOString(),
                        fundId: fundsWithIds[idx].id,
                        id: String(10000000 + idx * 10000000 + id)
                    }
                });
            });

        // TODO: when implement transactions synchronization replace the 'replace' action with transactionsSlice.actions.addMany
        dispatch(transactionsSlice.actions.replace(transactionsData));

        let requests: BatchRequest[] = [];

        const localFunds = selectLocalFunds(rootState);

        if (localFunds.length > 0) {
            requests.push({
                appendCells: {
                    sheetId: 0,
                    rows: {
                        values: localFunds.flatMap(f => fundToRequestObject(f).rows.values)
                    },
                    fields: "userEnteredValue"
                }
            });
        }
        requests.concat(localFunds.map((f) => {
            return {
                addSheet: {
                    properties: {
                        title: f.name
                    }
                }
            };
        }));

        if (requests.length > 0) {

            const response = await api.batchUpdate(requests);
            const [createdFunds, ...fundTransactionsPages] = response.replies;
            console.log(createdFunds);
            console.log(fundTransactionsPages);
            // TODO: update fund IDs,
            // match by index localFunds and fundTransactionsPages
            // make the update action which finds transaction with fundID from localFunds and replace it with ID from fundTransactionsPage
        }

        // await syncTransactions(rootState, api, dispatch);

        dispatch(fundsSlice.actions.setStatus('idle'));
    }
)

export async function syncTransactions(rootState: RootState, api: API, dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) {
    let requests: BatchRequest[] = []
    // TODO: we need to append local transactions, and resolve conflicts with local transactions
    // remote and local transaction conflicts if they have same date and same amout
    // if we see conflict - we need to note user that we merge them
    const localTransactions = selectLocalTransactions(rootState)

    if (localTransactions.length > 0) {
        const transactionsByFundId = localTransactions.reduce((groups: Record<string, TransactionRemote[]>, t) => {
            // skip transactions for unsyncd fund
            // TODO: sync fund first and then transactions
            assert(parseInt(t.fundId) < 0, "fund unsynced fund")

            if (!groups[t.fundId]) {
                groups[t.fundId] = []
            }
            groups[t.fundId].push(t)
            return groups
        }, {})

        requests.concat(Object.keys(transactionsByFundId).map(key => {
            const trs = transactionsByFundId[key]
            return {
                appendCells: {
                    sheetId: parseInt(key),
                    rows: {
                        values: trs.flatMap(t => transactionToRequestObject(t).rows.values)
                    },
                    fields: "userEnteredValue"
                }
            }
        }))
    }
    if (requests.length > 0) {

        const response = await api.batchUpdate(requests)
        const [createdFunds, ...fundTransactionsPages] = response.replies
        console.log(createdFunds)
        console.log(fundTransactionsPages)
    }
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