import { ChangePasswordPage } from "../../page-objects/settings/changePassword.po";
import { SignInPage } from "../../page-objects/auth/signIn.po";
import { TabsPage } from "../../page-objects/tabs/tabs.po";
import { OptionsPage } from "../../page-objects/settings/options.po";

describe("Settings - Change Password", () => {
  const changePasswordPage = new ChangePasswordPage();
  const tabsPage = new TabsPage();
  const signInPage = new SignInPage();
  const optionsPage = new OptionsPage();

  beforeAll(() => {
    signInPage.load();
    signInPage.enterEmail("user@test.com");
    signInPage.enterPassword("testtest");
    signInPage.clickSignIn();
  });

  beforeEach(() => {
    tabsPage.navigateToSettings();
    optionsPage.clickChangePassword();
  });

  it("should display change password page", () => {
    expect(changePasswordPage.rootElement().isDisplayed()).toEqual(true);
  });

  describe("before trying to change password", () => {
    it("allows navigation back to settings options", () => {
      changePasswordPage.clickBackOptions();
      optionsPage.waitUntilVisible();
      changePasswordPage.waitUntilInvisible();
    });
  });

  describe("while trying to change password", () => {
    it("navigates to the settings options page if the password change succeeds", () => {
      changePasswordPage.enterPassword("testtest");
      changePasswordPage.enterConfirmPassword("testtest");
      changePasswordPage.clickChangePassword();
      changePasswordPage.waitUntilInvisible();
      optionsPage.waitUntilVisible();
    });
  });
});
