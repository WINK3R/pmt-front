import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth/authService';
import { Role } from '../models/enum/role';
import { ProjectMembershipDTO } from '../models/dtos/dto';
import {
  Membership,
  PolicyOptions,
  PolicyResult,
  toMembership,
  canChangeRolePolicy,
  canChangeStatusPolicy,
  canRemoveMemberPolicy,
  canInvitePolicy,
  MemberStatus, canEditTaskPolicy,
} from './project-policy';

@Injectable({ providedIn: 'root' })
export class ProjectPolicyService {
  constructor(private auth: AuthService) {}

  private requesterFrom(meRole: Role): Membership {
    const me = this.auth.currentUser!;
    return { userId: me.id, role: meRole };
  }

  private normalize(me: Role | ProjectMembershipDTO): Membership {
    return typeof me === 'object'
      ? toMembership(me as ProjectMembershipDTO)
      : this.requesterFrom(me as Role);
  }

  canChangeRole(
    me: Role | ProjectMembershipDTO,
  ): PolicyResult {
    return canChangeRolePolicy(
      this.normalize(me)
    );
  }

  canChangeStatus(
    me: Role | ProjectMembershipDTO,
    target: ProjectMembershipDTO,
    newStatus: MemberStatus
  ): PolicyResult {
    return canChangeStatusPolicy(
      this.normalize(me),
      toMembership(target),
      newStatus
    );
  }

  canEditTask(
    me: Role | ProjectMembershipDTO,
  ) : PolicyResult {
    return canEditTaskPolicy(this.normalize(me))
  }

  canRemoveMember(
    me: Role | ProjectMembershipDTO,
    target: ProjectMembershipDTO
  ): PolicyResult {
    return canRemoveMemberPolicy(
      this.normalize(me),
      toMembership(target)
    );
  }

  canInvite(me: Role | ProjectMembershipDTO): PolicyResult {
    return canInvitePolicy(this.normalize(me));
  }
}
