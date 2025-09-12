import { Role } from '../models/enum/role'; // real enum
import {
  Membership,
  MemberStatus,
  toMembership,
  canChangeRolePolicy,
  canChangeStatusPolicy,
  canRemoveMemberPolicy,
  canInvitePolicy,
  canEditTaskPolicy,
} from './project-policy';

describe('projectPolicy', () => {
  const owner: Membership   = { userId: 'u1', role: Role.OWNER };
  const admin: Membership   = { userId: 'u2', role: Role.ADMIN };
  const member: Membership  = { userId: 'u3', role: Role.MEMBER };
  const observer: Membership= { userId: 'u4', role: Role.OBSERVER };

  describe('toMembership', () => {
    it('maps ProjectMembershipDTO to Membership', () => {
      const dto = { user: { id: 'userX' }, role: Role.MEMBER } as any;
      expect(toMembership(dto)).toEqual({ userId: 'userX', role: Role.MEMBER });
    });
  });

  describe('canChangeRolePolicy', () => {
    it('allows OWNER', () => {
      const res = canChangeRolePolicy(owner);
      expect(res.allowed).toBeTrue();
      expect(res.reason).toBeUndefined();
    });

    it('allows ADMIN', () => {
      const res = canChangeRolePolicy(admin);
      expect(res.allowed).toBeTrue();
    });

    it('denies MEMBER ', () => {
      const res = canChangeRolePolicy(member);
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('Only the owner or an admin can change roles.');
    });

    it('denies OBSERVER ', () => {
      const res = canChangeRolePolicy(observer);
      expect(res.allowed).toBeFalse();
    });
  });

  describe('canChangeStatusPolicy', () => {
    it('denies changing OWNER status', () => {
      const res = canChangeStatusPolicy(owner, { ...owner }, 'SUSPENDED');
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('The owner’s status can’t be changed.');
    });

    it('denies changing own status', () => {
      const res = canChangeStatusPolicy(admin, { ...admin }, 'SUSPENDED');
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('You can’t change your own status.');
    });

    it('denies when requester has equal rank to target', () => {
      const res = canChangeStatusPolicy(admin, { userId: 't1', role: Role.ADMIN }, 'SUSPENDED');
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('You can only change status for members ranked below you.');
    });

    it('denies when requester has lower rank than target', () => {
      const res = canChangeStatusPolicy(member, { userId: 't1', role: Role.ADMIN }, 'SUSPENDED');
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('You can only change status for members ranked below you.');
    });

    it('denies forcing INVITED -> ACTIVE', () => {
      const res = canChangeStatusPolicy(
        admin,
        { userId: 't1', role: Role.MEMBER, status: 'INVITED' },
        'ACTIVE'
      );
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('Invitations are accepted by the user, not forced.');
    });

    it('treats undefined status as ACTIVE and allows valid change', () => {
      const res = canChangeStatusPolicy(
        admin,
        { userId: 't1', role: Role.MEMBER },
        'SUSPENDED'
      );
      expect(res.allowed).toBeTrue();
    });

    it('allows ADMIN changing MEMBER from ACTIVE -> INVITED', () => {
      const res = canChangeStatusPolicy(
        admin,
        { userId: 't2', role: Role.MEMBER, status: 'ACTIVE' as MemberStatus },
        'INVITED'
      );
      expect(res.allowed).toBeTrue();
    });
  });

  describe('canRemoveMemberPolicy', () => {
    it('denies removing OWNER', () => {
      const res = canRemoveMemberPolicy(owner, { ...owner });
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('The owner can’t be removed.');
    });

    it('denies removing self', () => {
      const res = canRemoveMemberPolicy(admin, { ...admin });
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('Use “Leave project” instead.');
    });

    it('denies when requester rank <= target', () => {
      const res = canRemoveMemberPolicy(member, { userId: 't1', role: Role.MEMBER });
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('You can only remove members ranked below you.');
    });

    it('allows higher-rank requester', () => {
      const res = canRemoveMemberPolicy(admin, { userId: 't1', role: Role.MEMBER });
      expect(res.allowed).toBeTrue();
    });
  });

  describe('canInvitePolicy', () => {
    it('allows OWNER', () => {
      expect(canInvitePolicy(owner).allowed).toBeTrue();
    });

    it('allows ADMIN', () => {
      expect(canInvitePolicy(admin).allowed).toBeTrue();
    });

    it('denies MEMBER ', () => {
      const res = canInvitePolicy(member);
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('Only admins or the owner can invite members.');
    });

    it('denies OBSERVER ', () => {
      const res = canInvitePolicy(observer);
      expect(res.allowed).toBeFalse();
    });
  });

  describe('canEditTaskPolicy', () => {
    it('denies OBSERVER ', () => {
      const res = canEditTaskPolicy(observer);
      expect(res.allowed).toBeFalse();
      expect(res.reason).toBe('Insuffisant permission to do this');
    });

    it('allows MEMBER', () => {
      expect(canEditTaskPolicy(member).allowed).toBeTrue();
    });

    it('allows ADMIN', () => {
      expect(canEditTaskPolicy(admin).allowed).toBeTrue();
    });

    it('allows OWNER', () => {
      expect(canEditTaskPolicy(owner).allowed).toBeTrue();
    });
  });
});
