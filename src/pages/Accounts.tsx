import { Box, Button, Card, Flex, Stack, Text, TextInput } from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useAppDispatch } from '../store'
import { createAccount, getAccounts, selectors } from '../store/accountsSlice'
import { selectIsAuthorized } from '../store/authSlice'
import { AccountRemote } from '../types'

export default function Accounts() {
  const authorized = useSelector(selectIsAuthorized)
  const accounts = useSelector(selectors.selectAll)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!authorized) return
    dispatch(getAccounts())
  }, [authorized])

  const onAddAccountClick = useCallback(() => {
    dispatch(createAccount({ name, initialBalance }))
  }, [createAccount])
  const [name, setName] = useState('')
  const [initialBalance, setBalance] = useState(0)

  return (
    <Stack gap={'sm'}>
      {accounts && accounts.map((a) => <Account key={a.id} account={a} />)}
      {accounts.length == 0 && <div>No accounts found</div>}
      <Box>
        <TextInput label="Account name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput
          label="Account balance"
          value={initialBalance}
          onChange={(e) => setBalance(Number.parseFloat(e.target.value))}
          type="number"
        />
        <Button onClick={onAddAccountClick} disabled={name == '' || initialBalance == 0 || !authorized}>
          {authorized ? 'Add Account' : 'You need to Authorize'}
        </Button>
      </Box>
    </Stack>
  )
}

function Account({ account }: { account: AccountRemote }) {
  return (
    <Card>
      <Card.Section>
        <Flex gap={'xs'} align={'center'}>
          <Text>{account.name}</Text> <Text>{account.initialBalance}</Text>
        </Flex>
      </Card.Section>
    </Card>
  )
}
