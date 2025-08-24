// Keep these minimal and extend as your backend grows

import {Tag} from '../enum/tag';
import {TaskPriority} from '../enum/taskPriority';
import {TaskStatus} from '../enum/taskStatus';

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

export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | string;

export interface ProjectMembershipDTO {
  id: string;
  user: UserDTO;
  role: ProjectRole;
  projectId: string;
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

export interface TaskHistoryDTO {
  id: string;
  taskId: string;
  previousStatus?: string | undefined;
  newStatus?: string | undefined;
  changedAt?: string;
  changedBy?: UserDTO;
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
  token: string;
  status?: string;
  createdAt?: string;
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
  dueDate: string; // en ISO (ex: "2025-08-22T14:30:00Z")
  priority: TaskPriority; // "LOW" | "MEDIUM" | "HIGH"
  status: TaskStatus;
  projectId: string;  // UUID
  assigneeId: string | undefined; // UUID
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}
