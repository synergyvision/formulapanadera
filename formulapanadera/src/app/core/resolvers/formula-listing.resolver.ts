import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "../models/formula.model";
import { Plugins } from "@capacitor/core";
import { UserModel } from "../models/user.model";

import { FormulaService } from "../services/formula.service";
import { FormulaCRUDService } from "../services/firebase/formula.service";

const { Storage } = Plugins;

@Injectable()
export class FormulaListingResolver implements Resolve<any> {
  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService
  ) {}

  async resolve() {
    let user: UserModel;
    await Storage.get({ key: "user" }).then((data) => {
      if (data.value) {
        user = JSON.parse(data.value);
      }
    });
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
