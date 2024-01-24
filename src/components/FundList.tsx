import styled from 'styled-components';
import FundComponent from './Fund';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Grid } from 'grommet';

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
    const navigate = useNavigate()
    return (
        <Grid columns="medium" gap="medium">
            {
                fundIds.length > 0
                    ? fundIds.map((id) => <FundComponent fundId={id} onClick={() => navigate(`/detail/${id}`)} />)
                    : <div>No funds</div>
            }
        </Grid>
    )
}