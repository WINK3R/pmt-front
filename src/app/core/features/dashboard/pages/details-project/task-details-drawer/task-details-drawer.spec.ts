import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsDrawer } from './task-details-drawer';

describe('TaskDetailsDrawer', () => {
  let component: TaskDetailsDrawer;
  let fixture: ComponentFixture<TaskDetailsDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
