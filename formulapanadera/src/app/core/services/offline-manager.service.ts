import { Injectable } from '@angular/core';
import { Observable, from, of, forkJoin } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { StoredRequest } from '../interfaces/stored-request.interface';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage/storage.service';
 
const STORAGE_REQ_KEY = environment.storage_key+'req';
 
@Injectable({
  providedIn: 'root'
})
export class OfflineManagerService {
 
  constructor(private storageService: StorageService, private toastController: ToastController) { }
 
  checkForEvents(): Observable<any> {
    console.log("CHECKFOREVENTS")
    return from(this.storageService.get(STORAGE_REQ_KEY)).pipe(
      switchMap((storedOperations: string) => {
        let storedObj = JSON.parse(storedOperations);
        if (storedObj && storedObj.length > 0) {
          return this.sendRequests(storedObj).pipe(
            finalize(() => {
              let toast = this.toastController.create({
                message: `Local data succesfully synced to API!`,
                duration: 3000,
                position: 'bottom'
              });
              toast.then(toast => toast.present());
 
              this.storageService.remove(STORAGE_REQ_KEY);
            })
          );
        } else {
          console.log('no local events to sync');
          return of(false);
        }
      })
    )
  }
 
  storeRequest(collection: string, type: 'C' | 'U' | 'D', data: any, originalData: any) {
    let toast = this.toastController.create({
      message: `Your data is stored locally because you seem to be offline.`,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());
 
    let action: StoredRequest = {
      collection: collection,
      type: type,
      data: data,
      originalData: originalData,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 
    return this.storageService.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations);
 
      if (storedObj) {
        storedObj.push(action);
      } else {
        storedObj = [action];
      }
      // Save old & new local transactions back to Storage
      return this.storageService.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }
 
  sendRequests(operations: StoredRequest[]) {
    let obs = [];
 
    for (let op of operations) {
      console.log('Make one request: ', op);
      //let oneObs = this.http.request(op.type, op.url, op.data);
      obs.push(op);
    }
 
    // Send out all local events and return once they are finished
    return forkJoin(obs);
  }
}