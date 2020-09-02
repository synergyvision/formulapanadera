import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";

import { OptionsPage } from "./options.page";
import { TranslateModule } from "@ngx-translate/core";

import { LanguageService } from "../../../core/services/language.service";
import { AuthService } from "../../../core/services/auth.service";
import { ResolverHelper } from "src/app/utils/helpers/resolver-helper";
import { Observable } from "rxjs";

describe("OptionsPage", () => {
  let component: OptionsPage;
  let fixture: ComponentFixture<OptionsPage>;
  let languageServiceSpy: any;
  let authServiceSpy: any;

  beforeEach(async(() => {
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

    spyOn(ResolverHelper, "extractData").and.callFake(() => {
      return { subscribe: () => {} } as Observable<any>;
    });

    fixture = TestBed.createComponent(OptionsPage);
    component = fixture.componentInstance;
    component.user = { name: "User", email: "user@gmail.com", isShell: false };
    component.ngOnInit = () => {};
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(ResolverHelper.extractData).toHaveBeenCalledTimes(1);
    expect(languageServiceSpy.initLanguages).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe", () => {
    component.subscriptions.unsubscribe = jasmine.createSpy();
    component.ionViewWillLeave();
    expect(component.subscriptions.unsubscribe).toHaveBeenCalledTimes(1);
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
