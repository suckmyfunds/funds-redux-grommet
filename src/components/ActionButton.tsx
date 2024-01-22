import { ActionCreator, AsyncThunk } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import Button from './Button';
import { useAppDispatch } from '../store';

export default function ActionButton(
  {
    actionCreator, children
  }: {
    actionCreator: AsyncThunk<any, void, any> | ActionCreator<any>,
    children: React.ReactNode
  }) {
  const dispatch = useAppDispatch();
  const act = useCallback(() => dispatch(actionCreator()), [dispatch]);
  return <Button onClick={act}>
    {children}
  </Button>;
}
