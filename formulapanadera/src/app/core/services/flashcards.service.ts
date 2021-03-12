import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_WEB_NEWS } from 'src/app/config/configuration'
@Injectable()
export class FlashcardsService {

  constructor(
    private Htttp: HttpClient
  ) { }

  getFlashcards() {
    return this.Htttp.get<any>(BASE_WEB_NEWS + 'flashcards/flashcards.json' )
  }
}
