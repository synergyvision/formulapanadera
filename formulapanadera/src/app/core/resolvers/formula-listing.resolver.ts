import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { FormulaService } from "../services/formula.service";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "../models/formula.model";

@Injectable()
export class FormulaListingResolver implements Resolve<any> {
  constructor(private formulaService: FormulaService) {}

  resolve() {
    const dataSource: Observable<Array<
      FormulaModel
    >> = this.formulaService.getFormulasDataSource();

    const dataStore: DataStore<Array<
      FormulaModel
    >> = this.formulaService.getFormulasStore(dataSource);

    return dataStore;
  }
}
