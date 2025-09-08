import { Task } from './task';
import { TaskPriority } from './enum/taskPriority';
import { TaskStatus } from './enum/taskStatus';
import { Tag } from './enum/tag';
import { UserDTO } from './dtos/dto';

describe('Task model', () => {
  const user: UserDTO = { id: 'u1', username: 'John' } as any;
  const updater: UserDTO = { id: 'u2', username: 'Jane' } as any;

  it('should create a Task instance directly', () => {
    const task = new Task(
      't1',
      'p1',
      'My Task',
      'Some description',
      Tag.Development,
      new Date('2024-01-01'),
      TaskPriority.HIGH,
      TaskStatus.TODO,
      user,
      user,
      updater,
      new Date('2024-01-02'),
      new Date('2024-01-03')
    );

    expect(task.id).toBe('t1');
    expect(task.projectId).toBe('p1');
    expect(task.title).toBe('My Task');
    expect(task.description).toBe('Some description');
    expect(task.label).toBe(Tag.Development);
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.assignee).toEqual(user);
    expect(task.createdBy).toEqual(user);
    expect(task.updatedBy).toEqual(updater);
    expect(task.createdAt).toEqual(new Date('2024-01-02'));
    expect(task.updatedAt).toEqual(new Date('2024-01-03'));
  });

  it('should map fromApi dto with all fields', () => {
    const dto = {
      id: 't2',
      projectId: 'p2',
      title: 'API Task',
      description: 'From API',
      label: Tag.Development,
      dueDate: '2024-02-01T00:00:00.000Z',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      assignee: user,
      createdBy: user,
      updatedBy: updater,
      createdAt: '2024-02-02T00:00:00.000Z',
      updatedAt: '2024-02-03T00:00:00.000Z'
    };

    const task = Task.fromApi(dto);

    expect(task).toBeInstanceOf(Task);
    expect(task.id).toBe('t2');
    expect(task.projectId).toBe('p2');
    expect(task.title).toBe('API Task');
    expect(task.dueDate).toEqual(new Date(dto.dueDate));
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.assignee).toEqual(user);
    expect(task.createdBy).toEqual(user);
    expect(task.updatedBy).toEqual(updater);
    expect(task.createdAt).toEqual(new Date(dto.createdAt));
    expect(task.updatedAt).toEqual(new Date(dto.updatedAt));
  });

  it('should handle missing optional fields gracefully', () => {
    const dto = {
      id: 't3',
      project: { id: 'p3' },
      title: 'Partial Task',
      label: Tag.Development,
      status: TaskStatus.COMPLETED,
      createdBy: user,
      updatedBy: updater,
      createdAt: '2024-03-01T00:00:00.000Z',
      updatedAt: '2024-03-02T00:00:00.000Z'
    };

    const task = Task.fromApi(dto);

    expect(task.id).toBe('t3');
    expect(task.projectId).toBe('p3');
    expect(task.description).toBeUndefined();
    expect(task.dueDate).toBeUndefined();
    expect(task.priority).toBeUndefined();
    expect(task.assignee).toBeUndefined();
  });
});
