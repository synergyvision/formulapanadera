import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_WEB_NEWS } from 'src/app/config/configuration';

@Injectable()
export class FaqService {

  baseUrl = BASE_WEB_NEWS + 'faq/faq.json';

  constructor(
    private http: HttpClient
  ) { }

  getFAQs() {
    return this.http.get<any>(this.baseUrl);
  }

  getAnswer(link: string) {
    return this.http.get<any>(link);
  }
}
