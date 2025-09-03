import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {InvitationDTO} from '../../../../../models/dtos/dto';
import {Drawer} from 'primeng/drawer';
import {Crown, Hourglass, LucideAngularModule, Pen, Plus, UserPlus, Users, X, Check} from 'lucide-angular';
import {ReactiveFormsModule} from '@angular/forms';
import {ALL_TAGS, labelOf} from '../../../../../models/enum/tag';
import {labelOfInvitation} from '../../../../../models/enum/invitationStatus';
import {environment} from '../../../../../../../environments/environment';
import {InvitationRepository} from '../../../../../repositories/InvitationRepository';

@Component({
  selector: 'app-project-invitations-drawer',
  imports: [
    Drawer,
    LucideAngularModule,
    ReactiveFormsModule,
  ],
  templateUrl: './project-invitations-drawer.html',
  styleUrl: './project-invitations-drawer.css'
})
export class ProjectInvitationsDrawer {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() refreshProjectList = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  private readonly repoInvitation = inject(InvitationRepository);
  invitations = signal<InvitationDTO[]>([]);
  loading = signal<boolean>(true);

  handleHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  ngOnChanges() {
    this.loadInvitation()
  }

  acceptInvitation(invitation: InvitationDTO) {
    this.repoInvitation.accept(invitation.id).subscribe({
      next: (invitation) => {
        this.refreshProjectList.emit();
        this.loadInvitation();
      },
      error: (err) => console.error('Failed to accept invitation', err)
    });
  }

  rejectInvitation(invitation: InvitationDTO) {
    this.repoInvitation.reject(invitation.id).subscribe({
      next: (invitation) => {
        this.refreshProjectList.emit();
        this.loadInvitation();
      },
      error: (err) => console.error('Failed to reject invitation', err)
    });
  }

  loadInvitation() {
    this.repoInvitation.list().subscribe({
      next: (list) => { this.invitations.set(list); this.loading.set(false); },
      error: (err) => console.error('Failed to fetch members', err)
    });
  }

  protected readonly ALL_TAGS = ALL_TAGS;
  protected readonly Hourglass = Hourglass;
  protected readonly labelOf = labelOf;
  protected readonly Users = Users;
  protected readonly X = X;
  protected readonly Pen = Pen;
  protected readonly Crown = Crown;
  protected readonly labelOfInvitation = labelOfInvitation;
  protected readonly UserPlus = UserPlus;
  protected readonly Plus = Plus;
  protected readonly environment = environment;
  protected readonly Check = Check;
}
