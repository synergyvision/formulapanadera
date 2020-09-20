import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let angularFireSpy: any;
  let platformSpy: any;

  beforeEach(() => {
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
  });

  it("should create", () => {
    expect(service).toBeDefined();
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

  it("should recover password", () => {
    const email = "email@gmail.com";
    service.recoverPassword(email);
    expect(angularFireSpy.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(angularFireSpy.sendPasswordResetEmail).toHaveBeenCalledWith(email);
  });
});
