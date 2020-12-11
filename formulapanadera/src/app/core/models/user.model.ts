export class UserResumeModel {
  name: string;
  email: string;
}

export class ModifierModel extends UserResumeModel {
  date: any;
}

export class UserGroupModel {
  name: string;
  users: Array<UserResumeModel>
}

export class UserModel {
  id: string;
  name: string;
  email: string;
  user_groups: Array<UserGroupModel>;
}