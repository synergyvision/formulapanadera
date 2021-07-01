export class PermissionModel {
  name: "FORMULA" | "INGREDIENT" | "PRODUCTION" | "COURSE" | "SHARE" | "USER_GROUP";
  type: "MANAGE" | "VIEW";
}

export class RoleModel {
  name: string;
  permissions: PermissionModel[];
}