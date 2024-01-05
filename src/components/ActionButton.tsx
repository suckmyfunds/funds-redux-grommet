import { AsyncThunk } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import Button from './Button';
import { useAppDispatch } from '../store';

export default function ActionButton(
  {
    actionCreator, name
  }: {
    actionCreator: AsyncThunk<any, void, any>;
    name: string;
  }) {
  const dispatch = useAppDispatch();
  const act = useCallback(() => dispatch(actionCreator()), [dispatch]);
  return <Button onClick={act}>
    {name}
  </Button>;
}
