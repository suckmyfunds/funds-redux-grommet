import { useCallback } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import ActionButton from "../components/ActionButton";
import Flex, { List } from "../components/layout/Flex";
import { useAppDispatch } from "../store";
import { selectUnsyncedTransactions } from "../store/selectors";
import { makeSync } from "../store/transactionsSlice";
import { colors } from "../theme";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const GlassTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${colors.white};
  box-shadow: 0 0 10px rgba(0, 0, 0,  0.4);

  td {
    padding: 0.5em;
    text-align: left;

  }

  tr:nth-child(even) {
    background-color: ${colors.gray};
  }
  tr:nth-child(even) > td {
    background-color: ${colors.gray};
  }
`;


export default function () {
    const unsyncedTransactions = useSelector(selectUnsyncedTransactions)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const makeTransactionSync = useCallback((id: string) => {
        dispatch(makeSync(id))
    }, [dispatch])
    return (
        <div>
            <h1>Sync Page</h1>
            <Button onClick={() => navigate(-1)}>back</Button>
            <Flex $gap={20}>
                {Object.keys(unsyncedTransactions).map((fundName) => {
                    const trs = unsyncedTransactions[fundName]
                    return (
                        <List key={fundName}>
                            <h3>{fundName}</h3>
                            <GlassTable >
                                <tbody>
                                    {trs.map((t) => <tr key={t.id}>
                                        <td><ActionButton actionCreator={() => makeTransactionSync(t.id)} label="sync" /></td>
                                        <td>{t.date}</td>
                                        <td>{t.amount}</td>
                                        <td>({t.description ? t.description : "???"})</td>
                                    </tr>)}
                                </tbody>
                            </GlassTable>

                        </List>
                    )
                })}
            </Flex>
        </div>
    )
}