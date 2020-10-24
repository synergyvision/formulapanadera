import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { LanguageModel } from '../../models/language.model';

const { Storage } = Plugins;

@Injectable()
export class LanguageStorageService {
  private key = "language";

  constructor() {}

  public async getLanguage(): Promise<LanguageModel> {
    let language: LanguageModel;
    await Storage.get({ key: this.key }).then((data) => {
      if (data.value) {
        language = JSON.parse(data.value);
      }
    });
    return language;
  }

  public async setLanguage(language: LanguageModel): Promise<void> {
    let storage_language = JSON.stringify(language);
    Storage.set({ key: this.key, value: storage_language });
  }
}
