import {Tag} from './enum/tag';
import {UserSummary} from './userSummary';


export class Project {
  constructor(
    public id: string,
    public name: string,
    public tag: Tag | undefined,
    public description: string | undefined,
    public startDate: Date | undefined,
    public createdBy: UserSummary,
    public createdAt: Date
  ) {}

  static fromApi(dto: any): Project {
    return new Project(
      dto.id,
      dto.name,
      dto.tag,
      dto.description ?? undefined,
      dto.startDate ? new Date(dto.startDate) : undefined,
      new UserSummary(
        dto.createdBy?.id ?? dto.createdById ?? '',
        dto.createdBy?.fullName
      ),
      dto.createdAt ? new Date(dto.createdAt) : new Date()
    );
  }
}
