import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { SettingsModel } from "../../models/settings.model";

const { Storage } = Plugins;

@Injectable()
export class SettingsStorageService {
  private key = "settings";

  constructor() {}

  public async getSettings(): Promise<SettingsModel> {
    let settings: SettingsModel;
    await Storage.get({ key: this.key }).then((data) => {
      if (data.value) {
        settings = JSON.parse(data.value);
      }
    });
    return settings;
  }

  public async setSettings(settings: SettingsModel): Promise<void> {
    let storage_settings = JSON.stringify(settings);
    Storage.set({ key: this.key, value: storage_settings });
  }
}
