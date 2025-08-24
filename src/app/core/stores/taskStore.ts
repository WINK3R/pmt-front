import {Injectable, signal} from '@angular/core';
import {Task} from '../models/task';

@Injectable()
export class TaskStore {
  selectedTask = signal<Task | undefined>(undefined);
  drawerOpen = signal(false);
}
