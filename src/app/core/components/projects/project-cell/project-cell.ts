import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Info, LucideAngularModule, Ticket, TicketCheck} from "lucide-angular";
import {TagPill} from "../../pills/tag-pill/tag-pill";
import {SquareIconButton} from '../../buttons/square-icon-button/square-icon-button';
import {Router} from '@angular/router';
import {ProjectDTO} from '../../../models/dtos/dto';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-project-cell',
  imports: [
    LucideAngularModule,
    TagPill,
    SquareIconButton,
    Tooltip
  ],
  templateUrl: './project-cell.html',
  styleUrl: './project-cell.css'
})
export class ProjectCell {
  @Input({ required: true }) project!: ProjectDTO;

  @Output() infoClicked = new EventEmitter<ProjectDTO>();

  private readonly router = inject(Router);

  protected readonly Ticket = Ticket;
  protected readonly TicketCheck = TicketCheck;
  protected readonly Info = Info;

  onInfoClick(event: MouseEvent) {
    event.stopPropagation();
    this.infoClicked.emit(this.project);
  }

  openProjectDetails(project: ProjectDTO) {
    this.router.navigate(['/dashboard/projects', project.id]);
  }
}
