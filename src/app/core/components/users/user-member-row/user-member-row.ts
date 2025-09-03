import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, ChevronDown, Crown } from 'lucide-angular';

import { environment } from '../../../../../environments/environment';
import { ProjectMembershipDTO } from '../../../models/dtos/dto';
import { Role, labelOfRole, roleBadgeClasses, roles } from '../../../models/enum/role';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';

@Component({
  selector: 'app-user-member-row',
  standalone: true,
  imports: [NgClass, LucideAngularModule, FormsModule, Select],
  templateUrl: './user-member-row.html',
  styleUrls: ['./user-member-row.css']
})
export class UserMemberRow {
  @Input() member!: ProjectMembershipDTO;
  @Input() requester!: ProjectMembershipDTO;
  @Output() roleChange = new EventEmitter<[ProjectMembershipDTO, Role]>();
  @Input() canManageRole = false;
  selectedRole: Role | undefined;
  protected readonly Role = Role;
  protected readonly roles = roles;
  protected readonly labelOfRole = labelOfRole;
  protected readonly roleBadgeClasses = roleBadgeClasses;
  protected readonly ChevronDown = ChevronDown;
  protected readonly Crown = Crown;
  protected readonly environment = environment;

  ngOnInit() {
    if (this.member) {
      this.selectedRole = this.member.role;
    }
  }
  choose(newRole: Role) {
    if (newRole !== this.member.role) {
      this.roleChange.emit([this.member, newRole]);
    }
  }
}
