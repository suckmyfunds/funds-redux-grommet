import { Box, Button, TextInput } from 'grommet'
import { useCallback, useState } from 'react'

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

  const onClick = useCallback(
    (e: React.UIEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onSubmit({ description, amount })
    },
    [onSubmit, description, amount]
  )

  function onChangeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    if (floatRegExp.test(e.target.value)) {
      setAmount(e.target.value.startsWith('0') ? e.target.value.slice(1) : e.target.value)
    }
  }

  return (
    <Box gap="small">
      <Box flex direction="row" gap="small">
        <TextInput
          type="text"
          placeholder="amount"
          name="amount"
          value={amount}
          onChange={onChangeAmount}
          autoFocus={true}
          onKeyUp={(e) => e.key === 'Enter' && onClick(e)}
        />
        <TextInput
          type="text"
          placeholder="description"
          name="desctiprion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Box>
      <Box>
        <Button onClick={onClick} label="Add" disabled={disabled || amount === ''} />
      </Box>
    </Box>
  )
}
