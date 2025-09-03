import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../services/apiService';
import { Project } from '../models/project';
import { Tag } from '../models/enum/tag';
import {InvitationDTO, ProjectDTO, ProjectMembershipDTO, UserDTO} from '../models/dtos/dto';
import {Task} from '../models/task';
import {Role} from '../models/enum/role';

@Injectable({ providedIn: 'root' })
export class ProjectRepository {
  constructor(private api: ApiService) {}

  list(): Observable<ProjectDTO[]> {
    return this.api.projects.list()
  }

  create(input: { name: string; description?: string | undefined; tag?: Tag }): Observable<ProjectDTO> {
    const payload: Partial<ProjectDTO> = {
      name: input.name,
      description: input.description ?? undefined,
      tag: input.tag ?? undefined,
    };

    return this.api.projects.create(payload)
  }

  get(id: string): Observable<Project> {
    return this.api.projects.get(id).pipe(map(Project.fromApi));
  }

  getTask(projectId: string): Observable<Task[]> {
    return this.api.projects.tasks.list(projectId)
  }

  getProjectMembers(projectId: string): Observable<ProjectMembershipDTO[]> {
    return this.api.projects.members.list(projectId)
  }

  getProjectInvitations(projectId: string): Observable<InvitationDTO[]> {
    return this.api.projects.invitations.byProject(projectId)
  }
  updateMemberRole(projectId: string, membershipId: string, role: Role) {
    return this.api.projects.members.updateRole(projectId, membershipId, role)
  }

}
