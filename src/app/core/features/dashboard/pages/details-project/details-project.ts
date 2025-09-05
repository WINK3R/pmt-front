import {Component, computed, DestroyRef, inject, Signal, signal} from '@angular/core';
import {SquareIconButton} from '../../../../components/buttons/square-icon-button/square-icon-button';
import {TopBarDashboard} from '../../../../components/layout/top-bar-dashboard/top-bar-dashboard';
import {Box, ChevronRight, House, LucideAngularModule, Pen, Plus} from 'lucide-angular';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectRepository} from '../../../../repositories/projectRepository';
import {Project} from '../../../../models/project';
import {TaskCell} from '../../../../components/tasks/task-cell/task-cell';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem,} from '@angular/cdk/drag-drop';
import {Task} from '../../../../models/task';
import {ALL_PRIORITY, TaskPriority} from '../../../../models/enum/taskPriority';
import {ALL_STATUS, labelOfStatus, TaskStatus} from '../../../../models/enum/taskStatus';
import {NgClass} from '@angular/common';
import {Dialog} from 'primeng/dialog';
import {PrimeTemplate} from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {ALL_TAGS, labelOf} from '../../../../models/enum/tag';
import {AuthService} from '../../../../services/auth/authService';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TaskRepository} from '../../../../repositories/TaskRepository';
import {TaskDetailsDrawer} from './task-details-drawer/task-details-drawer';
import {DatePicker} from 'primeng/datepicker';
import {ProjectMembershipDTO} from '../../../../models/dtos/dto';
import {ProjectPolicyService} from '../../../../politicy/projectPolicyService';

@Component({
  selector: 'app-details-project',
  imports: [
    SquareIconButton,
    TopBarDashboard,
    LucideAngularModule,
    TaskCell,
    CdkDropList,
    CdkDrag,
    NgClass,
    Dialog,
    DatePicker,
    PrimeTemplate,
    ReactiveFormsModule,
    Select,
    FormsModule,
    TaskDetailsDrawer
  ],
  templateUrl: './details-project.html',
  styleUrl: './details-project.css'
})
export class DetailsProject {
  private route = inject(ActivatedRoute);
  private readonly repoProject = inject(ProjectRepository);
  private readonly repoTask = inject(TaskRepository);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly policyService = inject(ProjectPolicyService);

  detailsTaskSidebar: boolean = false;
  project: Project | undefined = undefined;
  createTaskDialog: boolean = false;
  taskPriority: TaskPriority | undefined = undefined;
  taskStatus: TaskStatus = TaskStatus.TODO;
  selectedTask: Task | undefined = undefined;
  taskTitle: string = '';
  taskDescription: string = '';
  taskTag: string = '';
  taskDueDate: Date | undefined;
  loading = signal<boolean>(true);
  error = signal<string | undefined>(undefined);
  tasks = signal<Task[]>([]);
  members = signal<ProjectMembershipDTO[]>([]);
  me: Signal<ProjectMembershipDTO | undefined> = computed(() => {
    const list = this.members() ?? [];
    const meId = this.auth.currentUser!.id;
    return list.find(m => m.user.id === meId);
  });

  creating = false;

  protected readonly Box = Box;
  protected readonly House = House;
  protected readonly ChevronRight = ChevronRight;
  private readonly destroyRef = inject(DestroyRef);

  canCreateTask = computed(() => {
    const me = this.me();
    return !!me && this.policyService.canEditTask(me).allowed;
  })

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
  dropListIds = ['todo', 'inProgress', 'canceled', 'completed'];

  columns: { id: string; status: TaskStatus; color: string; name: string; tasks: Task[] }[] = [
    { id: 'todo', status: TaskStatus.TODO, color: 'text-dark-text', name: 'To Do', tasks: [] },
    { id: 'inProgress', status: TaskStatus.IN_PROGRESS, color: 'text-orange-400', name: 'In Progress', tasks: [] },
    { id: 'canceled', status: TaskStatus.CANCELED, color: 'text-red-400', name: 'Canceled', tasks: [] },
    { id: 'completed', status: TaskStatus.COMPLETED, color: 'text-blue-400', name: 'Completed', tasks: [] },
  ];

