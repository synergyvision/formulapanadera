import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ContactService {

  baseUrl: string = '';

  constructor(private http: HttpClient) { }

  getAllContact() {
    return this.http.get<any>(this.baseUrl);
  }

}
