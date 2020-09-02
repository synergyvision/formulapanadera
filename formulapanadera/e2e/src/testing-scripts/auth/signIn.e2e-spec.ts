import { SignInPage } from "../../page-objects/auth/signIn.po";
import { SignUpPage } from "../../page-objects/auth/signUp.po";
import { ForgotPasswordPage } from "../../page-objects/auth/forgotPassword.po";
import { ProductionPage } from "../../page-objects/production/production.po";

describe("Sign In", () => {
  const signInPage = new SignInPage();
  const signUpPage = new SignUpPage();
  const forgotPasswordPage = new ForgotPasswordPage();
  const productionPage = new ProductionPage();

  beforeEach(() => {
    signInPage.load();
  });

  it("should display sign in page", () => {
    expect(signInPage.rootElement().isDisplayed()).toEqual(true);
  });

  describe("before logged in", () => {
    it("allows in-app navigation to sign up", () => {
      signInPage.clickSignUp();
      signUpPage.waitUntilVisible();
      signInPage.waitUntilInvisible();
    });

    it("allows in-app navigation to forgot password", () => {
      signInPage.clickForgotPassword();
      forgotPasswordPage.waitUntilVisible();
      signInPage.waitUntilInvisible();
    });

    it("allows language change", () => {
      signInPage.clickLanguageChange();
      signInPage.waitForLanguageAlert();
      expect(signInPage.getLanguageAlert()).toBeDefined()
    });
  });

  describe("while trying to log in", () => {
    it("displays an error message if the login fails", () => {
      signInPage.enterEmail("user@test.com");
      signInPage.enterPassword("errormessage");
      signInPage.clickSignIn();
      signInPage.waitForError();
      expect(signInPage.getErrorMessage()).toEqual(
        "The password is invalid or the user does not have a password."
      );
    });

    it("navigates to the main page if the login succeeds", () => {
      signInPage.enterEmail("user@test.com");
      signInPage.enterPassword("testtest");
      signInPage.clickSignIn();
      signInPage.waitUntilInvisible();
      productionPage.waitUntilVisible();
    });
  });
});
