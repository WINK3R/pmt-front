export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED'
}
export const ALL_STATUS: TaskStatus[] = Object.values(TaskStatus);

export function labelOfStatus(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO: return 'To Do';
    case TaskStatus.IN_PROGRESS: return 'In Progress';
    case TaskStatus.CANCELED: return 'Canceled';
    case TaskStatus.COMPLETED: return 'Completed';
    default: return status;
  }
}
