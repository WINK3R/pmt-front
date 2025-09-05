import { Task } from '../../models/task';
import { TaskPriority } from '../../models/enum/taskPriority';
import { TaskStatus } from '../../models/enum/taskStatus';
import { Tag } from '../../models/enum/tag';
import {TaskDTO, UserDTO} from '../../models/dtos/dto';

export class TaskStub {
  static testUser(): UserDTO {
    return {
      id: 'user-1',
      username: 'John Doe',
      profileImageUrl: '/images/avatar.png'
    };
  }

  static testTask(): Task {
    return new Task(
      'task-1',
      'project-1',
      'Sample Task Title',
      'This is a description for the task.',
      Tag.Testing,
      new Date(),
      TaskPriority.HIGH,
      TaskStatus.TODO,
      this.testUser(),
      this.testUser(),
      this.testUser(),
      new Date('2025-09-01T12:00:00Z'),
      new Date('2025-09-05T10:30:00Z')
    );
  }

  static testTaskDTO(): TaskDTO {
    return {
      id: 'task-1',
      projectId: 'project-1',
      title: 'Sample Task Title',
      description: 'This is a description for the task.',
      label: Tag.Testing,
      createdAt: new Date().toString(),
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      createdBy: this.testUser(),
      updatedBy: this.testUser(),
      assigneeId: this.testUser(),
      updatedAt: new Date('2025-09-01T12:00:00Z').toString(),
      dueDate: new Date('2025-09-05T10:30:00Z').toString(),
    }
  }

  static taskWithCustomStatus(status: TaskStatus): Task {
    const task = this.testTask();
    task.status = status;
    return task;
  }

  static taskList(count: number = 3): Task[] {
    return Array.from({ length: count }, (_, i) => new Task(
      `task-${i + 1}`,
      'project-1',
      `Task ${i + 1}`,
      `Description of task ${i + 1}`,
      Tag.Development,
      new Date(),
      TaskPriority.MEDIUM,
      TaskStatus.IN_PROGRESS,
      this.testUser(),
      this.testUser(),
      this.testUser(),
      new Date(),
      new Date()
    ));
  }
}
