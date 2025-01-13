export default function Project({ taskId: projectId, onClick }: { taskId: string, onClick: () => void }) {
  return <div onClick={onClick}>Task {projectId}</div>
}
