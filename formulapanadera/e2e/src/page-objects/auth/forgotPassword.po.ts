import { PageObjectBase } from "../base.po";
import { browser, ExpectedConditions, element, by } from "protractor";

export class ForgotPasswordPage extends PageObjectBase {
  constructor() {
    super(".forgot-password-content", "/auth/forgot-password");
  }

  clickBackSignIn() {
    this.clickButton(".show-back-button");
  }

  clickLanguageChange() {
    this.clickButton(".language-btn");
  }

  waitForLanguageAlert() {
    browser.wait(
      ExpectedConditions.presenceOf(element(by.css(".language-btn"))),
      3000
    );
  }

  getLanguageAlert() {
    return element(by.css(".language-alert"));
  }

  enterEmail(email: string) {
    this.enterInputText(".email-input", email);
  }

  clickRecoverPassword() {
    this.clickButton(".reset-password-btn");
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
