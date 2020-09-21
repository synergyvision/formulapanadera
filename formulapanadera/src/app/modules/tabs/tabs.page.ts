import { Component } from "@angular/core";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["./styles/tabs.page.scss"],
})
export class TabsPage {
  ICONS = ICONS;
  constructor() {}
}
