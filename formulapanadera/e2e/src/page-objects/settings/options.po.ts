import { PageObjectBase } from "../base.po";
import { browser, ExpectedConditions, element, by } from "protractor";

export class OptionsPage extends PageObjectBase {
  constructor() {
    super(".options-content", "/menu/settings");
  }

  clickLanguageChange() {
    this.clickButton(".change-language-option");
  }

  waitForLanguageAlert() {
    browser.wait(
      ExpectedConditions.presenceOf(element(by.css(".change-language-option"))),
      3000
    );
  }

  getLanguageAlert() {
    return element(by.css(".language-alert"));
  }

  cancelLanguageChange() {
    return this.clickButton(".alert-button-role-cancel");
  }

  clickChangePassword() {
    this.clickButton(".change-password-option");
  }

  clickSignOut() {
    this.clickButton(".sign-out-option");
  }
}
