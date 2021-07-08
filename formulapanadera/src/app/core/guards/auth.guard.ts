import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";

import { UserModel } from "../models/user.model";
import { UserStorageService } from "../services/storage/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userStorageService: UserStorageService
  ) {}

  async canActivate(): Promise<any> {
    let user: UserModel;
    user = await this.userStorageService.getUser();
    if (user && user.role) {
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
