import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../services/apiService';
import { Project } from '../models/project';
import { Tag } from '../models/enum/tag';
import {InvitationCreationDTO, InvitationDTO, ProjectDTO, ProjectMembershipDTO, UserDTO} from '../models/dtos/dto';
import {Task} from '../models/task';

@Injectable({ providedIn: 'root' })
export class InvitationRepository {
  constructor(private api: ApiService) {}

  create(projectId: string, emailInvited: string): Observable<InvitationDTO> {
    const payload: InvitationCreationDTO = {
      projectId: projectId,
      emailInvited: emailInvited,
    };

    return this.api.projects.invitations.create(payload)
  }

  list(): Observable<InvitationDTO[]> {
    return this.api.invitations.list()
  }

  accept(invitationId: string) : Observable<ProjectMembershipDTO>{
    return this.api.invitations.accept(invitationId)
  }

  reject(invitationId: string) : Observable<ProjectMembershipDTO>{
    return this.api.invitations.reject(invitationId)
  }
}
