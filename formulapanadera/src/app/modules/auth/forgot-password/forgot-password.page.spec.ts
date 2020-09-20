import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";

import { ForgotPasswordPage } from "./forgot-password.page";
import { TranslateModule } from "@ngx-translate/core";
import { SignInPageModule } from "../sign-in/sign-in.module";
import { LanguageService } from "src/app/core/services/language.service";
import { AuthService } from "src/app/core/services/firebase/auth.service";

describe("ForgotPasswordPage", () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;
  let languageServiceSpy: any;
  let authServiceSpy: any;

  beforeEach(async(() => {
    languageServiceSpy = jasmine.createSpyObj("LanguageService", {
      initLanguages: 0,
      openLanguageChooser: 0,
      getTerm: "term",
    });
    authServiceSpy = jasmine.createSpyObj("AuthService", {
      recoverPassword: new Promise(() => {}),
    });

    TestBed.configureTestingModule({
      declarations: [ForgotPasswordPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          {
            path: "auth/sign-in",
            component: SignInPageModule,
          },
        ]),
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(languageServiceSpy.initLanguages).toHaveBeenCalledTimes(1);
    expect(languageServiceSpy.getTerm).toHaveBeenCalledTimes(2);
  });

  it("should recover password", () => {
    component.recoverPassword();
    expect(authServiceSpy.recoverPassword).toHaveBeenCalledTimes(1);
    expect(component.submitError).toBe(null);
  });

  it("should open language chooser", () => {
    component.openLanguageChooser();
    expect(languageServiceSpy.openLanguageChooser).toHaveBeenCalledTimes(1);
  });
});
