import { Fund } from './Fund';
import styled from 'styled-components';
import { FundRemote } from '../types';

const List = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 1em 1em;
    
`
export function FundList({funds}: {funds: FundRemote[]}) {

    return (
        <List >
            {
                funds.length > 0
                    ? funds.map((f) => <Fund fund={f} onClick={() => {}} key={f.id}/>)
                    : <div>No funds</div>
            }
        </List>
    )
}