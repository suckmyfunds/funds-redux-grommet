import type { Meta, StoryObj } from '@storybook/react';
import { FundList } from '../components/FundList';

const meta: Meta<typeof FundList> = {
    title: 'components/FundList',
    component: FundList,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof FundList>;

export const Primary: Story = {
    args: {
        funds: [
            {
                id: 1,
                name: "Fund 1",
                balance: 1000,
                budget: 1000,
                needSync: true,
                status: 'idle'
            },

            {
                id: 2,
                name: "Fund 2",
                balance: 2000,
                budget: 2000,
                needSync: false,
                status: 'idle'
            },
            {
                id: 3,
                name: "Fund 3",
                balance: 3000,
                budget: 3000,
                needSync: false,
                status: 'idle'
            }
        ]
    }
}