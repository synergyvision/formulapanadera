import { Injectable } from "@angular/core";
import { Router, CanLoad } from "@angular/router";
import { Plugins } from "@capacitor/core";

import { UserModel } from "../models/user.model";

const { Storage } = Plugins;

@Injectable()
export class AuthGuard implements CanLoad {
  constructor(private router: Router) {}

  async canLoad(): Promise<any> {
    let user = UserModel;
    await Storage.get({ key: "user" }).then((data) => {
      // Check if user is authenticated
      if (data.value) {
        user = JSON.parse(data.value);
      } else {
        // Navigate to the login page
        this.router.navigate(["auth/sign-in"], { replaceUrl: true });
      }
    });
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
