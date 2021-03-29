import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { ListStepsComponent } from '../list-steps/list-steps.component';
import { HowToUseConfigs } from '../how-to-use.config';

const { Browser } = Plugins;

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
})
export class SectionComponent implements OnInit {

  // Slides
  @ViewChild('allCards', {static: false}) allCards: IonSlides;
  //Slides options
  allCardsOptions: any = HowToUseConfigs.ALL_CARDS_OPTIONS;

  slidesOptions: any;
  // Have Link ?
  cardWithLink: boolean;
  // Is autoplaying ?
  autoplaying: boolean = false;
  // Tutorial
  tutorial: any;
  // Seconds by slides
  secondsByCard: number = 5;

  constructor(
    private router: Router,
    private modalController: ModalController
  ) {
    this.tutorial = this.router.getCurrentNavigation().extras.state;  
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.haveLink();
  }

  async changeTitle() {
    this.haveLink();
  }

  goToFirst() {
    this.allCards.slideTo(0);
  }

  goToPrevious() {
    this.allCards.slidePrev()
  }

  goToNext() {
    this.allCards.slideNext()
  }

  async goToLast() {
    let last = await this.allCards.length()
    this.allCards.slideTo(last-1)
  }

  playAuto() {
    this.allCards.getSwiper().then((swiper) => {
      swiper.params.autoplay = {delay: this.secondsByCard * 1000};
      this.allCards.startAutoplay();
      this.autoplaying = true;
    })

  }

  stopAuto() {
    this.allCards.stopAutoplay();
    this.autoplaying = false;
  }

  async openLink() {
    let cardIndex = await this.allCards.getActiveIndex();
    if (this.cardWithLink) {
      Browser.open({
        url: this.tutorial.steps[cardIndex].link,
        windowName:  '_system'
      });
    }
  }

  async haveLink(){
    let cardIndex = await this.allCards.getActiveIndex();
    this.cardWithLink = this.tutorial.steps[cardIndex].link ? true : false;
  }

  async openCardsModal() {
    const modal = await this.modalController.create({
      component: ListStepsComponent,
      componentProps: {
        set: this.tutorial
      }
    });
    modal.onDidDismiss().then(
      (data) => {
        console.log(data);
        if(data.data >= 0) {
          this.allCards.slideTo(data.data)
        }
      }
    )
    
    return await modal.present()
  }

  styleHelper(singlecard: any) {
    let applyStyles = {'background': 'url(' + singlecard.image + ') no-repeat center center / 100% 100%'}
    return applyStyles
  }
}