  drop(event: CdkDragDrop<Task[] | any[], any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const movedTask = event.container.data[event.currentIndex] as Task;
      const newStatus = this.columns.find(c => c.id === event.container.id)?.status;

      if (movedTask && newStatus && movedTask.status !== newStatus) {
        this.repoTask.updateTaskStatus(movedTask.id, newStatus)
      }
    }
  }


  protected readonly Plus = Plus;
  protected readonly ALL_TAGS = ALL_TAGS;
  protected readonly ALL_STATUS = ALL_STATUS;
  protected readonly ALL_PRIORITY = ALL_PRIORITY;
  protected readonly labelOf = labelOf;
  protected readonly Pen = Pen;

  openTaskDialog(taskStatus: TaskStatus) {
    this.taskStatus = taskStatus;
    this.createTaskDialog = true;

  }

  protected readonly labelOfStatus = labelOfStatus;

  createTask() {
    if (!this.project || !this.auth.currentUser) return;

    this.creating = true;

    this.repoTask.create({
      title: this.taskTitle.trim(),
      description: this.taskDescription?.trim(),
      label: this.taskTag,
      dueDate: this.taskDueDate?.toISOString(),
      priority: this.taskPriority ?? TaskPriority.MEDIUM,
      status: this.taskStatus,
      projectId: this.project.id,
      assigneeId: undefined,
      createdById: this.auth.currentUser.id,
      updatedById: this.auth.currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdTask) => {
          const col = this.columns.find(c => c.status === this.taskStatus);
          if (col) col.tasks.push(createdTask);

          this.creating = false;
          this.createTaskDialog = false;
          this.resetForm();
        },
        error: (e) => {
          console.error('Failed to create task', e);
          this.creating = false;
        }
      });
  }

  resetForm() {
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskTag = '';
    this.taskPriority = TaskPriority.MEDIUM;
    this.taskStatus = TaskStatus.TODO;
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.repoProject.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (project) => {
          this.project = project;

          this.repoProject.getTask(project.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (tasks) => {
                this.tasks.set(tasks);
                this.loading.set(false);

                this.columns.forEach(col => {
                  col.tasks = tasks.filter(t => t.status === col.status);
                });
              },
              error: (e) => {
                this.error.set('Impossible de charger les tâches');
                this.loading.set(false);
                console.error(e);
              }
            });

          this.repoProject.getProjectMembers(project.id).subscribe({
            next: (list) => { this.members.set(list); this.loading.set(false); },
            error: (err) => console.error('Failed to fetch members', err)
          });
        },
        error: (err) => {
          this.error.set('Projet introuvable');
          this.loading.set(false);
          console.error(err);
        }
      });
  }

  openDetailsTaskSidebar(task: Task) {
    this.selectedTask = task;
    this.detailsTaskSidebar = true;
  }

  applyTaskToBoard(updated: Task) {
    // update the selected reference
    if (this.selectedTask?.id === updated.id) {
      this.selectedTask = updated;
    }

    // also replace/move in your columns
    const fromIdx = this.columns.findIndex(c => c.tasks.some(t => t.id === updated.id));
    if (fromIdx === -1) return;

    const fromCol = this.columns[fromIdx];
    const taskIdx = fromCol.tasks.findIndex(t => t.id === updated.id);
    const old = fromCol.tasks[taskIdx];

    if (old.status === updated.status) {
      const tasks = [...fromCol.tasks];
      tasks[taskIdx] = { ...old, ...updated };
      this.columns = this.columns.map((c, i) =>
        i === fromIdx ? { ...c, tasks } : c
      );
    } else {
      const fromTasks = [...fromCol.tasks];
      fromTasks.splice(taskIdx, 1);
      const toIdx = this.columns.findIndex(c => c.status === updated.status);
      if (toIdx === -1) return;
      const toTasks = [updated, ...this.columns[toIdx].tasks];
      this.columns = this.columns.map((c, i) =>
        i === fromIdx ? { ...c, tasks: fromTasks } :
          i === toIdx   ? { ...c, tasks: toTasks } : c
      );
    }
  }

  onTaskDeleted(deletedId: string) {
    this.columns = this.columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== deletedId)
    }));

    if (this.selectedTask?.id === deletedId) {
      this.selectedTask = undefined;
      this.detailsTaskSidebar = false;
    }
  }

}
