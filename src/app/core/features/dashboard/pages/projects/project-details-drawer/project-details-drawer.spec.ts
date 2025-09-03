import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsDrawer } from './project-details-drawer';

describe('ProjectDetailsDrawer', () => {
  let component: ProjectDetailsDrawer;
  let fixture: ComponentFixture<ProjectDetailsDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
