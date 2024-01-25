import type { Meta, StoryObj } from '@storybook/react'

import FundList from '../components/FundList'

const meta: Meta<typeof FundList> = {
  title: 'components/FundList',
  component: FundList,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof FundList>

export const Primary: Story = {
  args: {
    fundIds: ['1', '2'],
  },
}
