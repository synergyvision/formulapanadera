import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) { }

  public async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    console.log("STORAGE CREATED")
  }

  public set(key: string, value: any): Promise<any> {
    return this._storage?.set(key, value);
  }

  public get(key: string): Promise<any>  {
    return this._storage?.get(key);
  }

  public remove(key: string): Promise<any>  {
    return this._storage?.remove(key);
  }

  public clear(): Promise<any>  {
    return this._storage?.clear();
  }
}