import { PageObjectBase } from "../base.po";

export class FormulaPage extends PageObjectBase {
  constructor() {
    super(".formula-content", "/menu/formula");
  }
}
