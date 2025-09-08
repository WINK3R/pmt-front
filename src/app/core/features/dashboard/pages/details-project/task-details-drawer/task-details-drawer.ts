import {
  Component, computed, DestroyRef, EventEmitter, inject, Input, Output, Signal, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Drawer } from 'primeng/drawer';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import {ConfirmationService, PrimeTemplate} from 'primeng/api';
import {LucideAngularModule, Pen, Trash, X, ArrowRight, Info} from 'lucide-angular';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Task } from '../../../../../models/task';
import { ALL_TAGS, labelOf } from '../../../../../models/enum/tag';
import { ALL_PRIORITY } from '../../../../../models/enum/taskPriority';
import { ProjectRepository } from '../../../../../repositories/projectRepository';
import { TaskRepository } from '../../../../../repositories/TaskRepository';
import {ProjectMembershipDTO, TaskHistoryDTO, UserDTO} from '../../../../../models/dtos/dto';
import { environment } from '../../../../../../../environments/environment';
import {RoundIconButton} from '../../../../../components/buttons/round-icon-button/round-icon-button';
import {AuthService} from '../../../../../services/auth/authService';
import {ProjectPolicyService} from '../../../../../politicy/projectPolicyService';
import {DatePipe} from '@angular/common';
import {getTaskFieldLabel} from '../../../../../utils/TaskFieldLabels';
import {History} from 'lucide-angular/src/icons';
import {Button} from 'primeng/button';
import {Warning} from 'postcss';

@Component({
  selector: 'app-task-details-drawer',
  standalone: true,
  imports: [
    Drawer, FormsModule, LucideAngularModule, PrimeTemplate, ConfirmDialogModule,
    Select, DatePicker, RoundIconButton, DatePipe, Button,
  ],
  providers: [ConfirmationService],
  templateUrl: './task-details-drawer.html',
  styleUrl: './task-details-drawer.css'
})
export class TaskDetailsDrawer {
  @Input() task: Task | undefined;
  @Input() visible = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() taskChange = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();
  members = signal<ProjectMembershipDTO[]>([]);
  historic = signal<TaskHistoryDTO[]>([]);
  loading = signal<boolean>(true);
  dirty = signal(false);


  me: Signal<ProjectMembershipDTO | undefined> = computed(() => {
    const list = this.members() ?? [];
    const meId = this.auth.currentUser!.id;
    return list.find(m => m.user.id === meId);
  });

  constructor(private confirmationService: ConfirmationService) {}

  protected readonly ALL_TAGS = ALL_TAGS;
  protected readonly ALL_PRIORITY = ALL_PRIORITY;

  get memberUsers(): UserDTO[] {
    return this.members().map(m => m.user);
  }
  canEditTask = computed(() => {
    const me = this.me();
    return !!me && this.policyService.canEditTask(me).allowed;
  })
  protected readonly policyService = inject(ProjectPolicyService);

  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private change$ = new Subject<Partial<Task>>();
  private readonly repoProject = inject(ProjectRepository);
  private readonly repoTask = inject(TaskRepository);

  editableTask: Task | undefined;
  private original?: Task; // snapshot to compute delta


  sortedHistoric = computed(() => {
    const list = this.historic() ?? [];
    return [...list].sort((a, b) => {
      const ad = a?.changedAt ? new Date(a.changedAt).getTime() : 0;
      const bd = b?.changedAt ? new Date(b.changedAt).getTime() : 0;
      return bd - ad;
    });
  });

