import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-read-tutorial',
  templateUrl: './read-tutorial.component.html',
  styleUrls: ['./read-tutorial.component.scss'],
})
export class ReadTutorialComponent implements OnInit {

  tutorial: any;

  constructor(private router: Router) {
    this.tutorial = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {}

}
