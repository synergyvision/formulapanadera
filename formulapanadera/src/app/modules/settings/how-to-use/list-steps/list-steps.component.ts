import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-list-steps',
  templateUrl: './list-steps.component.html',
  styleUrls: ['./list-steps.component.scss'],
})
export class ListStepsComponent implements OnInit {

  @Input() set: any;

  segementValue: string = localStorage.getItem('stepsSeg') ? localStorage.getItem('stepsSeg') : 'list';

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  toggle() {
    this.segementValue = this.segementValue == 'list' ? 'matrix': 'list'
    localStorage.setItem('stepsSeg', this.segementValue);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  goToSlide(index: number) {
    this.modalController.dismiss(index);
  }

}
