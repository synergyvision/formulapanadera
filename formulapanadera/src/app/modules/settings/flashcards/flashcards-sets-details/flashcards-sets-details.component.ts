import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FlashcardsService } from 'src/app/core/services/flashcards.service';

@Component({
  selector: 'app-flashcards-sets-details',
  templateUrl: './flashcards-sets-details.component.html',
  styleUrls: ['./flashcards-sets-details.component.scss'],
})
export class FlashcardsSetsDetailsComponent implements OnInit {


  @Input() set: any;

  segementValue: string = localStorage.getItem('flashSegment') ? localStorage.getItem('flashSegment') : 'list'


  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {

  }

  toggle() {
    this.segementValue = this.segementValue == 'list' ? 'matrix': 'list'
    localStorage.setItem('flashSegment', this.segementValue);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  goToSlide(index: number) {
    this.modalController.dismiss(index);
  }

}
