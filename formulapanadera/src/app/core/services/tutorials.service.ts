import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TutorialsService {

  constructor(
    private http: HttpClient
  ) { }

  getAllTutorials() {
    return this.http.get<any>('');
  }
}
