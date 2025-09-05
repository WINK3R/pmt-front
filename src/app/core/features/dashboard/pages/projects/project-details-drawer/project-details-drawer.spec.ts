import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsDrawer } from './project-details-drawer';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';

describe('ProjectDetailsDrawer', () => {
  let component: ProjectDetailsDrawer;
  let fixture: ComponentFixture<ProjectDetailsDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsDrawer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
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
