import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";

@Injectable()
export class StateHasDataGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<any> {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state) {
      return true;
    } else {
      this.router.navigateByUrl(
        this.router.url.substring(0, this.router.url.lastIndexOf("/"))
      );
      return false;
    }
  }
}
