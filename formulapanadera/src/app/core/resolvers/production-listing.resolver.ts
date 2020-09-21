import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";

import { DataStore } from "src/app/shared/shell/data-store";
import { UserModel } from "../models/user.model";
import { ProductionService } from "../services/production.service";
import { UserStorageService } from "../services/storage/user.service";
import { ProductionCRUDService } from "../services/firebase/production.service";
import { ProductionModel } from "../models/production.model";

@Injectable()
export class ProductionListingResolver implements Resolve<any> {
  constructor(
    private productionService: ProductionService,
    private productionCRUDService: ProductionCRUDService,
    private userStorageService: UserStorageService
  ) {}

  async resolve() {
    let user: UserModel;
    user = await this.userStorageService.getUser();
    if (user) {
      const dataSource: Observable<Array<
        ProductionModel
      >> = this.productionCRUDService.getProductionsDataSource(user.email);

      const dataStore: DataStore<Array<
        ProductionModel
      >> = this.productionService.getProductionsStore(dataSource);

      return dataStore;
    }
  }
}
