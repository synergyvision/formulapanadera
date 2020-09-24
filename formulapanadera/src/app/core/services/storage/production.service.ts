import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { ProductionModel } from "../../models/production.model";

const { Storage } = Plugins;

@Injectable()
export class ProductionStorageService {
  private key = "production";

  constructor() {}

  public async getProductions(): Promise<ProductionModel[] & ShellModel> {
    let productions: ProductionModel[] & ShellModel;
    await Storage.get({ key: this.key }).then((data) => {
      if (data.value) {
        productions = JSON.parse(data.value);
      }
    });
    return productions;
  }

  public async setProductions(
    productions: ProductionModel[] & ShellModel
  ): Promise<void> {
    let storage_production = JSON.stringify(productions);
    Storage.set({ key: this.key, value: storage_production });
  }

  public async createProduction(production: ProductionModel) {
    let productions: ProductionModel[] & ShellModel;
    await Storage.get({ key: this.key }).then((productionsStorage) => {
      productions = JSON.parse(productionsStorage.value);
    });
    productions.push(production);
    let storage_production = JSON.stringify(productions);
    await Storage.set({ key: this.key, value: storage_production });
  }

  public async updateProduction(production: ProductionModel) {
    let productions: ProductionModel[] & ShellModel;
    await Storage.get({ key: this.key }).then((productionsStorage) => {
      productions = JSON.parse(productionsStorage.value);
    });
    productions.forEach((element, i) => {
      if (element.id === production.id) {
        productions.splice(i, 1, production);
      }
    });
    let storage_production = JSON.stringify(productions);
    await Storage.set({ key: this.key, value: storage_production });
  }

  public async deleteProduction(production_key: string) {
    let productions: ProductionModel[] & ShellModel;
    await Storage.get({ key: this.key }).then((productionsStorage) => {
      productions = JSON.parse(productionsStorage.value);
    });
    productions.forEach((element, i) => {
      if (element.id === production_key) {
        productions.splice(i, 1);
      }
    });
    let storage_production = JSON.stringify(productions);
    await Storage.set({ key: this.key, value: storage_production });
  }
}
