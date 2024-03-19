import { Grid } from 'grommet'
import { useNavigate } from 'react-router-dom'

import FundComponent from './Fund'

export default function FundList({ fundIds }: { fundIds: string[] }) {
  const navigate = useNavigate()
  return (
    <Grid columns="medium" gap="small">
      {fundIds.length > 0 ? (
        fundIds.map((id) => <FundComponent key={id} fundId={id} onClick={() => navigate(`/detail/${id}`)} />)
      ) : (
        <div>No funds</div>
      )}
    </Grid>
  )
}
