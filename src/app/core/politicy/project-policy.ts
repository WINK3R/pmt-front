import { Role } from '../models/enum/role';
import { ProjectMembershipDTO } from '../models/dtos/dto';

export type MemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

const ROLE_RANK: Record<Role, number> = {
  [Role.OWNER]: 4,
  [Role.ADMIN]: 3,
  [Role.MEMBER]: 2,
  [Role.OBSERVER]: 1,
};

export interface Membership {
  userId: string;
  role: Role;
  status?: MemberStatus;
}

export const toMembership = (m: ProjectMembershipDTO): Membership => ({
  userId: m.user.id,
  role: m.role,
});

const rank = (r: Role) => ROLE_RANK[r];

export interface PolicyOptions {
  allowOwnerTransfer?: boolean;
  allowSelfDemote?: boolean;
  adminCanManageAdmins?: boolean;
}

const defaults: Required<PolicyOptions> = {
  allowOwnerTransfer: false,
  allowSelfDemote: false,
  adminCanManageAdmins: false,
};

const cannot = (reason: string): PolicyResult => ({ allowed: false, reason });
const ok = (): PolicyResult => ({ allowed: true });

export function canChangeRolePolicy(
  requester: Membership,
): PolicyResult {

  if (requester.role !== Role.OWNER && requester.role !== Role.ADMIN) {
    return cannot('Only the owner or an admin can change roles.');
  }

  return ok();
}

export function canChangeStatusPolicy(
  requester: Membership,
  target: Membership,
  newStatus: MemberStatus
): PolicyResult {
  if (target.role === Role.OWNER) return cannot('The owner’s status can’t be changed.');
  if (requester.userId === target.userId) return cannot('You can’t change your own status.');
  if (rank(requester.role) <= rank(target.role)) {
    return cannot('You can only change status for members ranked below you.');
  }
  // Example rule: don’t force INVITED → ACTIVE
  if ((target.status ?? 'ACTIVE') === 'INVITED' && newStatus === 'ACTIVE') {
    return cannot('Invitations are accepted by the user, not forced.');
  }
  return ok();
}

export function canRemoveMemberPolicy(
  requester: Membership,
  target: Membership
): PolicyResult {
  if (target.role === Role.OWNER) return cannot('The owner can’t be removed.');
  if (requester.userId === target.userId) return cannot('Use “Leave project” instead.');
  if (rank(requester.role) <= rank(target.role)) {
    return cannot('You can only remove members ranked below you.');
  }
  return ok();
}

export function canInvitePolicy(
  requester: Membership
): PolicyResult {
  return rank(requester.role) >= rank(Role.ADMIN)
    ? ok()
    : cannot('Only admins or the owner can invite members.');
}


export function canEditTaskPolicy(
  requester: Membership
): PolicyResult {
  if (requester.role === Role.OBSERVER) return cannot('Insuffisant permission to do this');
  return ok();
}
