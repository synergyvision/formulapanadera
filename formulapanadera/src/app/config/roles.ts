import { RoleModel } from "../core/models/role.model";

export const ROLES: RoleModel[] = [
  {
    name: 'FREE',
    permissions: [
      { name: "FORMULA", type: "MANAGE" },
      { name: "FORMULA", type: "VIEW" },
      { name: "INGREDIENT", type: "MANAGE" },
      { name: "INGREDIENT", type: "VIEW" },
    ],
  },
  {
    name: 'SOCIAL',
    permissions: [
      { name: "FORMULA", type: "MANAGE" },
      { name: "FORMULA", type: "VIEW" },
      { name: "INGREDIENT", type: "MANAGE" },
      { name: "INGREDIENT", type: "VIEW" },
      { name: "PRODUCTION", type: "MANAGE" },
      { name: "PRODUCTION", type: "VIEW" },
      { name: "COURSE", type: "VIEW" },
      { name: "SHARE", type: "MANAGE" },
    ],
  },
  {
    name: 'PRO',
    permissions: [
      { name: "FORMULA", type: "MANAGE" },
      { name: "FORMULA", type: "VIEW" },
      { name: "INGREDIENT", type: "MANAGE" },
      { name: "INGREDIENT", type: "VIEW" },
      { name: "PRODUCTION", type: "MANAGE" },
      { name: "PRODUCTION", type: "VIEW" },
      { name: "COURSE", type: "MANAGE" },
      { name: "COURSE", type: "VIEW" },
      { name: "USER_GROUP", type: "MANAGE" },
      { name: "SHARE", type: "MANAGE" },
    ],
  }
];