  ngOnInit() {
    this.change$
      .pipe(
        debounceTime(800),
        filter(() => !!this.editableTask?.id),
        switchMap(patch => this.savePatch(patch)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updatedFromServer: Task) => {
          this.original = { ...updatedFromServer };
          this.editableTask = {
            ...updatedFromServer,
            dueDate: updatedFromServer.dueDate
              ? new Date(updatedFromServer.dueDate as any)
              : undefined
          };

          this.dirty.set(false);
          this.taskChange.emit(updatedFromServer);
        },
        error: err => console.error('Autosave failed', err)
      });
  }

  private savePatch(patch: Partial<Task>) {
    if (!this.editableTask?.id) {
      throw new Error('No editableTask to save');
    }
    const id = this.editableTask.id;
    const body = this.normalizePatch(patch);
    return this.repoTask.update(id, body);
  }

  ngOnChanges() {
    if (this.task?.id) {
      this.repoProject.getProjectMembers(this.task.projectId).subscribe({
        next: (list) => { this.members.set(list); this.loading.set(false); },
        error: (err) => console.error('Failed to fetch members', err)
      });
      this.repoTask.getTaskHistory(this.task.id).subscribe({
        next: (list: TaskHistoryDTO[]) => { this.historic.set(list); this.loading.set(false); },
        error: (err: any) => console.error('Failed to fetch task history', err)
      })
    }

    // working copy + original snapshot
    this.editableTask = this.task ? { ...this.task } : undefined;
    this.original = this.task ? { ...this.task } : undefined;

    // parse incoming ISO → Date for the picker
    if (this.editableTask?.dueDate) {
      this.editableTask.dueDate = new Date(this.editableTask.dueDate as any);
    }
    this.dirty.set(false);
  }

  private normalizePatch(patch: Partial<Task>): Partial<Task> {
    let p = { ...patch };
    if ('dueDate' in p && p.dueDate instanceof Date) {
      (p as any).dueDate = (p.dueDate as Date).toISOString();
    }
    if ('assignee' in p && (p as any).assignee) {
      const id = (p as any).assignee?.id ?? null;
      delete (p as any).assignee;
      (p as any).assigneeId = id;
    }

    return p;
  }

  private computeDelta(): Partial<Task> {
    if (!this.original || !this.editableTask) return {};
    const delta: any = {};

    const norm = (v: any) =>
      v instanceof Date ? v.toISOString() :
        (typeof v === 'object' && v?.id) ? v.id :
          v;

    const fields: (keyof Task)[] = ['title','description','priority','label','status','dueDate'];
    for (const f of fields) {
      const cur = (this.editableTask as any)[f];
      const prev = (this.original as any)[f];
      if (norm(cur) !== norm(prev)) {
        delta[f] = cur instanceof Date ? cur.toISOString() : cur;
      }
    }

    // assignee by id
    const curA = (this.editableTask as any).assignee?.id ?? null;
    const prevA = (this.original as any).assignee?.id ?? null;
    if (curA !== prevA) delta.assigneeId = curA;

    return delta;
  }


  private async flushPending() {
    const delta = this.computeDelta();
    if (Object.keys(delta).length === 0) return;
    await new Promise<void>(resolve => {
      this.savePatch(delta).subscribe({
        next: (updated: Task) => {
          this.original = { ...updated };
          this.editableTask = {
            ...updated,
            dueDate: updated.dueDate ? new Date(updated.dueDate as any) : undefined
          };
          this.taskChange.emit(updated);
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  async handleHide() {
    await this.flushPending();
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  setDirty() { this.dirty.set(true); }

  onFieldChange(patch: Partial<Task>) {
    this.setDirty();
    this.change$.next(patch);
  }

  confirm() {
    this.confirmationService.confirm({
      message: 'Do you want to delete this task?',
      header: 'Confirm',
      accept: () => {
        if (this.task) {
          this.repoTask.delete(this.task.id).subscribe({
            next: () => {
              this.taskDeleted.emit(this.task?.id);
            },
            error: () => {
              console.log("error")
            }
          });
        }
      },
      reject: () => {
      },
    });
  }

  // icons & helpers
  protected readonly Pen = Pen;
  protected readonly labelOf = labelOf;
  protected readonly environment = environment;
  protected readonly ArrowRight = ArrowRight;
  protected readonly X = X;
  protected readonly Trash = Trash;
  protected readonly getTaskFieldLabel = getTaskFieldLabel;
  protected readonly History = History;
  protected readonly Info = Info;
  protected readonly Warning = Warning;
  protected readonly Date = Date;
}
