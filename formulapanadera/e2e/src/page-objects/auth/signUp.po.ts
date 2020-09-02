import { PageObjectBase } from "../base.po";
import { browser, ExpectedConditions, element, by } from "protractor";

export class SignUpPage extends PageObjectBase {
  constructor() {
    super(".signup-content", "/auth/sign-up");
  }

  clickBackSignIn() {
    this.clickButton(".show-back-button");
  }

  clickSignIn() {
    this.clickButton(".login-btn");
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

  enterName(name: string) {
    this.enterInputText(".name-input", name);
  }

  enterEmail(email: string) {
    this.enterInputText(".email-input", email);
  }

  enterPassword(password: string) {
    this.enterInputText(".password-input", password);
  }

  enterConfirmPassword(password: string) {
    this.enterInputText(".confirm-password-input", password);
  }

  clickSignUp() {
    this.clickButton(".signup-btn");
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
