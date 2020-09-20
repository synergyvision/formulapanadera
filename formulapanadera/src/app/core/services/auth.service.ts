import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, from } from "rxjs";
import { DataStore } from "../../shared/shell/data-store";
import { UserModel } from "../models/user.model";
import { Platform } from "@ionic/angular";

import { User, auth } from "firebase/app";
import { cfaSignOut } from "capacitor-firebase-auth";

@Injectable()
export class AuthService {
  constructor(
    private angularFire: AngularFireAuth,
    private platform: Platform
  ) {}

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

  recoverPassword(email: string): Promise<void> {
    return this.angularFire.sendPasswordResetEmail(email);
  }

  async updatePassword(password: string) {
    return (await this.angularFire.currentUser).updatePassword(password);
  }
}
