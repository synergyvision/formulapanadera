import { PageObjectBase } from "../base.po";

export class TabsPage extends PageObjectBase {
  constructor() {
    super(".tabs-content", "/menu/production");
  }

  navigateToProduction() {
    this.clickButton("#tab-button-production");
  }

  navigateToFormulas() {
    this.clickButton("#tab-button-formula");
  }

  navigateToIngredients() {
    this.clickButton("#tab-button-ingredient");
  }

  navigateToSettings() {
    this.clickButton("#tab-button-settings");
  }
}
