import { ShellModel } from "../../utils/shell/shell.model";

export class UserModel extends ShellModel {
  name: string;
  email: string;

  constructor() {
    super();
  }
}
