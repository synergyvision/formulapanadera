import { async } from "@angular/core/testing";

import { LanguageService } from "./language.service";

describe("LanguageService", () => {
  let service: LanguageService;
  let translateServiceSpy: any;
  let alertControllerSpy: any;

  beforeEach(async(() => {
    translateServiceSpy = jasmine.createSpyObj("TranslateService", {
      getTranslation: {
        subscribe: (callback: any) => {
          callback();
        },
      },
      use: 0,
      get: {
        subscribe: (callback: any) => {
          callback();
        },
      },
    });
    alertControllerSpy = jasmine.createSpyObj("AlertController", {
      create: { present: () => {} },
    });
    service = new LanguageService(translateServiceSpy, alertControllerSpy);
  }));

  it("should create", () => {
    expect(service).toBeDefined();
  });

  it("should init languages", () => {
    (translateServiceSpy.onLangChange = {
      subscribe: (callback: any) => {
        callback();
      },
    }),
      service.initLanguages();
    expect(translateServiceSpy.getTranslation).toHaveBeenCalledTimes(2);
  });

  it("should get languages", () => {
    const languages = service.getLanguages();
    expect(languages).toBeInstanceOf(Array);
  });

  it("should open language chooser", async () => {
    service.translations = {
      settings: { language: { select: 0 } },
      action: { cancel: 0, ok: 0 },
    };
    await service.openLanguageChooser();
    expect(alertControllerSpy.create).toHaveBeenCalledTimes(1);
  });

  it("should get term", () => {
    const term = "term";
    service.getTerm(term);
    expect(translateServiceSpy.get).toHaveBeenCalledTimes(1);
  });
});
