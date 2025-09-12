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
  const updatedProject: ProjectDTO = { id: 'p1', name: 'Updated', description: 'Desc', tag: 'other' } as any;

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
      'updateMemberRole',
      'update'
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
    projectRepoSpy.update.and.returnValue(of(updatedProject));
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

  describe('ngOnChanges', () => {
    it('loads members and invitations when project has id', () => {
      component.ngOnChanges();
      expect(projectRepoSpy.getProjectMembers).toHaveBeenCalledWith('p1');
      expect(projectRepoSpy.getProjectInvitations).toHaveBeenCalledWith('p1');
      expect(component.members().length).toBe(1);
      expect(component.invitations().length).toBe(1);
    });

    it('does nothing when project is undefined (branch)', () => {
      projectRepoSpy.getProjectMembers.calls.reset();
      projectRepoSpy.getProjectInvitations.calls.reset();

      component.project = undefined as any;
      component.ngOnChanges();

      expect(projectRepoSpy.getProjectMembers).not.toHaveBeenCalled();
      expect(projectRepoSpy.getProjectInvitations).not.toHaveBeenCalled();
    });

    it('handles error when getProjectMembers fails (branch)', () => {
      projectRepoSpy.getProjectMembers.and.returnValue(throwError(() => 'fail'));
      spyOn(console, 'error');
      component.ngOnChanges();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch members', 'fail');
    });
  });

  describe('loadInvitations', () => {
    it('handles error when getProjectInvitations fails (branch)', () => {
      projectRepoSpy.getProjectInvitations.and.returnValue(throwError(() => 'fail'));
      spyOn(console, 'error');
      component.loadInvitations();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch members', 'fail');
    });

    it('does nothing when project is undefined (branch)', () => {
      projectRepoSpy.getProjectInvitations.calls.reset();
      component.project = undefined as any;
      component.loadInvitations();
      expect(projectRepoSpy.getProjectInvitations).not.toHaveBeenCalled();
    });
  });

  describe('close/save/hide', () => {
    it('close() delegates to handleHide', () => {
      spyOn(component, 'handleHide');
      component.close();
      expect(component.handleHide).toHaveBeenCalled();
    });

    it('save() calls close()', () => {
      spyOn(component, 'close');
      component.save();
      expect(component.close).toHaveBeenCalled();
    });

    it('handleHide emits events after flushing (branch where delta exists)', fakeAsync(() => {
      (component as any).original = { id: 'p1', name: 'Old', description: 'Old', tag: 'old' };
      component.editableProject = { id: 'p1', name: 'New', description: 'Old', tag: 'old' } as any;

      const flushSpy = spyOn(component as any, 'savePatch').and.returnValue(of(updatedProject));
      const visibleSpy = spyOn(component.visibleChange, 'emit');
      const closedSpy = spyOn(component.closed, 'emit');

      component.visible = true;
      component['handleHide']();
      tick();

      expect(flushSpy).toHaveBeenCalled();
      expect(component.visible).toBeFalse();
      expect(visibleSpy).toHaveBeenCalledWith(false);
      expect(closedSpy).toHaveBeenCalled();
    }));

    it('flushPending early-returns when no delta (branch)', fakeAsync(() => {
      (component as any).original = { id: 'p1', name: 'Same', description: 'Same', tag: 'same' };
      component.editableProject = { id: 'p1', name: 'Same', description: 'Same', tag: 'same' } as any;

      const flushSpy = spyOn(component as any, 'savePatch');
      (component as any).flushPending();
      tick();
      expect(flushSpy).not.toHaveBeenCalled();
    }));
  });

  describe('toggleAddMember', () => {
    it('toggles and focuses input when opening (both branches)', fakeAsync(() => {
      const focusSpy = jasmine.createSpy();
      component.teammateInput = {
        nativeElement: { focus: focusSpy, value: '' }
      } as any;

      component.toggleAddMember();
      tick();
      expect(component.addMemberClicked).toBeTrue();
      expect(focusSpy).toHaveBeenCalled();

      component.toggleAddMember();
      expect(component.addMemberClicked).toBeFalse();
    }));
  });

  describe('inviteMember', () => {
    it('invites member if input has value', () => {
      component.teammateInput = {
        nativeElement: { value: 'test@test.com', focus: () => {} }
      } as any;
      spyOn(component, 'loadInvitations');
      component.project = mockProject;

      component.inviteMember();
      expect(invitationRepoSpy.create).toHaveBeenCalledWith('p1', 'test@test.com');
      expect(component.loadInvitations).toHaveBeenCalled();
    });

    it('does nothing if no project or input empty (branch)', () => {
      component.teammateInput = {
        nativeElement: { value: '' }
      } as any;
      component.project = undefined;
      component.inviteMember();
      expect(invitationRepoSpy.create).not.toHaveBeenCalled();
    });
  });

  describe('onRoleChange', () => {
    it('updates role and refreshes members', () => {
      component.project = mockProject;
      component.onRoleChange([mockMember, Role.MEMBER]);
      expect(projectRepoSpy.updateMemberRole).toHaveBeenCalledWith('p1', 'm1', Role.MEMBER);
      expect(projectRepoSpy.getProjectMembers).toHaveBeenCalled();
    });

    it('early-returns when no project id (branch)', () => {
      component.project = undefined as any;
      component.onRoleChange([mockMember, Role.MEMBER]);
      expect(projectRepoSpy.updateMemberRole).not.toHaveBeenCalled();
    });

    it('handles error on updateMemberRole (branch)', () => {
      projectRepoSpy.updateMemberRole.and.returnValue(throwError(() => 'fail'));
      spyOn(console, 'error');
      component.project = mockProject;
      component.onRoleChange([mockMember, Role.MEMBER]);
      expect(console.error).toHaveBeenCalledWith('Failed to change role', 'fail');
    });
  });

  describe('computed signals', () => {
    it('me() returns current user membership (branch where found)', () => {
      component.members.set([mockMember]);
      const me = component.me();
      expect(me?.user.id).toBe('u1');
    });

    it('canInvite/canChangeRole false when me undefined (branch)', () => {
      component.members.set([]);
      expect(component.canInvite()).toBeFalse();
      expect(component.canChangeRole()).toBeFalse();
    });

    it('canInvite/canChangeRole true when allowed (branch)', () => {
      component.members.set([mockMember]);
      expect(component.canInvite()).toBeTrue();
      expect(component.canChangeRole()).toBeTrue();
    });
  });

  describe('autosave (ngOnInit + change$)', () => {
    it('debounces and saves patch successfully (success branch)', fakeAsync(() => {
      const emitSpy = spyOn(component.projectChange, 'emit');
      component.ngOnInit();
      component.editableProject = { id: 'p1', name: 'A', description: '', tag: 'x' } as any;

      component.onFieldChange({ name: 'B' });
      // debounceTime(800)
      tick(810);

      expect(projectRepoSpy.update).toHaveBeenCalledWith('p1', { name: 'B' });
      expect(emitSpy).toHaveBeenCalledWith(updatedProject);
      expect(component.dirty()).toBeFalse();
    }));

    it('logs error when autosave fails (error branch)', fakeAsync(() => {
      projectRepoSpy.update.and.returnValue(throwError(() => 'autosave-fail'));
      spyOn(console, 'error');
      component.ngOnInit();
      component.editableProject = { id: 'p1', name: 'A', description: '', tag: 'x' } as any;

      component.onFieldChange({ name: 'C' });
      tick(810);

      expect(console.error).toHaveBeenCalledWith('Autosave failed', 'autosave-fail');
    }));
  });

  describe('computeDelta & savePatch', () => {
    it('computeDelta returns {} when original or editable missing (branch)', () => {
      (component as any).original = undefined;
      component.editableProject = undefined;
      const delta = (component as any).computeDelta();
      expect(delta).toEqual({});
    });

    it('computeDelta normalizes values and detects changes (branches over fields)', () => {
      const prev = {
        id: 'p1',
        name: 'N1',
        description: 'D1',
        tag: 't1'
      };
      const next = {
        id: 'p1',
        name: 'N2',                 // changed
        description: 'D1',          // same
        tag: 't1'                   // same
      };
      (component as any).original = prev;
      component.editableProject = next as any;

      const delta = (component as any).computeDelta();
      expect(delta).toEqual({ name: 'N2' });
    });

    it('savePatch throws when no editableProject id (branch)', () => {
      component.editableProject = undefined as any;
      expect(() => (component as any).savePatch({ name: 'X' })).toThrowError('No editableProject to save');
    });

    it('savePatch delegates to repository.update when id present (branch)', () => {
      component.editableProject = { id: 'p1', name: 'X', description: '', tag: 't' } as any;
      (component as any).savePatch({ name: 'Y' }).subscribe((result: any) => {
        expect(result).toEqual(updatedProject);
      });
      expect(projectRepoSpy.update).toHaveBeenCalledWith('p1', { name: 'Y' });
    });
  });

  describe('setDirty/onFieldChange', () => {
    it('marks dirty and pushes to change$ (branch)', () => {
      const dirtyBefore = component.dirty();
      component.onFieldChange({ name: 'Z' });
      expect(dirtyBefore).toBeFalse();
      expect(component.dirty()).toBeTrue();
    });
  });
});
