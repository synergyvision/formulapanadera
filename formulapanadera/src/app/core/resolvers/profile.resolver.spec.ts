import { async } from "@angular/core/testing";

import { ProfileResolver } from "./profile.resolver";
import { Observable } from "rxjs";
import { UserModel } from "../models/user.model";

describe("ProfileResolver", () => {
  let resolver: ProfileResolver;
  let authServiceSpy: any;

  beforeEach(async(() => {
    authServiceSpy = jasmine.createSpyObj("AuthService", {
      getProfileDataSource: new Observable<UserModel>(),
      getProfileStore: 0,
    });
    resolver = new ProfileResolver(authServiceSpy);
  }));

  it("should create", () => {
    expect(resolver).toBeDefined();
  });

  it("should resolve", () => {
    resolver.resolve();
    expect(resolver.resolve).toBeDefined();
    expect(authServiceSpy.getProfileDataSource).toHaveBeenCalledTimes(1);
    expect(authServiceSpy.getProfileStore).toHaveBeenCalledTimes(1);
  });
});
