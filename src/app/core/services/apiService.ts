import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserDTO, ProjectDTO, TaskDTO, TaskHistoryDTO, ProjectMembershipDTO,
  NotificationDTO, InvitationDTO, CreateTaskRequest, InvitationCreationDTO
} from '../models/dtos/dto';
import {Task} from '../models/task';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;


  private url(path: string): string {
    return `${this.base}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private buildParams(params?: Record<string, any>): HttpParams | undefined {
    if (!params) return undefined;
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) hp = hp.set(k, String(v));
    });
    return hp;
  }


  users = {
    list: (): Observable<UserDTO[]> => this.http.get<UserDTO[]>(this.url('/users')),
    get: (id: string): Observable<UserDTO> => this.http.get<UserDTO>(this.url(`/users/${id}`)),
    create: (body: Partial<UserDTO>): Observable<UserDTO> =>
      this.http.post<UserDTO>(this.url('/users'), body),
  };


  projects = {
    list: (): Observable<ProjectDTO[]> => this.http.get<ProjectDTO[]>(this.url('/projects')),
    get: (id: string): Observable<ProjectDTO> => this.http.get<ProjectDTO>(this.url(`/projects/${id}`)),
    create: (body: Partial<ProjectDTO>): Observable<ProjectDTO> =>
      this.http.post<ProjectDTO>(this.url('/projects'), body),

    tasks: {
      list: (projectId: string): Observable<Task[]> => this.http.get<Task[]>(this.url(`/projects/${projectId}/tasks`)),
    },

    members: {
      list: (projectId: string): Observable<ProjectMembershipDTO[]> =>
        this.http.get<ProjectMembershipDTO[]>(this.url(`/projects/${projectId}/members`)),

      add: (projectId: string, body: { userId: string; role: string }): Observable<ProjectMembershipDTO> =>
        this.http.post<ProjectMembershipDTO>(this.url(`/projects/${projectId}/members`), body),

      byRole: (projectId: string, role: string): Observable<ProjectMembershipDTO[]> =>
        this.http.get<ProjectMembershipDTO[]>(this.url(`/projects/${projectId}/members/by-role/${role}`)),

      remove: (projectId: string, membershipId: string): Observable<void> =>
        this.http.delete<void>(this.url(`/projects/${projectId}/members/${membershipId}`)),

      updateRole: (projectId: string, membershipId: string, role: string): Observable<void> =>
        this.http.put<void>(this.url(`/projects/${projectId}/members/${membershipId}/role`), { role }),
    },

    invitations: {
      byProject: (projectId: string): Observable<InvitationDTO[]> =>
        this.http.get<InvitationDTO[]>(this.url(`/projects/${projectId}/invitations`)),

      createForProject: (projectId: string, emailInvited: string): Observable<InvitationDTO> =>
        this.http.post<InvitationDTO>(this.url(`/projects/${projectId}/invitations`), { emailInvited }),

      create: (body: InvitationCreationDTO): Observable<InvitationDTO> =>
        this.http.post<InvitationDTO>(this.url('/invitations'), body),

      list: (): Observable<InvitationDTO[]> =>
        this.http.get<InvitationDTO[]>(this.url('/invitations')),
    }
  };


  tasks = {
    get: (id: string): Observable<Task> =>
      this.http.get<Task>(this.url(`/tasks/${id}`)),

    create: (body: CreateTaskRequest): Observable<TaskDTO> =>
      this.http.post<TaskDTO>(this.url('/tasks'), body),

    update: (id: string, body: Partial<TaskDTO>): Observable<TaskDTO> =>
      this.http.patch<TaskDTO>(this.url(`/tasks/${id}`), body),

    byProject: (projectId: string): Observable<Task[]> =>
      this.http.get<Task[]>(this.url(`/tasks/by-project/${projectId}`)),

    byProjectStatus: (projectId: string, status: string): Observable<TaskDTO[]> =>
      this.http.get<TaskDTO[]>(this.url(`/tasks/by-project-status/${projectId}/${status}`)),

    byAssignee: (assigneeId: string): Observable<TaskDTO[]> =>
      this.http.get<TaskDTO[]>(this.url(`/tasks/by-assignee/${assigneeId}`)),

    history: (taskId: string): Observable<TaskHistoryDTO[]> =>
      this.http.get<TaskHistoryDTO[]>(this.url(`/tasks/${taskId}/history`)),
  };

  notifications = {
    list: (): Observable<NotificationDTO[]> =>
      this.http.get<NotificationDTO[]>(this.url('/notifications')),
    create: (body: Partial<NotificationDTO>): Observable<NotificationDTO> =>
      this.http.post<NotificationDTO>(this.url('/notifications'), body),
    get: (id: string): Observable<NotificationDTO> =>
      this.http.get<NotificationDTO>(this.url(`/notifications/${id}`)),
    byUser: (userId: string): Observable<NotificationDTO[]> =>
      this.http.get<NotificationDTO[]>(this.url(`/notifications/by-user/${userId}`)),
    byTask: (taskId: string): Observable<NotificationDTO[]> =>
      this.http.get<NotificationDTO[]>(this.url(`/notifications/by-task/${taskId}`)),
    byStatus: (status: string): Observable<NotificationDTO[]> =>
      this.http.get<NotificationDTO[]>(this.url(`/notifications/by-status/${status}`)),
    markSent: (id: string): Observable<NotificationDTO> =>
      this.http.patch<NotificationDTO>(this.url(`/notifications/${id}/mark-sent`), {}),
  };

  invitations = {
    list: (): Observable<InvitationDTO[]> =>
      this.http.get<InvitationDTO[]>(this.url('/invitations')),

    accept: (invitationId: string): Observable<ProjectMembershipDTO> =>
      this.http.post<ProjectMembershipDTO>(this.url(`/invitations/${invitationId}/accept`), {}),

    reject: (invitationId: string): Observable<ProjectMembershipDTO> =>
      this.http.post<ProjectMembershipDTO>(this.url(`/invitations/${invitationId}/reject`), {}),
  }
}
