import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FlashcardsSetsDetailsComponent } from './flashcards-sets-details/flashcards-sets-details.component';
import { Plugins } from '@capacitor/core';
import { FlashcardsConfigs } from './flashcards.config';
const { Browser, Share } = Plugins;

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.page.html',
  styleUrls: ['./flashcards.page.scss'],
})
export class FlashcardsPage implements OnInit {

  @ViewChild('allCards', {static: false}) allCards: IonSlides;
  allCardsOptions = FlashcardsConfigs.ALL_CARDS_OPTIONS

  @ViewChildren('card') card: QueryList<IonSlides>;
  cardOptions = FlashcardsConfigs.CARD_OPTIONS;

  // title view
  title: string;
  // Card have link??
  cardWithLink: boolean;
  // Category
  cardsCategory: any;
  // seconds passed between cards
  secondsByCard: number = 5;
  //Autoplay guard
  autoplaying: boolean = false;

  //Banners
  bannerSubscription: Subscription;
  banner: any[] = [];

  constructor(
    private modalController: ModalController,
    private router: Router,
  ) {
    this.cardsCategory = this.router.getCurrentNavigation().extras.state.data;
    this.title = this.cardsCategory.cards[0].title;
  }

  ngOnInit() {

  }

  // Refresh content if lang changes
  ngAfterViewInit() {
    this.allCards.length().then((length) => {console.log(length)})
    this.card.first.length().then((length) => { console.log('card',length) })
    this.haveLink();
  }

  ngOnDestroy() {
    this.bannerSubscription.unsubscribe();
  }

  flipCard(cardIndex: number) {
    this.card.toArray()[cardIndex].slideNext();
    
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

  async changeTitle() {
    let cardIndex = await this.allCards.getActiveIndex()
    this.title = this.cardsCategory.cards[cardIndex].title;
    this.haveLink();
  }

  async shareCard() {
    let cardIndex = await this.allCards.getActiveIndex();
    let side = await this.card.toArray()[cardIndex].getActiveIndex();
    let options
    if (this.cardsCategory.cards[cardIndex].types[side] == 'image') {
      options = {
        text: '',
        title: '',
        url: [side == 0 ? this.cardsCategory.cards[cardIndex].front : this.cardsCategory.cards[cardIndex].back]
      }
    }
    else if (this.cardsCategory.cards[cardIndex].types[side] == 'text' || this.cardsCategory.cards[cardIndex].types[side] == 'markdown') {
      options = {
        text: side == 0 ? this.cardsCategory.cards[cardIndex].front : this.cardsCategory.cards[cardIndex].back,
        title: '',

      }
    }
    Share.share(options);
  }

  async openLink() {
    let cardIndex = await this.allCards.getActiveIndex();
    if (this.cardWithLink) {
      Browser.open({
        url: this.cardsCategory.cards[cardIndex].link,
        windowName: '_system'
      });
    }
  }

  async haveLink(){
    let cardIndex = await this.allCards.getActiveIndex();
    this.cardWithLink = this.cardsCategory.cards[cardIndex].link ? true : false;
  }

  async openCardsModal() {
    const modal = await this.modalController.create({
      component: FlashcardsSetsDetailsComponent,
      componentProps: {
        set: this.cardsCategory
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

  styleHelper(side: string, singlecard: any) {
    if (side == 'front') {
      let applyStyles = {'background': (singlecard.types[0] == 'image' ?
      'url(' + singlecard.front + ') no-repeat center center / 100% 100%'
      :
      'url(' + this.cardsCategory.frontbg + ') no-repeat center center / 100% 100%')
      }
      if (singlecard.frontStyle) {
        let ejemplo = {'font-size': '24px', 'color': 'red'}
        applyStyles = {...applyStyles, ...ejemplo}
      }
      return applyStyles
    }
    else if (side == 'back') {
      let applyStyles = {'background': (singlecard.types[1] == 'image' ?
      'url(' + singlecard.back + ') no-repeat center center / 100% 100%'
      :
      'url(' + this.cardsCategory.backbg + ') no-repeat center center / 100% 100%')
      }
      if (singlecard.backStyle) {
        let ejemplo = {'font-size': '24px', 'color': 'red'}
        applyStyles = {...applyStyles, ...ejemplo}
      }
      return applyStyles
    }
    else return null
  }

}
