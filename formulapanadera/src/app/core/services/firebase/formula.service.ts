import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { FormulaModel } from "../../models/formula.model";
import { COLLECTIONS } from "src/app/config/firebase";

@Injectable()
export class FormulaCRUDService {
  collection = COLLECTIONS.formula;

  constructor(private afs: AngularFirestore) {}

  /*
    Formula Collection
  */
  public getFormulasDataSource(
    user_email: string
  ): Observable<Array<FormulaModel>> {
    return this.afs
      .collection<FormulaModel>(this.collection, (ref) =>
        ref.where("user.owner", "in", [user_email, ""])
      )
      .valueChanges({ idField: "id" });
  }

  /*
    Formula Management
  */
  public createFormula(formulaData: FormulaModel): Promise<DocumentReference> {
    return this.afs.collection(this.collection).add({ ...formulaData });
  }

  public updateFormula(formulaData: FormulaModel): Promise<void> {
    return this.afs
      .collection(this.collection)
      .doc(formulaData.id)
      .set({ ...formulaData });
  }

  public deleteFormula(formulaKey: string): Promise<void> {
    return this.afs.collection(this.collection).doc(formulaKey).delete();
  }
}