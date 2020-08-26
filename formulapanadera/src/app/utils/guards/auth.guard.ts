import { Injectable } from "@angular/core";
import { Router, CanLoad } from "@angular/router";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(): boolean {
    // check if user is authenticated
    if (this.authService.getLoggedInUser() != null) {
      return true;
    } else {
      // Navigate to the login page
      this.router.navigate(["auth/sign-in"]);
      return false;
    }
  }
}
