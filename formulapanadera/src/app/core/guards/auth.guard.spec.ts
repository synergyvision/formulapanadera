import { async } from "@angular/core/testing";

import { AuthGuard } from "./auth.guard";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async(() => {
    authServiceSpy = jasmine.createSpyObj("AuthService", {
      getLoggedInUser: 0,
    });
    routerSpy = jasmine.createSpyObj("Router", {
      navigate: 0,
    });
    guard = new AuthGuard(authServiceSpy, routerSpy);
  }));

  it("should create", () => {
    expect(guard).toBeDefined();
  });

  it("should load", () => {
    guard.canLoad();
    expect(guard.canLoad()).toBe(true);
  });

  it("should not load", () => {
    authServiceSpy.getLoggedInUser = jasmine.createSpy().and.callFake(() => {
      return null;
    });
    guard.canLoad();
    expect(guard.canLoad()).toBe(false);
  });
});
