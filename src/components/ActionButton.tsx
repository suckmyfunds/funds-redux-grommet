import { ActionCreator, AsyncThunk } from '@reduxjs/toolkit'
import { useCallback } from 'react'

import { useAppDispatch } from '../store'
import Button, { ButtonProps } from './Button'

export default function ActionButton({
  actionCreator,
  ...props
}: {
  actionCreator: AsyncThunk<any, void, any> | ActionCreator<any>
} & ButtonProps) {
  const dispatch = useAppDispatch()
  const act = useCallback(() => dispatch(actionCreator()), [dispatch])
  return <Button onClick={act} {...props}></Button>
}
