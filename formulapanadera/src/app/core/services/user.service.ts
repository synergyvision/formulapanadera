import { Injectable } from "@angular/core";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { ROLES } from "src/app/config/roles";
import { ShellModel } from 'src/app/shared/shell/shell.model';
import { PermissionModel, RoleModel } from "../models/role.model";
import { UserGroupModel, UserResumeModel } from '../models/user.model';

@Injectable()
export class UserService {

  constructor() { }

  public userSearchingState() {
    let searchingShellModel: UserResumeModel[] &
      ShellModel = [] as UserResumeModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new UserResumeModel());
    }
    searchingShellModel.isShell = true;
    return searchingShellModel;
  }

  public userGroupSearchingState() {
    let searchingShellModel: UserGroupModel[] &
      ShellModel = [] as UserGroupModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new UserGroupModel());
    }
    searchingShellModel.isShell = true;
    return searchingShellModel;
  }

  public hasPermission(user_role: string, permissions: PermissionModel[]): boolean {
    if (!user_role) {
      return false;
    }
    let role = ROLES.find((role) => { return role.name == user_role });
    for (const permission of permissions) {
      if (!role.permissions.some((value) => { return value.name == permission.name && value.type == permission.type })) {
        return false;
      }
    }
    return true;
  }
  
  // Sort
  sortUserGroups(user_groups: UserGroupModel[]): UserGroupModel[] & ShellModel {
    return user_groups.sort(function (a, b) {
      if (a.name && b.name) {
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        if (b.name.toUpperCase() > a.name.toUpperCase()) {
          return -1;
        }
      }
      return 0;
    }) as UserGroupModel[] & ShellModel
  }
}
