import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FlashcardsService } from 'src/app/core/services/flashcards.service';

@Component({
  selector: 'app-flashcards-sets',
  templateUrl: './flashcards-sets.component.html',
  styleUrls: ['./flashcards-sets.component.scss'],
})
export class FlashcardsSetsComponent implements OnInit {

  segementValue: string = localStorage.getItem('flashcardsCat') ? localStorage.getItem('flashcardsCat') : 'list'

  // categories
  flashcardsCategories: any;
  flashcardsSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private flashcardsService: FlashcardsService
  ) { }

  ngOnInit() {
    this.flashcardsSubscription = this.flashcardsService.getFlashcards().subscribe(
      (response) => {
        this.flashcardsCategories = response
      }
    )
  }

  ngOnDestroy() {
    this.flashcardsSubscription.unsubscribe();
  }

  goToSet(category: any) {
    this.router.navigate(['./', category.value.name], {relativeTo: this.route, state: {data: category.value}})
  }

  toggle() {
    this.segementValue = this.segementValue == 'list' ? 'matrix' : 'list';
    localStorage.setItem('flashcardsCat', this.segementValue);
  }

}
