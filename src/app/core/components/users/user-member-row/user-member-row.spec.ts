import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMemberRow } from './user-member-row';
import {ProjectMembershipStub} from '../../../utils/stubs/projectMembershipStub';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
