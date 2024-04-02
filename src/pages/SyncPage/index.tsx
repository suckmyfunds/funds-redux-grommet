import { Stack } from '@mantine/core'
import { RadioButtonGroup } from 'grommet'
import { useState } from 'react'

import { FillTransactions } from './FillTransactions'
import { SyncTransactions } from './SyncTransactions'

export const amountFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

const modeComponent: Record<string, JSX.Element> = {
  st: <SyncTransactions />,
  ft: <FillTransactions />,
}

export default function () {
  const postMethods = [
    { label: 'Sync transactions', value: 'st' },
    { label: 'Fill transactions', value: 'ft' },
  ]
  const [mode, setMode] = useState('ft')
  return (
    <Stack>
      <RadioButtonGroup
        name="radio"
        options={postMethods}
        value={mode}
        onChange={(event: any) => setMode(event.value)}
      />
      {modeComponent[mode]}
    </Stack>
  )
}
