import { PageObjectBase } from "../base.po";

export class ProductionPage extends PageObjectBase {
  constructor() {
    super(".production-content", "/menu/production");
  }
}
