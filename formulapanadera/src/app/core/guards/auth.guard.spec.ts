import { AuthGuard } from "./auth.guard";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let routerSpy: any;

  beforeEach((() => {
    routerSpy = jasmine.createSpyObj("Router", {
      navigate: 0,
    });
    guard = new AuthGuard(routerSpy);
  }));

  it("should create", () => {
    expect(guard).toBeDefined();
  });

  it("should load", () => {
    guard.canLoad();
    expect(guard.canLoad()).toBe(true);
  });

  it("should not load", () => {
    guard.canLoad();
    expect(guard.canLoad()).toBe(false);
  });
});
