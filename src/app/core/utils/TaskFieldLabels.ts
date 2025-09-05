export const TASK_FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  priority: 'Priority',
  label: 'Tag',
  status: 'Status',
  assigneeId: 'Assigned Teammate',
  dueDate: 'Due Date',
};

export function getTaskFieldLabel(field: string): string {
  return TASK_FIELD_LABELS[field] || field;
}
