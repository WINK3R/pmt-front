import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectInvitationsDrawer } from './project-invitations-drawer';

describe('ProjectInvitationsDrawer', () => {
  let component: ProjectInvitationsDrawer;
  let fixture: ComponentFixture<ProjectInvitationsDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInvitationsDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectInvitationsDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
