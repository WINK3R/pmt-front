import { Project } from './project';
import { UserSummary } from './userSummary';
import { Tag } from './enum/tag';

describe('Project model', () => {
  it('should create a Project instance directly', () => {
    const user = new UserSummary('u1', 'John Doe');
    const project = new Project('p1', 'Test Project', Tag.Development, 'desc', new Date('2024-01-01'), user, new Date('2024-01-02'));

    expect(project.id).toBe('p1');
    expect(project.name).toBe('Test Project');
    expect(project.tag).toBe(Tag.Development);
    expect(project.description).toBe('desc');
    expect(project.startDate).toEqual(new Date('2024-01-01'));
    expect(project.createdBy).toEqual(user);
    expect(project.createdAt).toEqual(new Date('2024-01-02'));
  });

  it('should map fromApi dto with all fields', () => {
    const dto = {
      id: 'p1',
      name: 'From API',
      tag: Tag.Development,
      description: 'api desc',
      startDate: '2024-01-01T00:00:00.000Z',
      createdBy: { id: 'u1', fullName: 'Jane Doe' },
      createdAt: '2024-01-02T00:00:00.000Z',
    };

    const project = Project.fromApi(dto);

    expect(project).toBeInstanceOf(Project);
    expect(project.startDate).toEqual(new Date(dto.startDate));
    expect(project.createdBy).toEqual(jasmine.any(UserSummary));
    expect(project.createdBy.id).toBe('u1');
    expect(project.createdBy.username).toBe('Jane Doe');
    expect(project.createdAt).toEqual(new Date(dto.createdAt));
  });

  it('should handle missing optional fields gracefully', () => {
    const dto = {
      id: 'p2',
      name: 'No optional',
      tag: null,
      createdById: 'u2'
    };

    const project = Project.fromApi(dto);

    expect(project.id).toBe('p2');
    expect(project.tag).toBeNull();
    expect(project.description).toBeUndefined();
    expect(project.startDate).toBeUndefined();
    expect(project.createdBy.id).toBe('u2');
    expect(project.createdAt).toEqual(jasmine.any(Date));
  });
});
