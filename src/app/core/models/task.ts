import {TaskPriority} from './enum/taskPriority';
import {TaskStatus} from './enum/taskStatus';
import {Tag} from './enum/tag';
import {UserDTO} from './dtos/dto';

export class Task {
  constructor(
    public id: string,
    public projectId: string,
    public title: string,
    public description: string | undefined,
    public label: Tag,
    public dueDate: Date | undefined,
    public priority: TaskPriority | undefined,
    public status: TaskStatus,
    public assignee: UserDTO | undefined,
    public createdBy: UserDTO,
    public updatedBy: UserDTO,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromApi(dto: any): Task {
    return new Task(
      dto.id,
      dto.project?.id ?? dto.projectId ?? '',
      dto.title,
      dto.description ?? undefined,
      dto.label,
      dto.dueDate ? new Date(dto.dueDate) : undefined,
      dto.priority as TaskPriority,
      dto.status as TaskStatus,
      dto.assignee ?? undefined,
      dto.createdBy,
      dto.updatedBy,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }
}
