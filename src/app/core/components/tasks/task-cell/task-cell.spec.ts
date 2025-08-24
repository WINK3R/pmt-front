import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCell } from './task-cell';

describe('TaskCell', () => {
  let component: TaskCell;
  let fixture: ComponentFixture<TaskCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
