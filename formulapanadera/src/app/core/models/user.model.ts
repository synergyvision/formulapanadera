export class UserResumeModel {
  name: string;
  email: string;
}

export class ModifierModel extends UserResumeModel {
  date: any;
}

export class UserModel {
  id: string;
  name: string;
  email: string;
  user_groups: Array<UserResumeModel>;
}