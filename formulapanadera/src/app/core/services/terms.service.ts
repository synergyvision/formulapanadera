import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable()
export class TermsService {
  baseUrl = '/data/terms_';

  constructor(
    private afDB: AngularFirestore,
    private translateService: TranslateService
  ) { }

  getTerms(): Observable<any> {
    return this.afDB.collection<any>(this.baseUrl + this.translateService.currentLang).valueChanges();
  }
}
