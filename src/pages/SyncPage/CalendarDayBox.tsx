import { Box, ResponsiveContext, Stack, Text } from 'grommet'
import { useContext } from 'react'
import { useSelector } from 'react-redux'

import { selectTransactionsOnDate } from '../../store/selectors'

export const CalendarDayBox = ({
  date,
  day,
  isSelected,
  onSelectDate,
  fundId,
}: {
  date: Date
  day: number
  isSelected: boolean
  onSelectDate: (nextDate: any) => void
  fundId?: string
}) => {
  const trCount = useSelector((s) => selectTransactionsOnDate(s, date, fundId).length)
  const size = useContext(ResponsiveContext)
  const gap = size == 'small' ? 'xxsmall' : 'xsmall'
  const pad = size == 'small' ? 'xxsmall' : 'xsmall'
  const textSize = size == 'small' ? 'xxsmall' : 'small'
  return (
    <Box
      background={isSelected ? 'light-3' : 'white'}
      onClick={() => onSelectDate(date.toISOString())}
      fill
      gap={gap}
      pad={pad}
    >
      <Stack anchor="top-right" fill>
        <Box align="center" justify="center" fill gap={'xsmall'} pad={'small'}>
          <Text size={textSize}>{day}</Text>
        </Box>
        {trCount ? (
          <Box align="right" justify="start" color="brand" gap={'small'}>
            <Text color="brand" size={size == 'small' ? 'xxsmall' : 'xsmall'}>
              {trCount}
            </Text>
          </Box>
        ) : null}
      </Stack>
    </Box>
  )
}
