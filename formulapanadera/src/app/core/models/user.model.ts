export class UserModel {
  name: string;
  email: string;
}

export class ModifierModel extends UserModel {
  date: any;
}