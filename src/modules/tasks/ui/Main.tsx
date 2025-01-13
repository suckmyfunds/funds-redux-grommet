import { Box } from '@mantine/core'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { selectStatus } from '../store'
import Task from './Task.tsx'

export default function Main({ tasksIds }: { tasksIds: string[] }) {
  const fetching = useSelector(selectStatus)
  const navigate = useNavigate()
  return (
    <Box p='md'>
      {tasksIds.length > 0 ? (
        tasksIds.map((id) => <Task key={id} taskId={id} onClick={() => navigate(`/tasks/detail/${id}`)} />)
      ) : (
        <>{fetching ? <Box>fetching data</Box> : <div>No tasks</div>}</>
      )}
    </Box>
  )
}