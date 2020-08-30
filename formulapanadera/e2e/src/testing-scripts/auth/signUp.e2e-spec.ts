import { SignInPage } from "../../page-objects/auth/signIn.po";
import { SignUpPage } from "../../page-objects/auth/signUp.po";
import { ProductionPage } from "../../page-objects/production/production.po";

describe("Sign Up", () => {
  const signInPage = new SignInPage();
  const signUpPage = new SignUpPage();
  const productionPage = new ProductionPage();

  beforeEach(() => {
    signUpPage.load();
  });

  it("should display sign up page", () => {
    expect(signUpPage.rootElement().isDisplayed()).toEqual(true);
  });

  describe("before signed up", () => {
    it("allows navigation back to sign in", () => {
      signUpPage.clickBackSignIn();
      signInPage.waitUntilVisible();
      signUpPage.waitUntilInvisible();
    });

    it("allows in-app navigation to sign in", () => {
      signUpPage.clickSignIn();
      signInPage.waitUntilVisible();
      signUpPage.waitUntilInvisible();
    });

    it("allows language change", () => {
      signUpPage.clickLanguageChange();
      signUpPage.waitForLanguageAlert();
      expect(signUpPage.getLanguageAlert()).toBeDefined();
    });
  });

  describe("while trying to sign up", () => {
    it("navigates to the main page if the registration succeeds", () => {
      signUpPage.enterName("UserName");
      signUpPage.enterEmail("newuser@test.com");
      signUpPage.enterPassword("testtest");
      signUpPage.enterConfirmPassword("testtest");
      signUpPage.clickSignUp();
      signUpPage.waitUntilInvisible();
      productionPage.waitUntilVisible();
    });

    it("displays an error message if the registration fails", () => {
      signUpPage.enterName("UserName");
      signUpPage.enterEmail("newuser@test.com");
      signUpPage.enterPassword("errormessage");
      signUpPage.enterConfirmPassword("errormessage");
      signUpPage.clickSignUp();
      signUpPage.waitForError();
      expect(signUpPage.getErrorMessage()).toEqual(
        "The email address is already in use by another account."
      );
    });
  });
});
