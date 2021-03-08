import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ICONS } from "src/app/config/icons";
import { TermsService } from 'src/app/core/services/terms.service';

@Component({
  selector: 'app-term-conditions',
  templateUrl: './term-conditions.component.html',
  styleUrls: ['./term-conditions.component.scss'],
})
export class TermConditionsComponent implements OnInit {
  ICONS = ICONS;

  @Input() termsOrPrivacy;

  subscription: Subscription = Subscription.EMPTY;
  terms: any;
  privacy: any;
  constructor(
    private modalController: ModalController,
    private termsService: TermsService
  ) { }

  ngOnInit() {
    this.subscription = this.termsService.getTerms().subscribe(
      (response) => {
        this.terms = response.terms[0];
        this.privacy = response.terms[1];
      }
    )
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}
