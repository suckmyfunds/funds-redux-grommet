export default function Task({ taskId, onClick }: { taskId: string, onClick: () => void }) {
  return <div onClick={onClick}>Task {taskId}</div>
}
