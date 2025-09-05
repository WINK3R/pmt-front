import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetailsDrawer } from './task-details-drawer';
import { of, throwError } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ProjectRepository } from '../../../../../repositories/projectRepository';
import { TaskRepository } from '../../../../../repositories/TaskRepository';
import { AuthService } from '../../../../../services/auth/authService';
import { ProjectPolicyService } from '../../../../../politicy/projectPolicyService';
import { Task } from '../../../../../models/task';
import { TaskStub } from '../../../../../utils/stubs/taskStub';
import { ProjectMembershipDTO, TaskHistoryDTO } from '../../../../../models/dtos/dto';
import { Role } from '../../../../../models/enum/role';

describe('TaskDetailsDrawer', () => {
  let component: TaskDetailsDrawer;
  let fixture: ComponentFixture<TaskDetailsDrawer>;

  let projectRepoSpy: jasmine.SpyObj<ProjectRepository>;
  let taskRepoSpy: jasmine.SpyObj<TaskRepository>;
  let authServiceStub: any;
  let policyServiceStub: any;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockTask: Task = TaskStub.testTask();
  const mockMember: ProjectMembershipDTO = {
    membershipId: 'm1',
    joinedAt: new Date().toISOString(),
    user: { id: 'u1', username: 'John' },
    role: Role.ADMIN,
  };
  const mockHistory: TaskHistoryDTO[] = [
    {
      id: 'h1',
      taskId: 't1',
      newValue: { text: 'new' },
      oldValue: { text: 'old' },
      field: 'title',
      changedBy: { id: 'u1' },
    },
  ];

  beforeEach(async () => {
    projectRepoSpy = jasmine.createSpyObj('ProjectRepository', ['getProjectMembers']);
    taskRepoSpy = jasmine.createSpyObj('TaskRepository', ['update', 'getTaskHistory', 'delete']);
    authServiceStub = { currentUser: { id: 'u1' } };
    policyServiceStub = { canEditTask: () => ({ allowed: true }) };
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    projectRepoSpy.getProjectMembers.and.returnValue(of([mockMember]));
    taskRepoSpy.getTaskHistory.and.returnValue(of(mockHistory));
    taskRepoSpy.update.and.returnValue(of(mockTask));
    taskRepoSpy.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [TaskDetailsDrawer],
      providers: [
        { provide: ProjectRepository, useValue: projectRepoSpy },
        { provide: TaskRepository, useValue: taskRepoSpy },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ProjectPolicyService, useValue: policyServiceStub },
        { provide: ConfirmationService, useValue: confirmationService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsDrawer);
    component = fixture.componentInstance;

    component.task = mockTask;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnChanges and fetch members/history', () => {
    component.ngOnChanges();
    expect(projectRepoSpy.getProjectMembers).toHaveBeenCalledWith(mockTask.projectId);
    expect(taskRepoSpy.getTaskHistory).toHaveBeenCalledWith(mockTask.id);
    expect(component.editableTask?.id).toBe(mockTask.id);
  });

  it('should set dirty and push to change$', () => {
    spyOn<any>(component['change$'], 'next');
    component.onFieldChange({ title: 'new title' });
    expect(component.dirty()).toBeTrue();
    expect(component['change$'].next).toHaveBeenCalledWith({ title: 'new title' });
  });

  it('should handle handleHide and emit events', async () => {
    spyOn(component.visibleChange, 'emit');
    spyOn(component.closed, 'emit');
    await component.handleHide();
    expect(component.visible).toBeFalse();
    expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    expect(component.closed.emit).toHaveBeenCalled();
  });



  it('should handle confirm reject', () => {
    confirmationService.confirm.and.callFake((options: any) => {
      return options.reject();
    });

    component.confirm();

    expect(taskRepoSpy.delete).not.toHaveBeenCalled();
  });




  it('should handle repoTask.getTaskHistory error in ngOnChanges', () => {
    taskRepoSpy.getTaskHistory.and.returnValue(throwError(() => 'fail'));
    component.ngOnChanges();
    expect(component.loading()).toBeFalse();
  });
});
