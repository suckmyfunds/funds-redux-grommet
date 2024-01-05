import type { Meta, StoryObj } from '@storybook/react';
import Fund from '../components/Fund';

type FundProps = React.ComponentProps<typeof Fund>
    & { balance: number, budget: number }

const meta: Meta<FundProps> = {
    title: 'components/Fund',
    component: Fund,
    render: ({ balance, budget, fund }) => {
        return <Fund 
        fund={{ ...fund, balance, budget }} />
    },
    argTypes: {
        balance: {
            control: {
                type: 'range',
                min: 0,
                max: 1000,
                step: 1
            }
        },
        budget: {
            control: {
                type: 'range',
                min: 0,
                max: 1000,
                step: 1
            }
        }
    },
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
        controls: { expanded: true }
    },
};

export default meta;

type Story = StoryObj<typeof Fund>;

export const Primary: Story = {
    args: {
        fund: {
            name: 'Fund 1',
            budget: 1000,
            balance: 800,
            needSync: false,
            id: "id",
            syncDate: ""
        }
    }
}