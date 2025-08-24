import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ALL_STATUS, TaskStatus} from '../../../../../models/enum/taskStatus';
import {Task} from '../../../../../models/task';
import {ALL_TAGS, labelOf} from '../../../../../models/enum/tag';
import {ALL_PRIORITY} from '../../../../../models/enum/taskPriority';
import {Drawer} from 'primeng/drawer';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule, Pen} from 'lucide-angular';
import {PrimeTemplate} from 'primeng/api';
import {Select} from 'primeng/select';

@Component({
  selector: 'app-task-details-drawer',
  imports: [
    Drawer,
    FormsModule,
    LucideAngularModule,
    PrimeTemplate,
    Select
  ],
  templateUrl: './task-details-drawer.html',
  styleUrl: './task-details-drawer.css'
})
export class TaskDetailsDrawer {
  @Input() task: Task | undefined;
  @Input() visible = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() taskChange = new EventEmitter<Task>();
  @Output() closed = new EventEmitter<void>();

  protected readonly ALL_TAGS = ALL_TAGS;
  protected readonly ALL_STATUS = ALL_STATUS;
  protected readonly ALL_PRIORITY = ALL_PRIORITY;
  localStatus: TaskStatus | undefined;
  editableTask: Task | undefined;

  ngOnChanges() {
    this.editableTask = this.task ? { ...this.task } : undefined;
  }

  handleHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  close() {
    this.handleHide();
  }

  save() {
    if (this.task && this.localStatus && this.localStatus !== this.task.status) {
      this.taskChange.emit(this.task);
    }
    this.close();
  }

  protected readonly Pen = Pen;
  protected readonly labelOf = labelOf;
}
