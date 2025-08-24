import {Component, Input} from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {TagPill} from "../../pills/tag-pill/tag-pill";
import {Task} from '../../../models/task';
import {DatePipe} from '@angular/common';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-task-cell',
  imports: [
    LucideAngularModule,
    TagPill,
    DatePipe
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
}
