import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserDTO, ProjectDTO, TaskDTO, TaskHistoryDTO, ProjectMembershipDTO,
  NotificationDTO, InvitationDTO, CreateTaskRequest
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
    },
  };


  tasks = {
    get: (id: string): Observable<Task> =>
      this.http.get<Task>(this.url(`/tasks/${id}`)),

    create: (body: CreateTaskRequest): Observable<TaskDTO> =>
      this.http.post<TaskDTO>(this.url('/tasks'), body),

    byProject: (projectId: string): Observable<Task[]> =>
      this.http.get<Task[]>(this.url(`/tasks/by-project/${projectId}`)),

    byProjectStatus: (projectId: string, status: string): Observable<TaskDTO[]> =>
      this.http.get<TaskDTO[]>(this.url(`/tasks/by-project-status/${projectId}/${status}`)),

    byAssignee: (assigneeId: string): Observable<TaskDTO[]> =>
      this.http.get<TaskDTO[]>(this.url(`/tasks/by-assignee/${assigneeId}`)),

    history: (taskId: string): Observable<TaskHistoryDTO[]> =>
      this.http.get<TaskHistoryDTO[]>(this.url(`/tasks/${taskId}/history`)),
  };


  taskHistory = {
    list: (): Observable<TaskHistoryDTO[]> => this.http.get<TaskHistoryDTO[]>(this.url('/task-history')),
    create: (body: Partial<TaskHistoryDTO>): Observable<TaskHistoryDTO> =>
      this.http.post<TaskHistoryDTO>(this.url('/task-history'), body),
    get: (id: string): Observable<TaskHistoryDTO> =>
      this.http.get<TaskHistoryDTO>(this.url(`/task-history/${id}`)),
    byTask: (taskId: string): Observable<TaskHistoryDTO[]> =>
      this.http.get<TaskHistoryDTO[]>(this.url(`/task-history/by-task/${taskId}`)),
    byTaskOrdered: (taskId: string): Observable<TaskHistoryDTO[]> =>
      this.http.get<TaskHistoryDTO[]>(this.url(`/task-history/by-task-ordered/${taskId}`)),
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
    create: (body: Partial<InvitationDTO>): Observable<InvitationDTO> =>
      this.http.post<InvitationDTO>(this.url('/invitations'), body),
    get: (id: string): Observable<InvitationDTO> =>
      this.http.get<InvitationDTO>(this.url(`/invitations/${id}`)),
    byToken: (token: string): Observable<InvitationDTO> =>
      this.http.get<InvitationDTO>(this.url(`/invitations/by-token/${token}`)),
  };

}
