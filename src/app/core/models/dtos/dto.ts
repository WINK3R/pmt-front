import {Tag} from '../enum/tag';
import {TaskPriority} from '../enum/taskPriority';
import {TaskStatus} from '../enum/taskStatus';
import {UserSummary} from '../userSummary';
import {InvitationStatus} from '../enum/invitationStatus';
import {Role} from '../enum/role';

export interface UserDTO {
  id: string;
  username?: string;
  profileImageUrl?: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  tag: Tag | undefined,
  description?: string | undefined;
  startDate?: string | undefined;
  createdBy: UserDTO;
  createdAt: string;
  openTasks: number;
  completedTasks: number;
}

export interface ProjectMembershipDTO {
  membershipId: string;
  joinedAt: string;
  user: UserDTO;
  role: Role;
}

export interface TaskDTO {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority | undefined;
  label?: string;
  dueDate?: string;
  projectId: string;
  assigneeId?: UserDTO;
  createdBy: UserDTO;
  updatedBy: UserDTO;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryValue {
  text?: string;
  user?: UserDTO;
}

export interface TaskHistoryDTO {
  id: string;
  taskId: string;
  newValue: HistoryValue;
  oldValue: HistoryValue;
  field: string;
  changedAt?: string;
  changedBy: UserDTO;
}

export interface NotificationDTO {
  id: string;
  status?: string;
  type?: string;
  userId?: string | undefined;
  taskId?: string | undefined;
  createdAt?: string;
}

export interface InvitationDTO {
  id: string;
  email?: string;
  invitedUser: UserSummary;
  inviterUser: UserSummary;
  status: InvitationStatus;
  createdAt?: string;
  acceptedAt?: string;
  projectId: string;
  projectName: string;
}

export interface InvitationCreationDTO {
  projectId: string;
  emailInvited: string;
}

export interface RegisterRequestDTO {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface MeResponseDTO {
  user: UserDTO;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  label: string;
  dueDate: string | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  assigneeId: string | undefined;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}
