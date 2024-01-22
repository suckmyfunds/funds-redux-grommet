import styled from 'styled-components';
import FundComponent from './Fund';
import { Link } from 'react-router-dom';

const List = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 1em 1em;
    
`
export default function FundList(
    {
        fundIds,

    }: {
        fundIds: string[],

    }) {
    return (
        <List>
            {
                fundIds.length > 0
                    ? fundIds.map((id) => <Link to={`/detail/${id}`} key={id}><FundComponent fundId={id} /></Link>)
                    : <div>No funds</div>
            }
        </List>
    )
}