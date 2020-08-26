import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, of, Subject, from } from "rxjs";
import { DataStore } from "../utils/shell/data-store";
import { UserModel } from "./models/user.model";
import { Platform } from "@ionic/angular";

import { User, auth } from "firebase/app";
import { cfaSignOut } from "capacitor-firebase-auth";

@Injectable()
export class AuthService {
  currentUser: User;
  userProviderAdditionalInfo: any;
  profileDataStore: DataStore<UserModel>;
  redirectResult: Subject<any> = new Subject<any>();

  constructor(private angularFire: AngularFireAuth, private platform: Platform) {
    this.angularFire.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.currentUser = user;
      } else {
        // No user is signed in.
        this.currentUser = null;
      }
    });

    if (!this.platform.is("capacitor")) {
      // when using signInWithRedirect, this listens for the redirect results
      this.angularFire.getRedirectResult().then(
        (result) => {
          // result.credential.accessToken gives you the Provider Access Token. You can use it to access the Provider API.
          if (result.user) {
            this.userProviderAdditionalInfo = result.additionalUserInfo.profile;
            this.redirectResult.next(result);
          }
        },
        (error) => {
          this.redirectResult.next({ error: error.code });
        }
      );
    }
  }

  getRedirectResult(): Observable<any> {
    return this.redirectResult.asObservable();
  }

  private getProfileDataSource(): Observable<UserModel> {
    const userModel = new UserModel();
    const provierData = this.currentUser.providerData[0];

    const userData = this.userProviderAdditionalInfo
      ? this.userProviderAdditionalInfo
      : provierData;

    userModel.name = userData.name || userData.displayName || "Unknown";
    userModel.email = userData.email;

    return of(userModel);
  }

  // Get the currently signed-in user
  getLoggedInUser() {
    return this.currentUser;
  }

  signOut(): Observable<any> {
    if (this.platform.is("capacitor")) {
      return cfaSignOut();
    } else {
      return from(this.angularFire.signOut());
    }
  }

  signIn(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFire.signInWithEmailAndPassword(email, password);
  }

  signUp(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFire.createUserWithEmailAndPassword(email, password);
  }

  private getProfileStore(
    dataSource: Observable<UserModel>
  ): DataStore<UserModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: UserModel = new UserModel();
    this.profileDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.profileDataStore.load(dataSource);
    return this.profileDataStore;
  }

  recoverPassword(email: string): Promise<void> {
    return this.angularFire.sendPasswordResetEmail(email);
  }

  updatePassword(password: string) {
    this.currentUser
      .updatePassword(password)
      .then(() => {
        console.log("Password changed");
      })
      .catch((err) => {
        console.log(` failed ${err}`);
      });
  }
}
