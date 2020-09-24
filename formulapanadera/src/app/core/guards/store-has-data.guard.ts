import { Injectable } from "@angular/core";
import { Router, CanLoad } from "@angular/router";

@Injectable()
export class StateHasDataGuard implements CanLoad {
  constructor(private router: Router) {}

  async canLoad(): Promise<any> {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state) {
      return true;
    } else {
      return false;
    }
  }
}
