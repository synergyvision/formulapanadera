import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { ProductionModel } from "../../models/production.model";
import { COLLECTIONS } from "src/app/config/firebase";

@Injectable()
export class ProductionCRUDService {
  collection = COLLECTIONS.production;

  constructor(private afs: AngularFirestore) {}

  /*
    Production Collection
  */
  public getProductionsDataSource(
    user_email: string
  ): Observable<Array<ProductionModel>> {
    return this.afs
      .collection<ProductionModel>(this.collection, (ref) =>
        ref.where("owner.email", "==", user_email)
      )
      .valueChanges({ idField: "id" });
  }

  /*
    Production Management
  */
  public createProduction(
    productionData: ProductionModel
  ): Promise<DocumentReference> {
    return this.afs.collection(this.collection).add({ ...productionData });
  }

  public updateProduction(productionData: ProductionModel): Promise<void> {
    return this.afs
      .collection(this.collection)
      .doc(productionData.id)
      .set({ ...productionData });
  }

  public deleteProduction(productionKey: string): Promise<void> {
    return this.afs.collection(this.collection).doc(productionKey).delete();
  }
}
