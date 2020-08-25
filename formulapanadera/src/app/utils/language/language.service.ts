import { Injectable } from "@angular/core";
import { LanguageModel } from "./language.model";

import { environment } from "../../../environments/environment";

@Injectable()
export class LanguageService {
  languages: Array<LanguageModel> = new Array<LanguageModel>();

  constructor() {
    this.languages = environment.language.available;
  }

  getLanguages() {
    return this.languages;
  }
}
