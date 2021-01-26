import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { ProductionModel } from "../../models/production.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { map } from "rxjs/operators";

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
        ref.where("user.owner", "in", [user_email, ""])
      )
      .valueChanges({ idField: "id" });
  }

  public getProduction(
    id: string
  ): Observable<ProductionModel> {
    return this.afs.collection<ProductionModel>(this.collection).doc(id).snapshotChanges()
    .pipe(
      map( a => {
        const data = a.payload.data();
        return data as ProductionModel;
      })
    );
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
