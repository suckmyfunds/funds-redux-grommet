import { Box, Grid } from 'grommet'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { selectStatus } from '../store/fundsSlice'
import FundComponent from './Fund'

export default function FundList({ fundIds }: { fundIds: string[] }) {
  const fetching = useSelector(selectStatus)
  const navigate = useNavigate()
  return (
    <Grid columns="medium" gap="small">
      {fundIds.length > 0 ? (
        fundIds.map((id) => <FundComponent key={id} fundId={id} onClick={() => navigate(`/detail/${id}`)} />)
      ) : (
        <>{fetching ? <Box>fetching data</Box> : <div>No funds</div>}</>
      )}
    </Grid>
  )
}
