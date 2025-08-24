import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Info, LucideAngularModule, Ticket, TicketCheck} from "lucide-angular";
import {TagPill} from "../../pills/tag-pill/tag-pill";
import {Tag} from '../../../models/enum/tag';
import {Project} from '../../../models/project';
import {SquareIconButton} from '../../buttons/square-icon-button/square-icon-button';
import {Router} from '@angular/router';

@Component({
  selector: 'app-project-cell',
  imports: [
    LucideAngularModule,
    TagPill,
    SquareIconButton
  ],
  templateUrl: './project-cell.html',
  styleUrl: './project-cell.css'
})
export class ProjectCell {
  @Input({ required: true }) project!: Project;
  @Input() doneCount = 0;
  @Input() openCount = 0;

  @Output() infoClicked = new EventEmitter<Project>();

  private readonly router = inject(Router);

  protected readonly Ticket = Ticket;
  protected readonly Tag = Tag;
  protected readonly TicketCheck = TicketCheck;
  protected readonly Info = Info;

  onInfoClick(event: MouseEvent) {
    event.stopPropagation();
    this.infoClicked.emit(this.project);
  }

  openProjectDetails(project: Project) {
    this.router.navigate(['/dashboard/projects', project.id]);
  }
}
