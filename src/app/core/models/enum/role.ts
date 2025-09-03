
export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  OBSERVER = "OBSERVER",
  MEMBER = "MEMBER",
}

export const roles: Role[] = [Role.OWNER, Role.ADMIN, Role.MEMBER, Role.OBSERVER];


export function labelOfRole(role: Role): string {
  const special: Record<Role, string> = {
    [Role.OWNER]: 'Owner',
    [Role.ADMIN]: 'Administrator',
    [Role.OBSERVER]: 'Observer',
    [Role.MEMBER]: 'Member',

  };
  return special[role] ?? String(role)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function roleBadgeClasses(role: Role): string {
  const roleBadgeClasses: Record<Role, string> = {
    [Role.OWNER]:    'bg-amber-100 text-amber-800',
    [Role.ADMIN]:    'bg-indigo-100 text-indigo-800',
    [Role.OBSERVER]: 'bg-slate-100 text-slate-700',
    [Role.MEMBER]:   'bg-emerald-100 text-emerald-800',
  };
  return roleBadgeClasses[role]
}
