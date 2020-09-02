import { OptionsPage } from "../../page-objects/settings/options.po";
import { SignInPage } from "../../page-objects/auth/signIn.po";
import { TabsPage } from "../../page-objects/tabs/tabs.po";
import { ChangePasswordPage } from "../../page-objects/settings/changePassword.po";

describe("Settings - Options", () => {
  const optionsPage = new OptionsPage();
  const tabsPage = new TabsPage();
  const signInPage = new SignInPage();
  const changePasswordPage = new ChangePasswordPage();

  beforeAll(() => {
    signInPage.load();
    signInPage.enterEmail("user@test.com");
    signInPage.enterPassword("testtest");
    signInPage.clickSignIn();
  });

  beforeEach(() => {
    tabsPage.navigateToSettings();
  });

  it("should display options page", () => {
    expect(optionsPage.rootElement().isDisplayed()).toEqual(true);
  });

  it("allows language change", () => {
    optionsPage.clickLanguageChange();
    optionsPage.waitForLanguageAlert();
    expect(optionsPage.getLanguageAlert()).toBeDefined();
    optionsPage.cancelLanguageChange()
  });

  it("allows in-app navigation to change password", () => {
    optionsPage.clickChangePassword();
    changePasswordPage.waitUntilVisible();
    optionsPage.waitUntilInvisible();
  });

  it("allows sign out", () => {
    optionsPage.clickSignOut();
    signInPage.waitUntilVisible();
    optionsPage.waitUntilInvisible();
  });
});
