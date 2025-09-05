import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../services/apiService';
import { Task } from '../models/task';
import {CreateTaskRequest, TaskDTO} from '../models/dtos/dto';
import {TaskStatus} from '../models/enum/taskStatus';

@Injectable({ providedIn: 'root' })
export class TaskRepository {
  constructor(private api: ApiService) {}

  list(projectId: string): Observable<Task[]> {
    return this.api.projects.tasks.list(projectId)
  }

  get(id: string): Observable<Task> {
    return this.api.tasks.get(id)
      .pipe(map(Task.fromApi));
  }

  update(id:string, task: Partial<Task>){
    const payload: Partial<TaskDTO> = {
      ...task,
      dueDate: task.dueDate?.toString(),
      createdAt: task.createdBy?.toString(),
      updatedAt: task.updatedAt?.toString()
    };
    return this.api.tasks.update(id, payload)
      .pipe(map(Task.fromApi));
  }

  create(input: CreateTaskRequest): Observable<Task> {
    return this.api.tasks.create(input)
      .pipe(map(Task.fromApi));
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    return this.api.tasks.update(taskId, { status: newStatus })
  }

  getTaskHistory(taskId: string) {
    return this.api.tasks.history(taskId)
  }

  delete(taskId: string) {
    return this.api.tasks.delete(taskId)
  }
}
