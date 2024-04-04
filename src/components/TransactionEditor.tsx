import { Button, Group, TextInput } from '@mantine/core'
import { ResponsiveContext } from 'grommet'
import { useCallback, useContext, useState } from 'react'

const floatRegExp = new RegExp('^-?[0-9]*([0-9]{1}[.,][0-9]{0,2})?$')

export default function TransactionEditor({
  onSubmit,
  disabled,
}: {
  onSubmit: ({ description, amount }: { description: string; amount: string }) => void
  disabled?: boolean
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const size = useContext(ResponsiveContext)
  const onClick = useCallback(
    (e: React.UIEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onSubmit({ description, amount })
    },
    [onSubmit, description, amount]
  )

  function onChangeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    if (floatRegExp.test(value)) {
      setAmount(value.startsWith('0') ? value.slice(1) : value)
    }
  }

  return (
    <Group wrap="nowrap" gap={0}>
      <TextInput
        type="text"
        placeholder="amount"
        name="amount"
        size={size}
        value={amount}
        onChange={onChangeAmount}
        autoFocus={true}
        onKeyUp={(e) => e.key === 'Enter' && onClick(e)}
      />
      <TextInput
        type="text"
        placeholder="description"
        name="desctiprion"
        size={size}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Button onClick={onClick} variant="filled" disabled={disabled || amount === ''}>
        +
      </Button>
    </Group>
  )
}
