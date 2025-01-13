
export interface Task {
    id: string
    name: string
    dueDate: Date
    status: 'TODO'| 'PENDING' | 'DONE'
    description?: string
  }