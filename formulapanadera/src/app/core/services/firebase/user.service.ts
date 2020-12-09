import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

import { COLLECTIONS } from "src/app/config/firebase";
import { UserModel } from '../../models/user.model';

@Injectable()
export class UserCRUDService {
  collection = COLLECTIONS.user;

  constructor(private afs: AngularFirestore) {}

  /*
    User Collection
  */
  public getUserDataSource(uid: string): Observable<UserModel> {
    return this.afs.doc(`${this.collection}/${uid}`).snapshotChanges()
    .pipe(
      map( a => {
        let userData: any = a.payload.data();
        return userData as UserModel;
      })
    );
  }

  /*
    User Management
  */
  public createUser(
    uid: string,
    userData: UserModel
  ): Promise<void> {
    return this.afs.collection(this.collection).doc(uid).set({...userData});
  }

  public updateUser(userData: UserModel): Promise<void> {
    return this.afs
      .collection(this.collection)
      .doc(userData.id)
      .set({ ...userData });
  }

  public deleteUser(userKey: string): Promise<void> {
    return this.afs.collection(this.collection).doc(userKey).delete();
  }
}
