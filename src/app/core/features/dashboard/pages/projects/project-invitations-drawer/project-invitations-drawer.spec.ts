import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectInvitationsDrawer } from './project-invitations-drawer';
import { InvitationRepository } from '../../../../../repositories/InvitationRepository';
import {InvitationDTO, ProjectMembershipDTO} from '../../../../../models/dtos/dto';
import {Role} from '../../../../../models/enum/role';

describe('ProjectInvitationsDrawer', () => {
  let component: ProjectInvitationsDrawer;
  let fixture: ComponentFixture<ProjectInvitationsDrawer>;
  let repoSpy: jasmine.SpyObj<InvitationRepository>;

  const mockInvitations: InvitationDTO[] = [
    { id: 'i1', email: 'a@test.com', status: 'PENDING' } as any,
    { id: 'i2', email: 'b@test.com', status: 'PENDING' } as any,
  ];

  const mockMembership: ProjectMembershipDTO = {
    membershipId: 'm1',
    joinedAt: new Date().toISOString(),
    user: { id: 'u1', username: 'John' } as any,
    role: Role.ADMIN,
  };


  beforeEach(async () => {
    repoSpy = jasmine.createSpyObj('InvitationRepository', ['list', 'accept', 'reject']);

    await TestBed.configureTestingModule({
      imports: [ProjectInvitationsDrawer],
      providers: [{ provide: InvitationRepository, useValue: repoSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectInvitationsDrawer);
    component = fixture.componentInstance;

    repoSpy.list.and.returnValue(of(mockInvitations));
    repoSpy.accept.and.returnValue(of(mockMembership));
    repoSpy.reject.and.returnValue(of(mockMembership));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges should call loadInvitation', () => {
    const spy = spyOn(component, 'loadInvitation');
    component.ngOnChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('handleHide should update visible and emit events', () => {
    spyOn(component.visibleChange, 'emit');
    spyOn(component.closed, 'emit');

    component.visible = true;
    component.handleHide();

    expect(component.visible).toBeFalse();
    expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('loadInvitation should set invitations and loading=false on success', () => {
    component.loadInvitation();
    expect(repoSpy.list).toHaveBeenCalled();
    expect(component.invitations()).toEqual(mockInvitations);
    expect(component.loading()).toBeFalse();
  });

  it('loadInvitation should log error on failure', () => {
    const consoleSpy = spyOn(console, 'error');
    repoSpy.list.and.returnValue(throwError(() => new Error('fail')));
    component.loadInvitation();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch members', jasmine.any(Error));
  });

  it('acceptInvitation should call repo, emit and reload', () => {
    spyOn(component.refreshProjectList, 'emit');
    spyOn(component, 'loadInvitation');

    const invitation = mockInvitations[0];
    component.acceptInvitation(invitation);

    expect(repoSpy.accept).toHaveBeenCalledWith(invitation.id);
    expect(component.refreshProjectList.emit).toHaveBeenCalled();
    expect(component.loadInvitation).toHaveBeenCalled();
  });

  it('acceptInvitation should log error on failure', () => {
    const consoleSpy = spyOn(console, 'error');
    repoSpy.accept.and.returnValue(throwError(() => new Error('fail')));

    component.acceptInvitation(mockInvitations[0]);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to accept invitation', jasmine.any(Error));
  });

  it('rejectInvitation should call repo, emit and reload', () => {
    spyOn(component.refreshProjectList, 'emit');
    spyOn(component, 'loadInvitation');

    const invitation = mockInvitations[1];
    component.rejectInvitation(invitation);

    expect(repoSpy.reject).toHaveBeenCalledWith(invitation.id);
    expect(component.refreshProjectList.emit).toHaveBeenCalled();
    expect(component.loadInvitation).toHaveBeenCalled();
  });

  it('rejectInvitation should log error on failure', () => {
    const consoleSpy = spyOn(console, 'error');
    repoSpy.reject.and.returnValue(throwError(() => new Error('fail')));

    component.rejectInvitation(mockInvitations[1]);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to reject invitation', jasmine.any(Error));
  });
});
