import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";

import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "../models/formula.model";
import { Observable, of } from "rxjs";

@Injectable()
export class FormulaService {
  private formulaDataStore: DataStore<Array<FormulaModel>>;

  constructor(private afs: AngularFirestore) {}

  /*
    Formula Listing Page
  */
  public getFormulasDataSource(
    user_email: string
  ): Observable<Array<FormulaModel>> {
    return this.afs
      .collection<FormulaModel>(
        "formulas"
        // (ref) =>
        // ref.where("useremail", "==", user_email)
      )
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

  //Filters
  public searchFormulasByHydration(
    lower: number,
    upper: number
  ): Observable<Array<FormulaModel>> {
    const filtered = [];
    let hydration: number;
    this.formulaDataStore.state.forEach((ingredient) => {
      ingredient.forEach((item) => {
        hydration = Number(this.calculateHydration(item));
        if (hydration >= lower && hydration <= upper) {
          filtered.push(item);
        }
      });
    });
    return of(filtered);
  }

  public searchFormulasByCost(
    lower: number,
    upper: number,
    formulas: Observable<Array<FormulaModel>>
  ): Observable<Array<FormulaModel>> {
    const filtered = [];
    let bakers_percentage: number;
    let cost: number;
    formulas.forEach((formula) => {
      formula.forEach((item) => {
        bakers_percentage = Number(
          this.calculateBakersPercentage(item.units, item)
        );
        cost =
          Number(this.calculateTotalCost(item, bakers_percentage)) / item.units;
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

  public searchFormulasByShared(
    type: string,
    formulas: Array<FormulaModel>
  ): Array<FormulaModel> {
    const filtered = [];
    formulas.forEach((item) => {
      if (item.shared == (type == "shared")) {
        filtered.push(item);
      }
    });
    return filtered;
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
  public calculateBakersPercentage(
    units: number,
    formula: FormulaModel
  ): string {
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
    bakers_percentage: number
  ): string {
    let cost: number = 0;
    formula.ingredients.forEach((ingredientData) => {
      cost =
        ingredientData.percentage *
          bakers_percentage *
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
