import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";

import { SignInPage } from "./sign-in.page";
import { TranslateModule } from "@ngx-translate/core";
import { ProductionPageModule } from "../../production/production.module";
import { LanguageService } from "src/app/core/services/language.service";
import { AuthService } from "src/app/core/services/firebase/auth.service";

describe("SignInPage", () => {
  let component: SignInPage;
  let fixture: ComponentFixture<SignInPage>;
  let languageServiceSpy: any;
  let authServiceSpy: any;

  beforeEach(async(() => {
    languageServiceSpy = jasmine.createSpyObj("LanguageService", {
      initLanguages: 0,
      openLanguageChooser: 0,
      getTerm: "term",
    });
    authServiceSpy = jasmine.createSpyObj("AuthService", {
      signIn: new Promise(() => {}),
    });

    TestBed.configureTestingModule({
      declarations: [SignInPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          {
            path: "menu/production",
            component: ProductionPageModule,
          },
        ]),
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(languageServiceSpy.initLanguages).toHaveBeenCalledTimes(1);
    expect(languageServiceSpy.getTerm).toHaveBeenCalledTimes(4);
  });

  it("should dismiss loading, should redirect to main page", () => {
    component.redirectLoader = jasmine.createSpyObj("redirectLoader", {
      dismiss: () => {
        return new Promise(() => {});
      },
    });
    component.redirectLoggedUserToMainPage();
    expect(component.redirectLoader.dismiss).toHaveBeenCalledTimes(1);
  });

  it("should not dismiss loading, should redirect to main page", () => {
    component.redirectLoader = null as HTMLIonLoadingElement;
    component.redirectLoggedUserToMainPage();
    expect(component.redirectLoader).toBe(null);
  });

  it("should sign in", () => {
    component.signIn();
    expect(authServiceSpy.signIn).toHaveBeenCalledTimes(1);
    expect(component.submitError).toBe(null);
  });

  it("should open language chooser", () => {
    component.openLanguageChooser();
    expect(languageServiceSpy.openLanguageChooser).toHaveBeenCalledTimes(1);
  });
});
