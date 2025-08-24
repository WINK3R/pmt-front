export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
export const ALL_PRIORITY: TaskPriority[] = Object.values(TaskPriority);

export function labelOfStatus(status: TaskPriority): string {
  switch (status) {
    case TaskPriority.LOW: return 'LOW';
    case TaskPriority.MEDIUM: return 'MEDIUM';
    case TaskPriority.HIGH: return 'HIGH';
    default: return status;
  }
}
