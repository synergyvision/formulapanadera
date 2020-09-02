import { PageObjectBase } from "../base.po";

export class IngredientPage extends PageObjectBase {
  constructor() {
    super(".ingredient-content", "/menu/ingredient");
  }
}
