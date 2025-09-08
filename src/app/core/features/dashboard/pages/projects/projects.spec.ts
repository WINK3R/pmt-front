import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Projects } from './projects';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ProjectRepository } from '../../../../repositories/projectRepository';
import { InvitationRepository } from '../../../../repositories/InvitationRepository';
import { ProjectDTO, InvitationDTO } from '../../../../models/dtos/dto';
import { Tag } from '../../../../models/enum/tag';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;
  let projectRepo: jasmine.SpyObj<ProjectRepository>;
  let invitationRepo: jasmine.SpyObj<InvitationRepository>;

  beforeEach(async () => {
    projectRepo = jasmine.createSpyObj('ProjectRepository', ['list', 'create']);
    invitationRepo = jasmine.createSpyObj('InvitationRepository', ['list']);

    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProjectRepository, useValue: projectRepo },
        { provide: InvitationRepository, useValue: invitationRepo }
      ]
    }).compileComponents();

    projectRepo.list.and.returnValue(of([]));
    invitationRepo.list.and.returnValue(of([]));

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createProject should early return if name empty', () => {
    component.projectName = '   ';
    component.createProject();
    expect(projectRepo.create).not.toHaveBeenCalled();
  });

  it('createProject should handle success', () => {
    const project: ProjectDTO = { id: '1', name: 'p1', description: '', tag: Tag.Development, createdAt: '', endDate: '' } as any;
    component.projectName = 'Proj';
    projectRepo.create.and.returnValue(of(project));

    component.createProject();

    expect(component.creating).toBeFalse();
    expect(component.projects()).toContain(project);
    expect(component.createProjectDialog).toBeFalse();
    expect(component.projectName).toBe('');
  });

  it('createProject should handle error', () => {
    component.projectName = 'Proj';
    projectRepo.create.and.returnValue(throwError(() => new Error('fail')));

    component.createProject();

    expect(component.creating).toBeFalse();
  });

  it('openProjectDetails should set selectedProject and sidebar', () => {
    const proj = { id: '1', name: 'test' } as any;
    component.openProjectDetails(proj);
    expect(component.selectedProject).toBe(proj);
    expect(component.detailsProjectSidebar).toBeTrue();
  });

  it('openInvitationDrawer should set invitationsDrawer', () => {
    component.openInvitationDrawer();
    expect(component.invitationsDrawer).toBeTrue();
  });

  it('resetForm should clear form fields', () => {
    component.projectName = 'X';
    component.projectDescription = 'Y';
    component.selectedTag = Tag.Development;
    (component as any).resetForm();
    expect(component.projectName).toBe('');
    expect(component.projectDescription).toBe('');
    expect(component.selectedTag).toBeUndefined();
  });

  it('loadInvitations should set list on success', () => {
    const invites: InvitationDTO[] = [{ id: 'i1' } as any];
    invitationRepo.list.and.returnValue(of(invites));

    component.loadInvitations();

    expect(component.invitations()).toEqual(invites);
    expect(component.loading()).toBeFalse();
  });

  it('loadInvitations should log error on fail', () => {
    spyOn(console, 'error');
    invitationRepo.list.and.returnValue(throwError(() => new Error('err')));

    component.loadInvitations();

    expect(console.error).toHaveBeenCalled();
  });

  it('fetchProjects should set projects on success', () => {
    const projs: ProjectDTO[] = [{ id: 'p1', name: 'test' } as any];
    projectRepo.list.and.returnValue(of(projs));

    (component as any).fetchProjects();

    expect(component.projects()).toEqual(projs);
    expect(component.loading()).toBeFalse();
  });

  it('fetchProjects should set error on failure', () => {
    spyOn(console, 'error');
    projectRepo.list.and.returnValue(throwError(() => new Error('fail')));

    (component as any).fetchProjects();

    expect(component.error()).toBe('Chargement impossible');
    expect(component.loading()).toBeFalse();
  });

  it('onInvitationsDrawerVisible should refetch projects and invitations', () => {
    spyOn(component as any, 'fetchProjects');
    spyOn(component, 'loadInvitations');
    component.onInvitationsDrawerVisible();
    expect((component as any).fetchProjects).toHaveBeenCalled();
    expect(component.loadInvitations).toHaveBeenCalled();
  });

  it('onProjectChange should be callable', () => {
    component.onProjectChange({ id: '1' } as any);
  });
});
