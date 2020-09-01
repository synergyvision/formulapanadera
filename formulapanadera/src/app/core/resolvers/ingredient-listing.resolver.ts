import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { IngredientService } from "../services/ingredient.service";
import { IngredientModel } from "../models/ingredient.model";
import { DataStore } from "src/app/shared/shell/data-store";

@Injectable()
export class IngredientListingResolver implements Resolve<any> {
  constructor(private ingredientService: IngredientService) {}

  resolve() {
    const dataSource: Observable<Array<
      IngredientModel
    >> = this.ingredientService.getIngredientsDataSource();

    const dataStore: DataStore<Array<
      IngredientModel
    >> = this.ingredientService.getIngredientsStore(dataSource);

    return dataStore;
  }
}
