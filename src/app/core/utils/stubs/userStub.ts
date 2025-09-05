import {UserDTO} from '../../models/dtos/dto';
import {UserSummary} from '../../models/userSummary';

export class UserStub {
  static testUser(): UserDTO {
    return {
      id: 'user-1',
      username: 'John Doe',
      profileImageUrl: '/images/avatar.png'
    };
  }

  static testUserSummary() : UserSummary {
    return {
      id: 'user-1',
      username: 'John Doe',
      profileImageUrl: '/images/avatar.png'
    }
  }
}
