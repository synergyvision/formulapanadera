import { Injectable } from '@angular/core';
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
 
  async getStoredRequests() {
    return this.storageService.get(STORAGE_REQ_KEY)
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

  async clearRequest(finishedReq: StoredRequest) {
    let storedREQ = await this.storageService.get(STORAGE_REQ_KEY);
    if (storedREQ) {
      storedREQ = JSON.parse(storedREQ);
      storedREQ.forEach((stored, index) => {
        if (stored.id == finishedReq.id) {
            storedREQ.splice(index, 1);
        }
      })
    }
    await this.storageService.set(STORAGE_REQ_KEY, JSON.stringify(storedREQ));
  }

  async hasStoredRequests() {
    let storedREQ = await this.storageService.get(STORAGE_REQ_KEY);
    if (storedREQ) {
      storedREQ = JSON.parse(storedREQ);
      if (storedREQ.length > 0) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  clearRequests() {
    this.storageService.remove(STORAGE_REQ_KEY);
    this.storageService.clear();
  }
}