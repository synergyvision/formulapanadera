import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

import { COLLECTIONS } from "src/app/config/firebase";
import { UserGroupModel, UserModel } from '../../models/user.model';

@Injectable()
export class UserCRUDService {
  collection = COLLECTIONS.user;

  constructor(
    private afs: AngularFirestore,
  ) { }

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

  public async getUser(email: string): Promise<UserModel> {
    let docs = await this.afs.collection<UserModel>(this.collection).ref.where("email", "==", email).get()
    if (docs.docs[0]?.exists) {
      let user = docs.docs[0].data() as UserModel;
      return user;
    }
    return new UserModel;
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
    const data = { name: userData.name, email: userData.email, user_groups: userData.user_groups }
    return this.afs
      .collection(this.collection)
      .doc(userData.id)
      .set(JSON.parse(JSON.stringify(data)));
  }

  public createUserGroup(userData: UserModel, groupData: UserGroupModel): Promise<void> {
    let id = this.afs.createId();
    groupData.id = id;
    userData.user_groups.push(groupData);
    return this.afs
      .collection(this.collection)
      .doc(userData.id)
      .set(JSON.parse(JSON.stringify(userData)));
  }

  public updateUserGroup(userData: UserModel): Promise<void> {
    return this.afs
      .collection(this.collection)
      .doc(userData.id)
      .set(JSON.parse(JSON.stringify(userData)));
  }

  public deleteUser(userKey: string): Promise<void> {
    return this.afs.collection(this.collection).doc(userKey).delete();
  }
}
