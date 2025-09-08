import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from './apiService';
import { environment } from '../../../environments/environment';
import {
  UserDTO,
  ProjectDTO,
  TaskDTO,
  TaskHistoryDTO,
  ProjectMembershipDTO,
  InvitationDTO,
  InvitationCreationDTO,
  CreateTaskRequest
} from '../models/dtos/dto';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list users', () => {
    const mockUsers: UserDTO[] = [{ id: 'u1', username: 'John' } as any];

    service.users.list().subscribe(res => {
      expect(res).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${baseUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should get a user', () => {
    const mockUser: UserDTO = { id: 'u1', username: 'John' } as any;

    service.users.get('u1').subscribe(res => {
      expect(res).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/users/u1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const input = { username: 'John' };
    const mockUser: UserDTO = { id: 'u1', username: 'John' } as any;

    service.users.create(input).subscribe(res => {
      expect(res).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush(mockUser);
  });

  it('should get a project', () => {
    const mockProject: ProjectDTO = { id: 'p1', name: 'Test' } as any;

    service.projects.get('p1').subscribe(res => {
      expect(res).toEqual(mockProject);
    });

    const req = httpMock.expectOne(`${baseUrl}/projects/p1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);
  });

  it('should list project members', () => {
    const members: ProjectMembershipDTO[] = [{ membershipId: 'm1', user: { id: 'u1' } as any } as any];

    service.projects.members.list('p1').subscribe(res => {
      expect(res).toEqual(members);
    });

    const req = httpMock.expectOne(`${baseUrl}/projects/p1/members`);
    expect(req.request.method).toBe('GET');
    req.flush(members);
  });

  it('should add project member', () => {
    const body = { userId: 'u2', role: 'MEMBER' };
    const member: ProjectMembershipDTO = { membershipId: 'm2', user: { id: 'u2' } as any } as any;

    service.projects.members.add('p1', body).subscribe(res => {
      expect(res).toEqual(member);
    });

    const req = httpMock.expectOne(`${baseUrl}/projects/p1/members`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(member);
  });


  it('should update project member role', () => {
    service.projects.members.updateRole('p1', 'm1', 'ADMIN').subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/projects/p1/members/m1/role`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ role: 'ADMIN' });
    req.flush(null);
  });

  it('should create an invitation', () => {
    const dto: InvitationCreationDTO = { projectId: 'p1', emailInvited: 'test@test.com' };
    const mockInvitation: InvitationDTO = { id: 'i1', email: 'test@test.com', status: 'PENDING' } as any;

    service.projects.invitations.create(dto).subscribe(res => {
      expect(res).toEqual(mockInvitation);
    });

    const req = httpMock.expectOne(`${baseUrl}/invitations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockInvitation);
  });

  it('should get task history', () => {
    const history: TaskHistoryDTO[] = [{ id: 'h1', taskId: 't1' } as any];

    service.tasks.history('t1').subscribe(res => {
      expect(res).toEqual(history);
    });

    const req = httpMock.expectOne(`${baseUrl}/tasks/t1/history`);
    expect(req.request.method).toBe('GET');
    req.flush(history);
  });

  it('should create a task', () => {
    const dto: CreateTaskRequest = { title: 'test', projectId: 'p1' } as any;
    const mockTask: TaskDTO = { id: 't1', title: 'test' } as any;

    service.tasks.create(dto).subscribe(res => {
      expect(res).toEqual(mockTask);
    });

    const req = httpMock.expectOne(`${baseUrl}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockTask);
  });

  it('should update a task', () => {
    const body = { title: 'updated' };
    const mockTask: TaskDTO = { id: 't1', title: 'updated' } as any;

    service.tasks.update('t1', body).subscribe(res => {
      expect(res).toEqual(mockTask);
    });

    const req = httpMock.expectOne(`${baseUrl}/tasks/t1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush(mockTask);
  });

  it('should delete a task', () => {
    service.tasks.delete('t1').subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/tasks/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });


  it('should accept invitation', () => {
    const membership: ProjectMembershipDTO = { membershipId: 'm1', user: { id: 'u1' } as any } as any;

    service.invitations.accept('i1').subscribe(res => {
      expect(res).toEqual(membership);
    });

    const req = httpMock.expectOne(`${baseUrl}/invitations/i1/accept`);
    expect(req.request.method).toBe('POST');
    req.flush(membership);
  });

  it('should reject invitation', () => {
    const membership: ProjectMembershipDTO = { membershipId: 'm1', user: { id: 'u1' } as any } as any;

    service.invitations.reject('i1').subscribe(res => {
      expect(res).toEqual(membership);
    });

    const req = httpMock.expectOne(`${baseUrl}/invitations/i1/reject`);
    expect(req.request.method).toBe('POST');
    req.flush(membership);
  });
});
