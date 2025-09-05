import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCell } from './project-cell';
import {ProjectStub} from '../../../utils/stubs/projectStub';
import {LucideAngularModule} from 'lucide-angular';
import {Router} from '@angular/router';

describe('ProjectCell', () => {
  let component: ProjectCell;
  let fixture: ComponentFixture<ProjectCell>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProjectCell, LucideAngularModule],
      providers: [{ provide: Router, useValue: routerSpy }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectCell);
    component = fixture.componentInstance;

    component.project = ProjectStub.testProject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit infoClicked when onInfoClick is called', () => {
    spyOn(component.infoClicked, 'emit');
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    component.onInfoClick(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.infoClicked.emit).toHaveBeenCalledWith(ProjectStub.testProject());
  });

  it('should navigate to project details when openProjectDetails is called', () => {
    const project = ProjectStub.testProject();
    component.openProjectDetails(project);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/projects', project.id]);
  });
});
