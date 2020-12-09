import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { UserResumeModel } from "../../models/user.model";

const { Storage } = Plugins;

@Injectable()
export class UserStorageService {
  private key = "user";

  constructor() {}

  public async getUser(): Promise<UserResumeModel> {
    let user: UserResumeModel;
    await Storage.get({ key: this.key }).then((data) => {
      if (data.value) {
        user = JSON.parse(data.value);
      }
    });
    return user;
  }

  public async setUser(user: UserResumeModel): Promise<void> {
    let storage_user = JSON.stringify(user);
    Storage.set({ key: this.key, value: storage_user });
  }

  public async clear() {
    Storage.clear();
  }
}
