import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { ProductionStorageModel } from "../../models/production.model";

const { Storage } = Plugins;

@Injectable()
export class ProductionInProcessStorageService {
  private key = "production-in-process";

  constructor() {}

  public async getProduction(): Promise<ProductionStorageModel> {
    let production: ProductionStorageModel;
    await Storage.get({ key: this.key }).then((data) => {
      if (data.value) {
        production = JSON.parse(data.value);
      }
    });
    return production;
  }

  public async setProduction(
    production: ProductionStorageModel
  ): Promise<void> {
    await Storage.set({ key: this.key, value: JSON.stringify(production) });
  }

  public async deleteProduction() {
    await Storage.set({ key: this.key, value: null });
  }
}
