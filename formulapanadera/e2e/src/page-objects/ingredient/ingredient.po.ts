import { PageObjectBase } from "../base.po";
import { browser, ExpectedConditions, element, by } from "protractor";

export class IngredientPage extends PageObjectBase {
  constructor() {
    super(".ingredient-content", "/menu/ingredient");
  }

  clickCreate() {
    this.clickButton(".create-ingredient");
  }

  waitForModalPresent() {
    browser.wait(
      ExpectedConditions.presenceOf(element(by.css(".show-modal"))),
      3000
    );
  }

  waitForModalNotVisible() {
    browser.wait(
      ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css(".show-modal")))
      ),
      3000
    );
  }

  enterName(name: string) {
    this.enterInputText(".ingredient-name", name);
  }

  enterHydration(hydration: string) {
    this.enterInputText(".ingredient-hydration", hydration);
  }

  clickIsFlour() {
    this.clickButton(".ingredient-is-flour");
  }

  enterCost(cost: string) {
    this.enterInputText(".ingredient-cost", cost);
  }

  clickSubmit() {
    this.clickButton(".submit-btn");
  }

  clickIngredient() {
    this.clickButton(".ingredient-item");
  }

  clickDelete() {
    this.clickButton(".delete-btn");
    this.clickButton(".confirm-alert-accept");
  }

  wait() {
    browser.sleep(2000);
  }
}
