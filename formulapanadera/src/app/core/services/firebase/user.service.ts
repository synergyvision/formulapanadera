import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

import { COLLECTIONS } from "src/app/config/firebase";
import { UserGroupModel, UserModel } from '../../models/user.model';
import { NetworkService } from "../network.service";
import { StorageService } from "../storage/storage.service";
import { environment } from "src/environments/environment";
import { OfflineManagerService } from "../offline-manager.service";

const API_STORAGE_KEY = environment.storage_key;

@Injectable()
export class UserCRUDService {
  collection = COLLECTIONS.user;

  constructor(
    private afs: AngularFirestore,
    private networkService: NetworkService,
    private storageService: StorageService,
    private offlineManager: OfflineManagerService
  ) { }

  /*
    User Collection
  */
  public getUserDataSource(uid: string): Observable<UserModel> {
    return this.afs.doc(`${this.collection}/${uid}`).get()
      .pipe(
        map(a => {
          let userData: any = a.data();
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

  // Save result of API requests
  public setLocalData(data: any) {
    this.storageService.set(`${API_STORAGE_KEY}-${this.collection}`, data);
  }
 
  // Get cached API result
  public getLocalData() {
    return this.storageService.get(`${API_STORAGE_KEY}-${this.collection}`);
  }
}
