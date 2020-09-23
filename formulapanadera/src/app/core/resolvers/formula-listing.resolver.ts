import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";

import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "../models/formula.model";
import { UserModel } from "../models/user.model";
import { FormulaService } from "../services/formula.service";
import { FormulaCRUDService } from "../services/firebase/formula.service";
import { UserStorageService } from "../services/storage/user.service";

@Injectable()
export class FormulaListingResolver implements Resolve<any> {
  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    private userStorageService: UserStorageService
  ) {}

  async resolve() {
    let user: UserModel;
    user = await this.userStorageService.getUser();
    if (user) {
      const dataSource: Observable<Array<
        FormulaModel
      >> = this.formulaCRUDService.getFormulasDataSource(user.email);

      const dataStore: DataStore<Array<
        FormulaModel
      >> = this.formulaService.getFormulasStore(dataSource);

      return dataStore;
    }
  }
}
