import { InvitationStatus, labelOfInvitation } from './invitationStatus';

describe('labelOfInvitation', () => {
  it('returns mapped label for PENDING', () => {
    expect(labelOfInvitation(InvitationStatus.PENDING)).toBe('Pending');
  });

  it('returns mapped label for REJECTED', () => {
    expect(labelOfInvitation(InvitationStatus.REJECTED)).toBe('Rejected');
  });

  it('formats unknown values by replacing hyphens and capitalizing', () => {
    // Cast to any to simulate an unknown status value
    expect(labelOfInvitation('on-hold' as any)).toBe('On Hold');
  });

  it('leaves non-hyphen strings and still capitalizes word starts', () => {
    // Also an unknown value, no hyphen — should just capitalize first letter
    expect(labelOfInvitation('waiting' as any)).toBe('Waiting');
  });
});
