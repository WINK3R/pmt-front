import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMemberRow } from './user-member-row';
import { ProjectMembershipStub } from '../../../utils/stubs/projectMembershipStub';
import { Role } from '../../../models/enum/role';

describe('UserMemberRow', () => {
  let component: UserMemberRow;
  let fixture: ComponentFixture<UserMemberRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMemberRow]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMemberRow);
    component = fixture.componentInstance;

    component.member = ProjectMembershipStub.testUserMembership();
    component.requester = component.member;
    component.canManageRole = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedRole on init', () => {
    expect(component.selectedRole).toBe(component.member.role);
  });

  it('should emit roleChange when choose is called with a new role', () => {
    spyOn(component.roleChange, 'emit');
    const newRole: Role = Role.ADMIN;

    component.choose(newRole);

    expect(component.roleChange.emit).toHaveBeenCalledWith([component.member, newRole]);
  });

  it('should not emit roleChange when choose is called with the same role', () => {
    spyOn(component.roleChange, 'emit');
    const sameRole = component.member.role;

    component.choose(sameRole);

    expect(component.roleChange.emit).not.toHaveBeenCalled();
  });

  it('should accept canManageRole input', () => {
    component.canManageRole = false;
    fixture.detectChanges();

    expect(component.canManageRole).toBeFalse();
  });
});
