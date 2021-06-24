export class PermissionModel {
  name: "FORMULA" | "INGREDIENT" | "PRODUCTION" | "COURSE" | "SHARE";
  type: "MANAGE" | "VIEW";
}

export class RoleModel {
  name: string;
  permissions: PermissionModel[];
}