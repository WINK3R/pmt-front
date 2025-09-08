import {ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {TaskDetailsDrawer} from './task-details-drawer';
import {of, throwError} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {ProjectRepository} from '../../../../../repositories/projectRepository';
import {TaskRepository} from '../../../../../repositories/TaskRepository';
import {AuthService} from '../../../../../services/auth/authService';
import {ProjectPolicyService} from '../../../../../politicy/projectPolicyService';
import {Task} from '../../../../../models/task';
import {TaskStub} from '../../../../../utils/stubs/taskStub';
import {ProjectMembershipDTO, TaskHistoryDTO} from '../../../../../models/dtos/dto';
import {Role} from '../../../../../models/enum/role';

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
    taskRepoSpy.update.and.callFake((id: string, body: any) => of({ ...mockTask, ...body, id }));
    taskRepoSpy.delete.and.callFake((id: string) => of(void 0));

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

  it('should autosave patch via change$ in ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    spyOn(component.taskChange, 'emit');

    component.editableTask = { ...mockTask };

    component.onFieldChange({ title: 'patched' });

    tick(800);

    expect(taskRepoSpy.update)
      .toHaveBeenCalledWith(mockTask.id, jasmine.objectContaining({ title: 'patched' }));

    expect(component.taskChange.emit)
      .toHaveBeenCalledWith(jasmine.objectContaining({ id: mockTask.id, title: 'patched' }));

    expect(component.dirty()).toBeFalse();
  }));



  it('should handle repoTask.getTaskHistory error in ngOnChanges', () => {
    taskRepoSpy.getTaskHistory.and.returnValue(throwError(() => 'fail'));
    component.ngOnChanges();
    expect(component.loading()).toBeFalse();
  });

  it('should resolve immediately when no delta', async () => {
    spyOn<any>(component, 'computeDelta').and.returnValue({});
    const saveSpy = spyOn<any>(component, 'savePatch');

    await (component as any).flushPending();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should save and update task when delta exists', async () => {
    const delta = { title: 'changed' };
    spyOn<any>(component, 'computeDelta').and.returnValue(delta);
    spyOn<any>(component, 'savePatch').and.returnValue(of(mockTask));
    spyOn(component.taskChange, 'emit');

    await (component as any).flushPending();

    expect(component.taskChange.emit).toHaveBeenCalledWith(mockTask);
    expect(component.editableTask?.id).toBe(mockTask.id);
    expect(component['original']?.id).toBe(mockTask.id);
  });

  it('should resolve even if savePatch errors', async () => {
    const delta = { title: 'fail' };
    spyOn<any>(component, 'computeDelta').and.returnValue(delta);
    spyOn<any>(component, 'savePatch').and.returnValue(throwError(() => new Error('fail')));
    spyOn(component.taskChange, 'emit');

    await (component as any).flushPending();

    expect(component.taskChange.emit).not.toHaveBeenCalled();
  });


  it('should do nothing when rejected', () => {
    confirmationService.confirm.and.callFake((options: any) => options.reject());

    spyOn(component.taskDeleted, 'emit');

    component.task = mockTask;
    component.confirm();

    expect(taskRepoSpy.delete).not.toHaveBeenCalled();
    expect(component.taskDeleted.emit).not.toHaveBeenCalled();
  });

  it('should do nothing if no task is set', () => {
    confirmationService.confirm.and.callFake((options: any) => options.accept());

    spyOn(component.taskDeleted, 'emit');

    component.task = undefined;
    component.confirm();

    expect(taskRepoSpy.delete).not.toHaveBeenCalled();
    expect(component.taskDeleted.emit).not.toHaveBeenCalled();
  });

  it('should catch error if delete fails', fakeAsync(() => {
    taskRepoSpy.delete.and.returnValue(throwError(() => new Error('fail')));
    confirmationService.confirm.and.callFake((options: any) => options.accept());

    spyOn(component.taskDeleted, 'emit');
    component.task = mockTask;

    component.confirm();

    flushMicrotasks();

    expect(component.taskDeleted.emit).not.toHaveBeenCalled();
  }));





  it('should normalize patch with dueDate and assignee', () => {
    component.task = {
      ...mockTask,
      projectId: 'proj-1',
      createdBy: {id: 'u1'},
      createdAt: new Date().toISOString(),
    } as any;
    component.ngOnChanges();

    const patch = {
      dueDate: new Date('2025-01-01T00:00:00Z'),
      assignee: { id: 'bob' },
    } as any;

    const normalized = (component as any).buildFullUpdateBody(patch);

    expect(normalized.dueDate).toContain('2025-01-01');
    expect(normalized.assigneeId).toBe('bob');
    expect((normalized as any).assignee).toBeUndefined();
    expect(normalized.projectId).toBe('proj-1');
    expect(normalized.createdById).toBe('u1');
  });


  it('should compute delta when nothing changed', () => {
    component.task = mockTask;
    component.ngOnChanges();
    const delta = (component as any).computeDelta();
    expect(delta).toEqual({});
  });

  it('should compute delta with changes (title + assignee)', () => {
    component.task = mockTask;
    component.ngOnChanges();

    component.editableTask!.title = 'changed';
    (component.editableTask as any).assignee = { id: 'new' };

    const delta = (component as any).computeDelta();
    expect(delta.title).toBe('changed');
    expect(delta.assigneeId).toBe('new');
  });

  it('should flushPending do nothing when delta empty', async () => {
    spyOn(component as any, 'computeDelta').and.returnValue({});
    const result = await (component as any).flushPending();
    expect(result).toBeUndefined();
    expect(taskRepoSpy.update).not.toHaveBeenCalled();
  });

  it('should canEditTask return true when allowed', () => {
    component.task = mockTask;
    component.ngOnChanges();
    expect(component.canEditTask()).toBeTrue();
  });

  it('should compute memberUsers correctly', () => {
    component.members.set([mockMember]);
    const users = component.memberUsers;
    expect(users.length).toBe(1);
    expect(users[0].username).toBe('John');
  });

  it('should set dirty flag', () => {
    component.dirty.set(false);
    component.setDirty();
    expect(component.dirty()).toBeTrue();
  });
});
