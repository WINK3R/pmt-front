import {ProjectMembershipDTO} from '../../models/dtos/dto';
import {Role} from '../../models/enum/role';

export class ProjectMembershipStub {
  static testUserMembership() : ProjectMembershipDTO {
    return {
      membershipId: "1",
      joinedAt: Date.now().toString(),
      user: {
        id: '1',
        username: 'TestUser',
        profileImageUrl: '/avatar.jpg'
      },
      role: Role.MEMBER
    }
  }
}
