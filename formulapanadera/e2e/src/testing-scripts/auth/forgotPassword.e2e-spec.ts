import { ForgotPasswordPage } from "../../page-objects/auth/forgotPassword.po";
import { SignInPage } from "../../page-objects/auth/signIn.po";

describe("Reset Password", () => {
  const forgotPasswordPage = new ForgotPasswordPage();
  const signInPage = new SignInPage();

  beforeEach(() => {
    forgotPasswordPage.load();
  });

  it("should display forgot password page", () => {
    expect(forgotPasswordPage.rootElement().isDisplayed()).toEqual(true);
  });

  describe("before recover password", () => {
    it("allows navigation back to sign in", () => {
      forgotPasswordPage.clickBackSignIn();
      signInPage.waitUntilVisible();
      forgotPasswordPage.waitUntilInvisible();
    });

    it("allows language change", () => {
      forgotPasswordPage.clickLanguageChange();
      forgotPasswordPage.waitForLanguageAlert();
      expect(forgotPasswordPage.getLanguageAlert()).toBeDefined();
    });
  });

  describe("while trying to recover password", () => {
    it("navigates to the sign in page if the recovering succeeds", () => {
      forgotPasswordPage.enterEmail("recover@test.com");
      forgotPasswordPage.clickRecoverPassword();
      forgotPasswordPage.waitUntilInvisible();
      signInPage.waitUntilVisible();
    });

    it("displays an error message if the recovering fails", () => {
      forgotPasswordPage.enterEmail("notuser@test.com");
      forgotPasswordPage.clickRecoverPassword();
      forgotPasswordPage.waitForError();
      expect(forgotPasswordPage.getErrorMessage()).toEqual(
        "There is no user record corresponding to this identifier. The user may have been deleted."
      );
    });
  });
});
