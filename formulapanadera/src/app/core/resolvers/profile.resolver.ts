import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { UserModel } from "../models/user.model";
import { DataStore } from "../../shared/shell/data-store";

@Injectable()
export class ProfileResolver implements Resolve<any> {
  constructor(private authService: AuthService) {}

  resolve() {
    const dataSource: Observable<UserModel> = this.authService.getProfileDataSource();
    const dataStore: DataStore<UserModel> = this.authService.getProfileStore(
      dataSource
    );
    return dataStore;
  }
}
