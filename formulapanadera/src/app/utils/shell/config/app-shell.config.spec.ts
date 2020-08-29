import { AppShellConfig } from "./app-shell.config";
import { IAppShellConfig } from "./config.interfaces";
import { async } from "@angular/core/testing";
import { Observable } from "rxjs";

describe("AppShellConfig", () => {
  let appShellConfig: AppShellConfig;
  let httpClientSpy: any;

  beforeEach(async(() => {
    httpClientSpy = jasmine.createSpyObj("HttpClient", {
      get: {
        pipe: () => {
          return new Observable<IAppShellConfig>();
        },
      },
    });
    appShellConfig = new AppShellConfig(httpClientSpy);
  }));

  it("should create", () => {
    expect(appShellConfig).toBeDefined();
  });

  it("should load", () => {
    appShellConfig.load();
    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
  });

  it("should not load", () => {
    httpClientSpy.get = () => {
      return {
        pipe: () => {
          return {
            toPromise: () => {
              return Promise.reject("error");
            },
          };
        },
      };
    };
    appShellConfig.load();
    expect(appShellConfig.load).toThrowError();
  });
});
