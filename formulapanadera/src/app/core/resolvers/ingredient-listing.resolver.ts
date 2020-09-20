import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";

import { IngredientModel } from "../models/ingredient.model";
import { DataStore } from "src/app/shared/shell/data-store";
import { IngredientService } from "../services/ingredient.service";
import { IngredientCRUDService } from '../services/firebase/ingredient.service';

@Injectable()
export class IngredientListingResolver implements Resolve<any> {
  constructor(
    private ingredientService: IngredientService,
    private ingredientCRUDService: IngredientCRUDService
  ) {}

  resolve() {
    const dataSource: Observable<Array<
      IngredientModel
    >> = this.ingredientCRUDService.getIngredientsDataSource();

    const dataStore: DataStore<Array<
      IngredientModel
    >> = this.ingredientService.getIngredientsStore(dataSource);

    return dataStore;
  }
}
