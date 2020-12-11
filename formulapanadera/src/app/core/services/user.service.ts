import { Injectable } from "@angular/core";
import { ShellModel } from 'src/app/shared/shell/shell.model';
import { UserGroupModel } from '../models/user.model';

@Injectable()
export class UserService {

  constructor() { }
  
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
