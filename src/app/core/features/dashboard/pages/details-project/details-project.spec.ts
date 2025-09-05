import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsProject } from './details-project';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectRepository } from '../../../../repositories/projectRepository';
import { TaskRepository } from '../../../../repositories/TaskRepository';
import { AuthService } from '../../../../services/auth/authService';
import { ProjectPolicyService } from '../../../../politicy/projectPolicyService';
import { Project } from '../../../../models/project';
import { Task } from '../../../../models/task';
import { TaskStatus } from '../../../../models/enum/taskStatus';
import {ProjectMembershipDTO, TaskDTO} from '../../../../models/dtos/dto';
import {TaskStub} from '../../../../utils/stubs/taskStub';
import {UserStub} from '../../../../utils/stubs/userStub';
import {Role} from '../../../../models/enum/role';
import {TaskPriority} from '../../../../models/enum/taskPriority';

describe('DetailsProject', () => {
  let component: DetailsProject;
  let fixture: ComponentFixture<DetailsProject>;

  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: any;
  let projectRepoSpy: jasmine.SpyObj<ProjectRepository>;
  let taskRepoSpy: jasmine.SpyObj<TaskRepository>;
  let authServiceStub: any;
  let policyServiceStub: any;

  const mockProject: Project = new Project(
    'p1',
    'Project test',
    undefined,
    'desc',
    undefined,
    UserStub.testUserSummary(),
    new Date()
  );

  const mockTask: Task = TaskStub.testTask()

  const mockTaskDTO: TaskDTO = TaskStub.testTaskDTO()

  const mockMember: ProjectMembershipDTO = {
    membershipId: 'm1',
    joinedAt: new Date().toISOString(),
    user: { id: 'u1', username: 'John' },
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routeStub = { snapshot: { paramMap: new Map([['id', 'p1']]) } };

    projectRepoSpy = jasmine.createSpyObj('ProjectRepository', ['get', 'getTask', 'getProjectMembers']);
    taskRepoSpy = jasmine.createSpyObj('TaskRepository', ['create', 'updateTaskStatus']);

    authServiceStub = { currentUser: { id: 'u1' } };
    policyServiceStub = { canEditTask: () => ({ allowed: true }) };

    projectRepoSpy.get.and.returnValue(of(mockProject));
    projectRepoSpy.getTask.and.returnValue(of([mockTask]));
    projectRepoSpy.getProjectMembers.and.returnValue(of([mockMember]));
    taskRepoSpy.create.and.returnValue(of(mockTask));
    taskRepoSpy.updateTaskStatus.and.returnValue(of(mockTaskDTO));

    await TestBed.configureTestingModule({
      imports: [DetailsProject],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: ProjectRepository, useValue: projectRepoSpy },
        { provide: TaskRepository, useValue: taskRepoSpy },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ProjectPolicyService, useValue: policyServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.project?.id).toBe('p1');
  });

  it('should navigate home', () => {
    component.goHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should open task dialog', () => {
    component.openTaskDialog(TaskStatus.TODO);
    expect(component.createTaskDialog).toBeTrue();
  });

  it('should create a task successfully', () => {
    component.project = mockProject;
    component.taskTitle = 'New task';
    component.createTask();
    expect(taskRepoSpy.create).toHaveBeenCalled();
  });

  it('should handle createTask error', () => {
    taskRepoSpy.create.and.returnValue(throwError(() => 'fail'));
    component.project = mockProject;
    component.taskTitle = 'fail';
    component.createTask();
    expect(component.creating).toBeFalse();
  });

  it('should reset form', () => {
    component.taskTitle = 'x';
    component.taskDescription = 'y';
    component.resetForm();
    expect(component.taskTitle).toBe('');
    expect(component.taskPriority).toBe(TaskPriority.MEDIUM);
  });

  it('should open details task sidebar', () => {
    component.openDetailsTaskSidebar(mockTask);
    expect(component.detailsTaskSidebar).toBeTrue();
    expect(component.selectedTask).toBe(mockTask);
  });

  it('should apply task to board (same status)', () => {
    component.columns[0].tasks = [mockTask];
    const updated = { ...mockTask, title: 'Updated' };
    component.applyTaskToBoard(updated);
    expect(component.columns[0].tasks[0].title).toBe('Updated');
  });

  it('should apply task to board (move status)', () => {
    component.columns[0].tasks = [mockTask];
    const updated = { ...mockTask, status: TaskStatus.COMPLETED };
    component.applyTaskToBoard(updated);
    expect(component.columns[3].tasks[0].status).toBe(TaskStatus.COMPLETED);
  });

  it('should handle task deleted', () => {
    component.columns[0].tasks = [mockTask];
    component.selectedTask = mockTask;
    component.detailsTaskSidebar = true;
    component.onTaskDeleted(mockTask.id);
    expect(component.columns[0].tasks.length).toBe(0);
    expect(component.detailsTaskSidebar).toBeFalse();
  });

  it('should drop task within same column', () => {
    const tasks = [mockTask];
    const event: any = {
      previousContainer: { data: tasks, id: 'todo' },
      container: { data: tasks, id: 'todo' },
      previousIndex: 0,
      currentIndex: 0,
    };
    component.drop(event);
    expect(event.container.data.length).toBe(1);
  });

  it('should drop task to another column and update status', () => {
    const inProgressTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
    const event: any = {
      previousContainer: { data: [mockTask], id: 'todo' },
      container: { data: [inProgressTask], id: 'inProgress' },
      previousIndex: 0,
      currentIndex: 0,
    };
    component.drop(event);
    expect(taskRepoSpy.updateTaskStatus).toHaveBeenCalled();
  });
});
