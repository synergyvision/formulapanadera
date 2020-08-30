import { PageObjectBase } from "../base.po";
import { browser, ExpectedConditions, element, by } from "protractor";

export class ChangePasswordPage extends PageObjectBase {
  constructor() {
    super(".change-password-content", "/menu/settings/change-password");
  }

  clickBackOptions() {
    this.clickButton(".show-back-button");
  }

  enterPassword(password: string) {
    this.enterInputText(".password-input", password);
  }

  enterConfirmPassword(password: string) {
    this.enterInputText(".confirm-password-input", password);
  }

  clickChangePassword() {
    this.clickButton(".change-password-btn");
  }

  waitForError() {
    browser.wait(
      ExpectedConditions.presenceOf(element(by.css(".error-message"))),
      3000
    );
  }

  getErrorMessage() {
    return element(by.css(".error-message")).getText();
  }
}
