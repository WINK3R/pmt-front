import {
  Component,
  computed, DestroyRef,
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
import {debounceTime, filter, Subject, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  private original?: ProjectDTO;
  members = signal<ProjectMembershipDTO[]>([]);
  invitations = signal<InvitationDTO[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | undefined>(undefined);
  dirty = signal(false);

  addMemberClicked = false;
  private readonly repoProject = inject(ProjectRepository);
  private readonly repoInvitation = inject(InvitationRepository);
  protected readonly policyService = inject(ProjectPolicyService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private change$ = new Subject<Partial<ProjectDTO>>();
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

  async handleHide() {
    this.visible = false;
    await this.flushPending();
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

  private computeDelta(): Partial<ProjectDTO> {
    if (!this.original || !this.editableProject) return {};
    const delta: any = {};

    const norm = (v: any) =>
      v instanceof Date ? v.toISOString() :
        (typeof v === 'object' && v?.id) ? v.id :
          v;

    const fields: (keyof ProjectDTO)[] = ['name','description','tag'];
    for (const f of fields) {
      const cur = (this.editableProject as any)[f];
      const prev = (this.original as any)[f];
      if (norm(cur) !== norm(prev)) {
        delta[f] = cur instanceof Date ? cur.toISOString() : cur;
      }
    }
    return delta;
  }


  private async flushPending() {
    const delta = this.computeDelta();
    if (Object.keys(delta).length === 0) return;
    await new Promise<void>(resolve => {
      this.savePatch(delta).subscribe({
        next: (updated: ProjectDTO) => {
          this.original = { ...updated };
          this.editableProject = {
            ...updated
          };
          this.projectChange.emit(updated);
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  ngOnInit() {
    this.change$
      .pipe(
        debounceTime(800),
        filter(() => !!this.editableProject?.id),
        switchMap(patch => this.savePatch(patch)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updatedFromServer: ProjectDTO) => {
          this.original = { ...updatedFromServer };
          this.editableProject = {
            ...updatedFromServer
          };

          this.dirty.set(false);
          this.projectChange.emit(updatedFromServer);
        },
        error: err => console.error('Autosave failed', err)
      });
  }

  private savePatch(patch: Partial<ProjectDTO>) {
    if (!this.editableProject?.id) {
      throw new Error('No editableProject to save');
    }
    const id = this.editableProject.id;
    return this.repoProject.update(id, patch);
  }

  setDirty() { this.dirty.set(true); }

  onFieldChange(patch: Partial<ProjectDTO>) {
    this.setDirty();
    this.change$.next(patch);
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
