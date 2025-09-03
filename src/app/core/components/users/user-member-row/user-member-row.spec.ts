import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMemberRow } from './user-member-row';

describe('UserMemberRow', () => {
  let component: UserMemberRow;
  let fixture: ComponentFixture<UserMemberRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMemberRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMemberRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
