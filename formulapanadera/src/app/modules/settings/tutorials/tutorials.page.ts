import { Component, OnInit, ViewChild } from '@angular/core';
import { IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Plugins } from '@capacitor/core';
import { TutorialsService } from 'src/app/core/services/tutorials.service';
import { ActivatedRoute, Router } from '@angular/router';
const { Browser } = Plugins;
@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.page.html',
  styleUrls: ['./tutorials.page.scss'],
})
export class TutorialsPage implements OnInit {

  @ViewChild('refresher', {static: false}) refresher: IonRefresher;

	// List of tutorial
	tutorialsList = [];
	// tutorials observable's subscription
	subscription: Subscription;

  banner: any[] = [];
  bannerSubscription: Subscription;

  constructor(
    private tutorialsService: TutorialsService,
    private router: Router,
    private activeRoute:ActivatedRoute
  ) { }

  ngOnInit() {
		this.tutorialsList = [];
  	this.subscription = this.tutorialsService.getAllTutorials().subscribe(
			(response) => {
				this.tutorialsList = response;
				setTimeout(
					() => {
						this.refresher.complete()
					}, 1000
				)
			}
		);

	}
	
	ngOnDestroy() {
		this.subscription.unsubscribe();
		this.bannerSubscription.unsubscribe();
	}

  /* check if tutorial have markdown */
  readTutorial(tutorial) {
    if (tutorial.contentUrl) {
      Browser.open({
        url: tutorial.contentUrl,
        windowName: '_system'
      }) 
    } else {
      this.router.navigate(['./read'], { relativeTo: this.activeRoute, state: tutorial });
    }
	}

}
