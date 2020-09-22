import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

import { DataStore } from "src/app/shared/shell/data-store";

import { LOADING_ITEMS } from "src/app/config/configuration";
import {
  FormulaPresentModel,
  ProductionModel,
} from "../models/production.model";
import { IngredientPercentageModel } from "../models/formula.model";
import { DECIMALS } from "src/app/config/formats";
import { FormulaService } from "./formula.service";

@Injectable()
export class ProductionService {
  private productionDataStore: DataStore<Array<ProductionModel>>;

  constructor(private formulaService: FormulaService) {}

  /*
    Production Listing
  */
  public getProductionsStore(
    dataSource: Observable<Array<ProductionModel>>
  ): DataStore<Array<ProductionModel>> {
    // Use cache if available
    if (!this.productionDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<ProductionModel> = [];
      for (let index = 0; index < LOADING_ITEMS; index++) {
        shellModel.push(new ProductionModel());
      }

      this.productionDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.productionDataStore.load(dataSource);
    }
    return this.productionDataStore;
  }

  /*
  Production filters
  */
  searchProductionsByCost(
    lower: number,
    upper: number
  ): Observable<Array<ProductionModel>> {
    const filtered = [];
    let cost: number;
    this.productionDataStore.state.forEach((productions) => {
      productions.forEach((item) => {
        cost = this.calculateProductionCost(item);
        if (
          (cost >= lower || lower == null) &&
          (cost <= upper || upper == null)
        ) {
          filtered.push(item);
        }
      });
    });
    return of(filtered);
  }

  /*
  Production calculations
  */
  public calculateTotalUnits(formulas: Array<FormulaPresentModel>): number {
    let units: number = 0;
    formulas.forEach((data) => {
      units = units + data.number;
    });
    return units;
  }

  public calculateTotalCost(formulas: Array<FormulaPresentModel>): number {
    let cost: number = 0;
    formulas.forEach((data) => {
      cost = cost + Number(data.total_cost);
    });
    return cost;
  }

  public calculateProductionCost(production: ProductionModel): number {
    let cost = 0;
    let bakers_percentage: number;

    production.formulas.forEach((formula) => {
      bakers_percentage = Number(
        this.formulaService.calculateBakersPercentage(
          formula.number * formula.formula.unit_weight,
          formula.formula.ingredients
        )
      );
      cost =
        cost +
        Number(
          this.formulaService.calculateTotalCost(
            formula.formula.ingredients,
            bakers_percentage
          )
        );
    });

    return cost;
  }

  public calculateTotalIngredients(
    formulas: Array<FormulaPresentModel>
  ): Array<IngredientPercentageModel> {
    let ingredients: Array<IngredientPercentageModel> = [];
    let exists: boolean;
    formulas.forEach((formula) => {
      formula.formula.ingredients.forEach((ingredient) => {
        exists = false;
        ingredients.forEach((pushed_ingredient) => {
          if (pushed_ingredient.ingredient.id === ingredient.ingredient.id) {
            exists = true;
            pushed_ingredient.percentage =
              pushed_ingredient.percentage +
              ingredient.percentage * Number(formula.bakers_percentage);
          }
        });
        if (!exists) {
          ingredients.push({
            ingredient: ingredient.ingredient,
            percentage:
              ingredient.percentage * Number(formula.bakers_percentage),
          });
        }
      });
    });
    ingredients.forEach((item) => {
      item.percentage = Number(item.percentage.toFixed(DECIMALS.formula_grams));
    });
    return ingredients;
  }
}
