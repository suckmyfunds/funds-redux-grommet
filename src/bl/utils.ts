import {Transaction} from "../types";

export function makeOnlyExpensesWithTreshhold(treshhold: number = 0) {
    return function (t: Transaction) {
        return t.amount > 0 && t.amount <= (treshhold == 0 ? Number.MAX_VALUE : treshhold)
    }
}
