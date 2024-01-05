import { Meta, StoryObj } from '@storybook/react';
import TransactionEditor from '../components/TransactionEditor';

const meta: Meta =  {
    title: 'components/TransactionEditor',
    component: TransactionEditor,
    parameters: {
        layout: 'centered',
    },
};
export default meta

type Story = StoryObj<typeof TransactionEditor>;

export const Primary: Story = {
}