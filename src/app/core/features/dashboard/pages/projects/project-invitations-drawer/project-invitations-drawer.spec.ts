import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectInvitationsDrawer } from './project-invitations-drawer';
import { provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';

describe('ProjectInvitationsDrawer', () => {
  let component: ProjectInvitationsDrawer;
  let fixture: ComponentFixture<ProjectInvitationsDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInvitationsDrawer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
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
