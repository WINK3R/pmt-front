import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../services/apiService';
import { Task } from '../models/task';
import { CreateTaskRequest } from '../models/dtos/dto';
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

  create(input: CreateTaskRequest): Observable<Task> {
    return this.api.tasks.create(input)
      .pipe(map(Task.fromApi));
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    this.api.tasks.update(taskId, { status: newStatus }).subscribe({
      next: (res) => console.log('Task updated', res),
      error: (err) => console.error('Failed to update task', err)
    });
  }
}
