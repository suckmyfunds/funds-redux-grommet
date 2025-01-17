import { Button, Group, TextInput } from '@mantine/core'
import React, { useCallback, useMemo, useRef, useState } from 'react'

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
  const inputRefFocus: React.MutableRefObject<HTMLInputElement | null> = useRef(null)
  const submitButtonRef: React.MutableRefObject<HTMLButtonElement | null> = useRef(null)
  const canSubmit = useMemo(() => amount !== '' && description !== '' && !disabled, [amount, description, disabled])

  const [debounce, setDebounce] = useState(false)
  const onClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      const clickEvent = (e as React.MouseEvent) && e.type == 'click' && e.target === submitButtonRef.current
      const entepPress = (e as React.KeyboardEvent).key === 'Enter'

      if (!(entepPress || clickEvent)) {
        return
      }

      if (!canSubmit) return

      if (debounce) return

      setDebounce(true)

      e.preventDefault()
      e.stopPropagation()
      onSubmit({ description, amount })

      setAmount('')
      setDescription('')
      inputRefFocus?.current?.focus()
      setTimeout(() => setDebounce(false), 0)
    },
    [onSubmit, setAmount, setDescription, description, amount, inputRefFocus]
  )

  function onChangeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    console.log("amount", value)
    if (floatRegExp.test(value)) {
      setAmount(value.startsWith('0') ? value.slice(1) : value)
    }
  }

  return (
    <Group wrap="nowrap" gap="xs" onKeyUp={onClick} onClick={onClick}>
      <TextInput
        type="number"
        inputMode="decimal"
        pattern='[0-9]*.?[0-9]*'
        ref={inputRefFocus}
        placeholder="amount"
        name="amount"
        value={amount}
        onChange={onChangeAmount}
        autoFocus={true}
      />
      <TextInput
        type="text"
        placeholder="description"
        name="desctiprion"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Button ref={submitButtonRef} variant="filled" disabled={!canSubmit}>
        +
      </Button>
    </Group>
  )
}
