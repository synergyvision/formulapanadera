import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";

@Component({
  selector: "app-production-manage",
  templateUrl: "./production-manage.page.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/production-manage.page.scss",
  ],
})
export class ProductionManagePage implements OnInit {
  APP_URL = APP_URL;
  update: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      // Create
    } else {
      // Update
      this.update = true;
    }
  }
}
