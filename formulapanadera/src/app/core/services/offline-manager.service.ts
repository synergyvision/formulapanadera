import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StoredRequest } from '../interfaces/stored-request.interface';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage/storage.service';
 
const STORAGE_REQ_KEY = environment.storage_key+'-req';
 
@Injectable({
  providedIn: 'root'
})
export class OfflineManagerService {
 
  constructor(
    private storageService: StorageService,
  ) { }
 
  checkForEvents(): Observable<any> {
    return from(this.storageService.get(STORAGE_REQ_KEY)).pipe(
      switchMap((storedOperations: string) => {
        let storedObj = JSON.parse(storedOperations);
        if (storedObj && storedObj.length > 0) {
          return of(storedObj)
        } else {
          return of([]);
        }
      })
    )
  }
 
  async storeRequest(collection: string, type: 'C' | 'U' | 'D', data: any, originalData: any) {
    let save = true;
    let action: StoredRequest = {
      collection: collection,
      type: type,
      data: data,
      originalData: originalData,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

    if (type == 'C') {
      data.id = action.id;
    }

    let storedREQ = await this.storageService.get(STORAGE_REQ_KEY);
    if (storedREQ) {
      storedREQ = JSON.parse(storedREQ);
      storedREQ.forEach((stored, index) => {
        if (stored.id == data.id) {
          if (type == 'U') {
            data.id = storedREQ[index].id;
            storedREQ[index].data = data;
            save = false;
          }
          if (type == 'D') {
            storedREQ.splice(index, 1);
            save = false;
          }
        }
      })
    }
    if (!save) {
      await this.storageService.set(STORAGE_REQ_KEY, JSON.stringify(storedREQ));
    }
 
    return this.storageService.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations);
 
      if (save) {
        if (storedObj) {
          storedObj.push(action);
        } else {
          storedObj = [action];
        }
      }
      // Save old & new local transactions back to Storage
      return this.storageService.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }

  clearRequests() {
    this.storageService.remove(STORAGE_REQ_KEY);
  }
}