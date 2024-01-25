import { ActionCreator, AsyncThunk } from '@reduxjs/toolkit'
import { useCallback } from 'react'

import { useAppDispatch } from '../store'
import Button from './Button'

export default function ActionButton({
  actionCreator,
  label,
  disabled,
}: {
  actionCreator: AsyncThunk<any, void, any> | ActionCreator<any>
  label: string
  disabled?: boolean
}) {
  const dispatch = useAppDispatch()
  const act = useCallback(() => dispatch(actionCreator()), [dispatch])
  return <Button onClick={act} label={label} disabled={disabled}></Button>
}
