import { Injectable } from "@angular/core";
import { Router, CanLoad } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";

import { UserModel } from "../models/user.model";
import { UserStorageService } from "../services/storage/user.service";

@Injectable()
export class AuthGuard implements CanLoad {
  constructor(
    private router: Router,
    private userStorageService: UserStorageService
  ) {}

  async canLoad(): Promise<any> {
    let user: UserModel;
    user = await this.userStorageService.getUser();
    if (user) {
      return true;
    } else {
      this.router.navigate(
        [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
        { replaceUrl: true }
      );
      return false;
    }
  }
}
