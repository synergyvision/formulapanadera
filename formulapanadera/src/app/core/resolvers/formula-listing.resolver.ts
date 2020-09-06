import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { FormulaService } from "../services/formula.service";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "../models/formula.model";
import { AuthService } from "../services/auth.service";

@Injectable()
export class FormulaListingResolver implements Resolve<any> {
  constructor(
    private formulaService: FormulaService,
    private authService: AuthService
  ) {}

  resolve() {
    let user = this.authService.getLoggedInUser();
    const dataSource: Observable<Array<
      FormulaModel
    >> = this.formulaService.getFormulasDataSource(user.email);

    const dataStore: DataStore<Array<
      FormulaModel
    >> = this.formulaService.getFormulasStore(dataSource);

    return dataStore;
  }
}
