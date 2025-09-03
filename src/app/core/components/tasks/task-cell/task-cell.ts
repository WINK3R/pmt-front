import {Component, Input} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {TagPill} from "../../pills/tag-pill/tag-pill";
import {Task} from '../../../models/task';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import {environment} from '../../../../../environments/environment';
import {Tooltip} from 'primeng/tooltip';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-task-cell',
  imports: [
    LucideAngularModule,
    TagPill,
    DatePipe,
    Tooltip,
    TooltipModule,
    NgOptimizedImage
  ],
  templateUrl: './task-cell.html',
  styleUrl: './task-cell.css'
})
export class TaskCell {
  @Input({ required: true })  task!: Task;
  protected readonly environment = environment;

  getAssigneeProfileImage() : string | undefined {
    return this.task.assignee?.profileImageUrl
  }

  getAssigneeUsername() : string | undefined {
    return this.task.assignee?.username
  }
}
