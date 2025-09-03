import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  Signal,
  signal,
  ViewChild
} from '@angular/core';
import {Drawer} from 'primeng/drawer';
import {InvitationDTO, ProjectDTO, ProjectMembershipDTO} from '../../../../../models/dtos/dto';
import {
  ArrowRight,
  Crown,
  LucideAngularModule,
  Pen,
  PersonStanding,
  Plus,
  Users,
  X,
  UserPlus,
  Hourglass
} from 'lucide-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PrimeTemplate} from 'primeng/api';
import {Select} from 'primeng/select';
import {ALL_TAGS, labelOf} from '../../../../../models/enum/tag';
import {ProjectRepository} from '../../../../../repositories/projectRepository';
import {environment} from '../../../../../../../environments/environment';
import {AuthService} from '../../../../../services/auth/authService';
import {InvitationRepository} from '../../../../../repositories/InvitationRepository';
import {labelOfInvitation} from '../../../../../models/enum/invitationStatus';
import {Role} from '../../../../../models/enum/role';
import {UserMemberRow} from '../../../../../components/users/user-member-row/user-member-row';
import {ProjectPolicyService} from '../../../../../politicy/projectPolicyService';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-project-details-drawer',
  imports: [
    Drawer,
    LucideAngularModule,
    ReactiveFormsModule,
    FormsModule,
    PrimeTemplate,
    Select,
    UserMemberRow,
    Tooltip,
  ],
  templateUrl: './project-details-drawer.html',
  styleUrl: './project-details-drawer.css'
})
export class ProjectDetailsDrawer {
  @Input() project: ProjectDTO | undefined;
  @Input() visible = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() projectChange = new EventEmitter<ProjectDTO>();
  @Output() closed = new EventEmitter<void>();
  editableProject: ProjectDTO | undefined;
  members = signal<ProjectMembershipDTO[]>([]);
  invitations = signal<InvitationDTO[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | undefined>(undefined);
  addMemberClicked = false;
  private readonly repoProject = inject(ProjectRepository);
  private readonly repoInvitation = inject(InvitationRepository);
  protected readonly policyService = inject(ProjectPolicyService);
  private readonly auth = inject(AuthService);
  @ViewChild('teammateInput') teammateInput!: ElementRef<HTMLInputElement>;

  me: Signal<ProjectMembershipDTO | undefined> = computed(() => {
    const list = this.members() ?? [];
    const meId = this.auth.currentUser!.id;
    return list.find(m => m.user.id === meId);
  });

  canInvite = computed(() => {
    const me = this.me();
    return !!me && this.policyService.canInvite(me).allowed;
  });

  canChangeRole = computed(() => {
    const me = this.me();
    return !!me && this.policyService.canChangeRole(me).allowed;
  })

  ngOnChanges() {

    this.editableProject = this.project ? { ...this.project } : undefined;

    if (this.project?.id) {
      this.repoProject.getProjectMembers(this.project.id).subscribe({
        next: (list) => { this.members.set(list); this.loading.set(false); },
        error: (err) => console.error('Failed to fetch members', err)
      });
      this.loadInvitations()
    }
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
    this.close();
  }

  toggleAddMember() {
    this.addMemberClicked = !this.addMemberClicked;
    if (this.addMemberClicked) {
      // wait for the class/size change to render, then focus
      setTimeout(() => this.teammateInput?.nativeElement.focus(), 0);
    }
  }

  inviteMember() {
    if (this.project?.id && this.teammateInput.nativeElement.value) {
      this.repoInvitation.create(this.project.id, this.teammateInput.nativeElement.value).subscribe({
        next: () => { this.loadInvitations() }
      })
    }
  }

  loadInvitations() {
    if (this.project?.id) {
      this.repoProject.getProjectInvitations(this.project.id).subscribe({
        next: (list) => { this.invitations.set(list); this.loading.set(false); },
        error: (err) => console.error('Failed to fetch members', err)
      });
    }
  }

  onRoleChange([member, newRole]: [ProjectMembershipDTO, Role]) {
    if (!this.project?.id) return;

    this.repoProject
      .updateMemberRole(this.project.id, member.membershipId, newRole)
      .subscribe({
        next: () => {
          this.repoProject.getProjectMembers(this.project!.id!).subscribe({
            next: (list) => this.members.set(list),
            error: (err) => console.error('Failed to refresh members', err)
          });
        },
        error: (err) => console.error('Failed to change role', err)
      });
  }



  protected readonly Pen = Pen;
  protected readonly labelOf = labelOf;
  protected readonly ALL_TAGS = ALL_TAGS;
  protected readonly PersonStanding = PersonStanding;
  protected readonly Users = Users;
  protected readonly environment = environment;
  protected readonly Crown = Crown;
  protected readonly Plus = Plus;
  protected readonly X = X;
  protected readonly ArrowRight = ArrowRight;
  protected readonly UserPlus = UserPlus;
  protected readonly Hourglass = Hourglass;
  protected readonly labelOfInvitation = labelOfInvitation;
  protected readonly Role = Role;
}
