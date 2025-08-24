import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCell } from './project-cell';

describe('ProjectCell', () => {
  let component: ProjectCell;
  let fixture: ComponentFixture<ProjectCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
