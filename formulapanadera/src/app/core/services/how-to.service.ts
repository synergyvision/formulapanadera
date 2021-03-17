import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HowToService {

  baseURL = 'https://synergy.vision/' + 'tutoriales/tutoriales.json';

  constructor(
    private http: HttpClient
  ) { }
  
  getHowTo(): Observable<any> {
    return this.http.get<any>(this.baseURL);
  }
}
