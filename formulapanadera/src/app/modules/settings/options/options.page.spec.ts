import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";

import { OptionsPage } from "./options.page";
import { TranslateModule } from "@ngx-translate/core";

import { LanguageService } from "../../../core/services/language.service";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Observable } from "rxjs";

describe("OptionsPage", () => {
  let component: OptionsPage;
  let fixture: ComponentFixture<OptionsPage>;
  let languageServiceSpy: any;
  let authServiceSpy: any;

  beforeEach(() => {
    languageServiceSpy = jasmine.createSpyObj("LanguageService", {
      initLanguages: 0,
      openLanguageChooser: 0,
    });
    authServiceSpy = jasmine.createSpyObj("AuthService", {
      signOut: { subscribe: () => {} },
    });

    TestBed.configureTestingModule({
      declarations: [OptionsPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsPage);
    component = fixture.componentInstance;
    component.user = { name: "User", email: "user@gmail.com" };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(languageServiceSpy.initLanguages).toHaveBeenCalledTimes(1);
  });

  it("should open language chooser", () => {
    component.openLanguageChooser();
    expect(languageServiceSpy.openLanguageChooser).toHaveBeenCalledTimes(1);
  });

  it("should sign out", () => {
    component.signOut();
    expect(authServiceSpy.signOut).toHaveBeenCalledTimes(1);
  });
});
