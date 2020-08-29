import { async } from "@angular/core/testing";

import { AuthService } from "./auth.service";
import { User } from "firebase";
import { UserModel } from "../models/user.model";
import { of } from "rxjs";

describe("AuthService", () => {
  let service: AuthService;
  let angularFireSpy: any;
  let platformSpy: any;

  beforeEach(async(() => {
    angularFireSpy = jasmine.createSpyObj("AngularFire", {
      onAuthStateChanged: (callback: any) => {
        callback();
      },
      signOut: 0,
      signInWithEmailAndPassword: 0,
      createUserWithEmailAndPassword: 0,
      sendPasswordResetEmail: 0,
    });
    platformSpy = jasmine.createSpyObj("Platform", {
      is: new Promise(() => {}),
    });
    service = new AuthService(angularFireSpy, platformSpy);
  }));

  it("should create", () => {
    expect(service).toBeDefined();
  });

  it("should get profile data source", () => {
    service.currentUser = {
      providerData: [{ displayName: "Name", email: "email@gmail.com" }],
    } as User;
    expect(service.getProfileDataSource()).toBeDefined();
  });

  it("should get loggged in user", () => {
    service.currentUser = {} as User;
    expect(service.getLoggedInUser()).toBeDefined();
  });

  it("should sign out", () => {
    service.signOut();
    expect(angularFireSpy.signOut).toHaveBeenCalledTimes(0);
  });

  it("should sign in", () => {
    const email = "email@gmail.com";
    const password = "password";
    service.signIn(email, password);
    expect(angularFireSpy.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(angularFireSpy.signInWithEmailAndPassword).toHaveBeenCalledWith(
      email,
      password
    );
  });

  it("should sign up", () => {
    const email = "email@gmail.com";
    const password = "password";
    service.signUp(email, password);
    expect(angularFireSpy.createUserWithEmailAndPassword).toHaveBeenCalledTimes(
      1
    );
    expect(angularFireSpy.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      email,
      password
    );
  });

  it("should get profile store", () => {
    const userModel = new UserModel();
    userModel.name = "name";
    userModel.email = "email@gmail.com";
    service.getProfileStore(of(userModel));
    expect(service.getProfileStore).toBeDefined();
  });

  it("should recover password", () => {
    const email = "email@gmail.com";
    service.recoverPassword(email);
    expect(angularFireSpy.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(angularFireSpy.sendPasswordResetEmail).toHaveBeenCalledWith(email);
  });

  it("should update password", () => {
    const password = "password";
    service.currentUser = jasmine.createSpyObj("currentUser", {
      updatePassword: 0,
    });
    service.updatePassword(password);
    expect(service.currentUser.updatePassword).toHaveBeenCalledTimes(1);
    expect(service.currentUser.updatePassword).toHaveBeenCalledWith(password);
  });
});
