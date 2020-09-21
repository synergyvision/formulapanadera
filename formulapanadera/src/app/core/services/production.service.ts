import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { DataStore } from "src/app/shared/shell/data-store";

import { LOADING_ITEMS } from "src/app/config/configuration";
import { ProductionModel } from "../models/production.model";

@Injectable()
export class ProductionService {
  private productionDataStore: DataStore<Array<ProductionModel>>;

  constructor() {}

  /*
    Formula Listing
  */
  public getProductionsStore(
    dataSource: Observable<Array<ProductionModel>>
  ): DataStore<Array<ProductionModel>> {
    // Use cache if available
    if (!this.productionDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<ProductionModel> = [];
      for (let index = 0; index < LOADING_ITEMS; index++) {
        shellModel.push(new ProductionModel());
      }

      this.productionDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.productionDataStore.load(dataSource);
    }
    return this.productionDataStore;
  }
}
