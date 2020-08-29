import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";

import { ChangePasswordPage } from "./change-password.page";
import { TranslateModule } from "@ngx-translate/core";

import { AuthService } from "src/app/core/services/auth.service";
import { LanguageService } from "src/app/core/services/language.service";
import { SettingsPageModule } from "../options/options.module";

describe("ChangePasswordPage", () => {
  let component: ChangePasswordPage;
  let fixture: ComponentFixture<ChangePasswordPage>;
  let languageServiceSpy: any;
  let authServiceSpy: any;

  beforeEach(async(() => {
    languageServiceSpy = jasmine.createSpyObj("LanguageService", {
      getTerm: "term",
    });
    authServiceSpy = jasmine.createSpyObj("AuthService", {
      updatePassword: new Promise(() => {}),
    });

    TestBed.configureTestingModule({
      declarations: [ChangePasswordPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          { path: "menu/settings", component: SettingsPageModule },
        ]),
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(languageServiceSpy.getTerm).toHaveBeenCalledTimes(4);
  });

  it("should update password", () => {
    component.updatePassword();
    expect(authServiceSpy.updatePassword).toHaveBeenCalledTimes(1);
    expect(component.submitError).toBe(null);
  });

  it("should dismiss loading, should redirect to settings page", () => {
    component.redirectLoader = jasmine.createSpyObj("redirectLoader", {
      dismiss: () => {
        return new Promise(() => {});
      },
    });
    component.redirectToSettingsPage();
    expect(component.redirectLoader.dismiss).toHaveBeenCalledTimes(1);
  });

  it("should not dismiss loading, should redirect to settings page", () => {
    component.redirectLoader = null as HTMLIonLoadingElement;
    component.redirectToSettingsPage();
    expect(component.redirectLoader).toBe(null);
  });
});
