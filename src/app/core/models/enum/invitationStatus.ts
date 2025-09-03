import {Tag} from './tag';

export enum InvitationStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
export function labelOfInvitation(status: InvitationStatus): string {
  const special: Record<InvitationStatus, string> = {
    [InvitationStatus.PENDING]: 'Pending',
    [InvitationStatus.REJECTED]: 'Rejected',

  };
  return special[status] ?? String(status)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
