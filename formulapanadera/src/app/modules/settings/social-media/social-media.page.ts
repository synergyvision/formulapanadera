import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Plugins } from '@capacitor/core';
import { SocialMediaConfig } from './social-media.config';

const { Browser } = Plugins;

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.page.html',
  styleUrls: ['./social-media.page.scss', './social-media.page.responsive.scss'],
})
export class SocialMediaPage implements OnInit {

  socialMedias: any[] = SocialMediaConfig.SOCIAL_MEDIAS;
  // Segment value
  segementValue = localStorage.getItem('smSegment') ? localStorage.getItem('smSegment') : 'list';

  bannerSubscription: Subscription;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.bannerSubscription.unsubscribe();
  }

  /* Toggle view */
  toggle() {
    this.segementValue = this.segementValue == 'list' ? 'matrix' : 'list';
    localStorage.setItem('smSegment', this.segementValue);
  }

  /* Open in app browser social media */
  openBrowser(media: any) {
    // checks if media is telegram or whatsapp
    if (media.name == 'Telegram') {
      Browser.open({
        url: media.profileUrl + media.username,
        windowName: '_system'
      });
    } else if (media.name == 'Whatsapp') {
      Browser.open({
        url:media.profileUrl + media.phone,
        windowName: '_system'
      });
      
    } else {
      Browser.open({
        url: media.profileUrl
      });
    }
  }

}
