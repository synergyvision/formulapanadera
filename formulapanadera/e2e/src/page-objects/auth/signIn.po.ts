import { PageObjectBase } from "../base.po";
import { browser, ExpectedConditions, element, by } from 'protractor';

export class SignInPage extends PageObjectBase {
  constructor() {
    super(".login-content", "/auth/sign-in");
  }

  clickSignUp() {
    this.clickButton(".signup-btn");
  }

  clickForgotPassword() {
    this.clickButton(".forgot-btn");
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

  enterPassword(password: string) {
    this.enterInputText(".password-input", password);
  }

  clickSignIn() {
    this.clickButton(".login-btn");
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
