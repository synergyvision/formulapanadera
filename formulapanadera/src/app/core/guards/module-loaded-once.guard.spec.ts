import {
  ModuleLoadedOnceGuard,
  throwIfAlreadyLoaded,
} from "./module-loaded-once.guard";

describe("ModuleLoadedOnceGuard", () => {
  let guard: any;
  let moduleSpy: any;

  beforeAll((() => {
    guard = new ModuleLoadedOnceGuard(undefined);
  }));

  it("should create", () => {
    expect(guard).toBeDefined();
  });

  it("should throw module loaded error", () => {
    moduleSpy = {};
    try {
      guard = new ModuleLoadedOnceGuard(moduleSpy);
    } catch (e) {
      expect(e.message).toEqual(
        "Object has already been loaded. Import this module in the AppModule only."
      );
    }
  });

  it("should throwIfAlreadyLoaded error", () => {
    try {
      throwIfAlreadyLoaded({}, "Module");
    } catch (e) {
      expect(e.message).toEqual(
        "Module has already been loaded. Import Core modules in the AppModule only."
      );
    }
  });

  it("should not throwIfAlreadyLoaded error", () => {
    throwIfAlreadyLoaded(undefined, "Module");
    expect(throwIfAlreadyLoaded).not.toThrowError();
  });
});
