import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HowToService } from 'src/app/core/services/how-to.service';

@Component({
  selector: 'app-how-to-use',
  templateUrl: './how-to-use.page.html',
  styleUrls: ['./how-to-use.page.scss'],
})
export class HowToUsePage implements OnInit {

  segementValue: string = localStorage.getItem('howToSeg') ? localStorage.getItem('howToSeg') : 'list';
  // Tutorials
  tutorials: any;
  // Subscription
  howToSubscription: Subscription;
  bannerSubscription: Subscription;
  // Banner
  banner: any;

  constructor(
    private howToService: HowToService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.howToSubscription = this.howToService.getHowTo().subscribe(
      (tutorials) => {
        this.tutorials = tutorials.tutoriales;
      }
    )
  }

  goToSet(tutorial) {
    this.router.navigate(['./section'], {relativeTo: this.route, state: tutorial })
  }

  toggle() {
    this.segementValue = this.segementValue == 'list' ? 'matrix' : 'list';
    localStorage.setItem('howToSeg', this.segementValue);
  }
}
