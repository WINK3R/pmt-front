import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCell } from './task-cell';
import {TaskStub} from '../../../utils/stubs/taskStub';

describe('TaskCell', () => {
  let component: TaskCell;
  let fixture: ComponentFixture<TaskCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCell],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCell);
    component = fixture.componentInstance;

    component.task = TaskStub.testTask();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
