import {ProjectDTO, UserDTO} from '../../models/dtos/dto';
import {Tag} from '../../models/enum/tag';

export class ProjectStub {
  static testUser(): UserDTO {
    return {
      id: 'user-1',
      username: 'Alice',
      profileImageUrl: '/assets/avatar1.png'
    };
  }

  static testProject(): ProjectDTO {
    return {
      id: 'project-1',
      name: 'Demo Project',
      tag: Tag.AI,
      description: 'This is a demo project used for testing.',
      startDate: new Date('2025-01-01').toISOString(),
      createdBy: this.testUser(),
      createdAt: new Date('2025-01-01T10:00:00Z').toISOString(),
      openTasks: 4,
      completedTasks: 6
    };
  }

  static emptyProject(): ProjectDTO {
    return {
      id: 'empty-project',
      name: 'Empty Project',
      tag: undefined,
      description: undefined,
      startDate: undefined,
      createdBy: this.testUser(),
      createdAt: new Date().toISOString(),
      openTasks: 0,
      completedTasks: 0
    };
  }
}
