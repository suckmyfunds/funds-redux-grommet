import styled from 'styled-components';
import { FundRemote } from '../types';
import FundComponent from './Fund';

const List = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 1em 1em;
    
`
export default function FundList({funds}: {funds: FundRemote[]}) {
    return (
        <List>
            {
                funds.length > 0
                    ? funds.map((f) => <FundComponent fund={f} onClick={() => {}} key={f.name}/>)
                    : <div>No funds</div>
            }
        </List>
    )
}