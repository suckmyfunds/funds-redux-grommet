
export interface Project {
    id: string
    name: string
    dueDate?: Date
    status: 'TODO'| 'INPROGRESS' | 'DONE'
    notes?: string
  }