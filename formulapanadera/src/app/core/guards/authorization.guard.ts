import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { ROLES } from "src/app/config/roles";
import { UserStorageService } from "../services/storage/user.service";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private router: Router,
    private userStorageService: UserStorageService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<any> {
    const expectedPermission = route.data?.permission;
    const user = await this.userStorageService.getUser();
    let role = ROLES.find((role) => { return role.name == user.role });

    if (!role) {
      this.userStorageService.clear();
      this.router.navigate(
        [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
        { replaceUrl: true }
      );
    }
    
    if (!expectedPermission || role.permissions.some((value) => { return value.name == expectedPermission })) {
      return true;
    } else {
      return false;
    }
  }
}
