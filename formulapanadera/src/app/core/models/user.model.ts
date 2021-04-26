export class UserOwnerModel {
  // If empty is public
  owner: string;
  // Used to clone
  can_clone: boolean;
  public: boolean;
  reference: string; // ID of original
  shared_references: Array<string>; // To search from email
  shared_users: Array<UserResumeModel>; // Additional data
  // Used to credit the users
  creator: ModifierModel;
  modifiers: Array<ModifierModel>;
  last_modified?: any; // Date
}

export class UserResumeModel {
  name: string;
  email: string;
}

export class ModifierModel extends UserResumeModel {
  date: any;
}

export class UserGroupModel {
  id: string;
  name: string;
  image_url: string;
  description: string;
  users: Array<UserResumeModel>
}

export class UserModel {
  id: string;
  name: string;
  email: string;
  instructor: boolean;
  user_groups: Array<UserGroupModel>;
}