import {Component, DestroyRef, inject, signal} from '@angular/core';
import {Drawer} from 'primeng/drawer';
import {SquareIconButton} from '../../../../components/buttons/square-icon-button/square-icon-button';
import {Box, ChevronRight, House, LucideAngularModule, Pen, Plus} from 'lucide-angular';
import {TopBarDashboard} from '../../../../components/layout/top-bar-dashboard/top-bar-dashboard';
import {ALL_TAGS, labelOf, Tag} from '../../../../models/enum/tag';
import {ProjectCell} from '../../../../components/projects/project-cell/project-cell';
import {ProjectRepository} from '../../../../repositories/projectRepository';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Dialog} from 'primeng/dialog';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {PrimeTemplate} from 'primeng/api';
import {ProjectDTO} from '../../../../models/dtos/dto';

@Component({
  selector: 'app-projects',
  imports: [
    SquareIconButton,
    Drawer,
    TopBarDashboard,
    LucideAngularModule,
    ProjectCell,
    Dialog,
    Select,
    FormsModule,
    PrimeTemplate
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects {
  private readonly repo = inject(ProjectRepository);
  private readonly destroyRef = inject(DestroyRef);
  projects = signal<ProjectDTO[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | undefined>(undefined);

  protected readonly House = House;
  detailsProjectSidebar: boolean = false;
  createProjectDialog: boolean = false;
  creating = false;
  selectedProject: ProjectDTO | undefined = undefined;

  projectName = '';
  projectDescription = '';
  selectedTag: Tag | undefined = undefined

  protected readonly ALL_TAGS = ALL_TAGS;
  protected readonly Plus = Plus;
  protected readonly Pen = Pen;
  protected readonly labelOf = labelOf;
  protected readonly Box = Box;
  protected readonly ChevronRight = ChevronRight;

  constructor() {
    this.repo.list()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (list) => { this.projects.set(list); this.loading.set(false); },
        error: (e) => { this.error.set('Chargement impossible'); this.loading.set(false); console.error(e); }
      });
  }

  createProject() {
    const name = this.projectName.trim();
    if (!name) return;

    this.creating = true;

    this.repo.create({
      name,
      description: this.projectDescription?.trim() || undefined,
      tag: this.selectedTag ?? undefined
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.projects.update(arr => [created, ...arr]);
          this.creating = false;
          this.createProjectDialog = false;
          this.resetForm();
        },
        error: (e) => {
          console.error('Failed to create project', e);
          this.creating = false;
        }
      });
  }

  openProjectDetails(project: ProjectDTO) {
    this.selectedProject = project;
    this.detailsProjectSidebar = true;

  }

  private resetForm() {
    this.projectName = '';
    this.projectDescription = '';
    this.selectedTag = undefined;
  }
}
