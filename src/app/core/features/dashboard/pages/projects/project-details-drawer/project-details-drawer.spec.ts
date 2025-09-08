import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProjectDetailsDrawer } from './project-details-drawer';
import { ProjectRepository } from '../../../../../repositories/projectRepository';
import { InvitationRepository } from '../../../../../repositories/InvitationRepository';
import { AuthService } from '../../../../../services/auth/authService';
import { ProjectPolicyService } from '../../../../../politicy/projectPolicyService';
import { of, throwError } from 'rxjs';
import { Role } from '../../../../../models/enum/role';
import { ProjectDTO, ProjectMembershipDTO, InvitationDTO } from '../../../../../models/dtos/dto';

describe('ProjectDetailsDrawer', () => {
  let component: ProjectDetailsDrawer;
  let fixture: ComponentFixture<ProjectDetailsDrawer>;
  let projectRepoSpy: jasmine.SpyObj<ProjectRepository>;
  let invitationRepoSpy: jasmine.SpyObj<InvitationRepository>;
  let authServiceStub: any;
  let policyServiceStub: any;

  const mockProject: ProjectDTO = { id: 'p1', name: 'Test Project', description: '', tag: 'test' } as any;
  const mockMember: ProjectMembershipDTO = {
    membershipId: 'm1',
    role: Role.ADMIN,
    joinedAt: new Date().toISOString(),
    user: { id: 'u1', username: 'John' }
  };
  const mockInvitation: InvitationDTO = {
    id: 'i1',
    email: 'test@test.com',
    status: 'PENDING',
    invitedAt: new Date().toISOString()
  } as any;

  beforeEach(async () => {
    projectRepoSpy = jasmine.createSpyObj('ProjectRepository', [
      'getProjectMembers',
      'getProjectInvitations',
      'updateMemberRole'
    ]);
    invitationRepoSpy = jasmine.createSpyObj('InvitationRepository', ['create']);
    authServiceStub = { currentUser: { id: 'u1' } };
    policyServiceStub = {
      canInvite: () => ({ allowed: true }),
      canChangeRole: () => ({ allowed: true })
    };

    projectRepoSpy.getProjectMembers.and.returnValue(of([mockMember]));
    projectRepoSpy.getProjectInvitations.and.returnValue(of([mockInvitation]));
    projectRepoSpy.updateMemberRole.and.returnValue(of(void 0));
    invitationRepoSpy.create.and.returnValue(of(mockInvitation));

    await TestBed.configureTestingModule({
      imports: [ProjectDetailsDrawer],
      providers: [
        { provide: ProjectRepository, useValue: projectRepoSpy },
        { provide: InvitationRepository, useValue: invitationRepoSpy },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ProjectPolicyService, useValue: policyServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsDrawer);
    component = fixture.componentInstance;
    component.project = mockProject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load members and invitations on ngOnChanges', () => {
    component.ngOnChanges();
    expect(projectRepoSpy.getProjectMembers).toHaveBeenCalledWith('p1');
    expect(projectRepoSpy.getProjectInvitations).toHaveBeenCalledWith('p1');
    expect(component.members().length).toBe(1);
    expect(component.invitations().length).toBe(1);
  });

  it('should handle error when getProjectMembers fails', () => {
    projectRepoSpy.getProjectMembers.and.returnValue(throwError(() => 'fail'));
    spyOn(console, 'error');
    component.ngOnChanges();
    expect(console.error).toHaveBeenCalledWith('Failed to fetch members', 'fail');
  });

  it('should handle error when getProjectInvitations fails', () => {
    projectRepoSpy.getProjectInvitations.and.returnValue(throwError(() => 'fail'));
    spyOn(console, 'error');
    component.loadInvitations();
    expect(console.error).toHaveBeenCalledWith('Failed to fetch members', 'fail');
  });

  it('should hide and emit events on handleHide', () => {
    spyOn(component.visibleChange, 'emit');
    spyOn(component.closed, 'emit');
    component.visible = true;
    component.handleHide();
    expect(component.visible).toBeFalse();
    expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should close() call handleHide', () => {
    spyOn(component, 'handleHide');
    component.close();
    expect(component.handleHide).toHaveBeenCalled();
  });

  it('should save() call close', () => {
    spyOn(component, 'close');
    component.save();
    expect(component.close).toHaveBeenCalled();
  });

  it('should toggleAddMember and focus input when true', fakeAsync(() => {
    const focusSpy = jasmine.createSpy();
    component.teammateInput = {
      nativeElement: { focus: focusSpy, value: '' }
    } as any;

    component.toggleAddMember();
    tick(); // simulate async
    expect(component.addMemberClicked).toBeTrue();
    expect(focusSpy).toHaveBeenCalled();

    component.toggleAddMember();
    expect(component.addMemberClicked).toBeFalse();
  }));

  it('should invite member if input has value', () => {
    component.teammateInput = {
      nativeElement: { value: 'test@test.com', focus: () => {} }
    } as any;
    spyOn(component, 'loadInvitations');
    component.project = mockProject;

    component.inviteMember();
    expect(invitationRepoSpy.create).toHaveBeenCalledWith('p1', 'test@test.com');
    expect(component.loadInvitations).toHaveBeenCalled();
  });

  it('should not invite member if no project or input empty', () => {
    component.teammateInput = {
      nativeElement: { value: '' }
    } as any;
    component.project = undefined;
    component.inviteMember();
    expect(invitationRepoSpy.create).not.toHaveBeenCalled();
  });

  it('should update role and refresh members on onRoleChange', () => {
    component.project = mockProject;
    component.onRoleChange([mockMember, Role.MEMBER]);
    expect(projectRepoSpy.updateMemberRole).toHaveBeenCalledWith('p1', 'm1', Role.MEMBER);
    expect(projectRepoSpy.getProjectMembers).toHaveBeenCalled();
  });

  it('should handle error on updateMemberRole', () => {
    projectRepoSpy.updateMemberRole.and.returnValue(throwError(() => 'fail'));
    spyOn(console, 'error');
    component.project = mockProject;
    component.onRoleChange([mockMember, Role.MEMBER]);
    expect(console.error).toHaveBeenCalledWith('Failed to change role', 'fail');
  });

  it('should compute me correctly', () => {
    component.members.set([mockMember]);
    const me = component.me();
    expect(me?.user.id).toBe('u1');
  });

  it('should compute canInvite and canChangeRole', () => {
    component.members.set([mockMember]);
    expect(component.canInvite()).toBeTrue();
    expect(component.canChangeRole()).toBeTrue();
  });
});
