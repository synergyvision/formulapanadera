import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";

import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "../models/formula.model";
import { Observable } from "rxjs";

@Injectable()
export class FormulaService {
  private formulaDataStore: DataStore<Array<FormulaModel>>;

  constructor(private afs: AngularFirestore) {}

  /*
    Formula Listing Page
  */
  public getFormulasDataSource(): Observable<Array<FormulaModel>> {
    return this.afs
      .collection<FormulaModel>("formulas")
      .valueChanges({ idField: "id" });
  }

  public getFormulasStore(
    dataSource: Observable<Array<FormulaModel>>
  ): DataStore<Array<FormulaModel>> {
    // Use cache if available
    if (!this.formulaDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<FormulaModel> = [
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
        new FormulaModel(),
      ];

      this.formulaDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.formulaDataStore.load(dataSource);
    }
    return this.formulaDataStore;
  }

  /*
    Formula Management
  */
  public createFormula(formulaData: FormulaModel): Promise<DocumentReference> {
    return this.afs.collection("formulas").add({ ...formulaData });
  }

  public updateFormula(formulaData: FormulaModel): Promise<void> {
    return this.afs
      .collection("formulas")
      .doc(formulaData.id)
      .set({ ...formulaData });
  }

  public deleteFormula(formulaKey: string): Promise<void> {
    return this.afs.collection("formulas").doc(formulaKey).delete();
  }

  /*
  Formula calculations
  */
  public calculateBakersPercentage(units: number, formula: FormulaModel): string {
    let total_weight: number = units * formula.unit_weight;
    let percentage: number = 0;
    formula.ingredients.forEach((ingredientData) => {
      percentage = percentage + Number(ingredientData.percentage);
    });
    return (total_weight / percentage).toFixed(2);
  }

  public calculateHydration(formula: FormulaModel): string {
    let hydration: number = 0;
    formula.ingredients.forEach((ingredientData) => {
      hydration =
        ingredientData.percentage * ingredientData.ingredient.hydration +
        hydration;
    });
    return (hydration / 100).toFixed(1);
  }

  public calculateTotalCost(
    formula: FormulaModel,
    bakery_percentage: number
  ): string {
    let cost: number = 0;
    formula.ingredients.forEach((ingredientData) => {
      cost =
        ingredientData.percentage *
          bakery_percentage *
          ingredientData.ingredient.cost +
        cost;
    });
    return cost.toFixed(2);
  }

  public fromRecipeToFormula(formula: FormulaModel) {
    let flour = 0;
    formula.ingredients.forEach((ingredient) => {
      if (ingredient.ingredient.is_flour) {
        flour = flour + ingredient.percentage;
      }
    });

    let bakers_percentage = flour / 100;
    formula.ingredients.forEach((ingredient) => {
      ingredient.percentage = Number(
        (ingredient.percentage / Number(bakers_percentage)).toFixed(1)
      );
    });
    return formula.ingredients;
  }
}
