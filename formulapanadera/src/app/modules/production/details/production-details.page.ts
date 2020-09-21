import { Component, OnDestroy, OnInit } from "@angular/core";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-production-details",
  templateUrl: "production-details.page.html",
  styleUrls: ["./styles/production-details.page.scss"],
})
export class ProductionDetailsPage implements OnInit, OnDestroy {
  APP_URL = APP_URL;
  ICONS = ICONS;

  constructor() {}

  ngOnDestroy(): void {}

  ngOnInit() {}
}
