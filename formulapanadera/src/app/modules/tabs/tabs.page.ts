import { Component, OnInit } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { TimeService } from "src/app/core/services/time.service";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["./styles/tabs.page.scss"],
})
export class TabsPage implements OnInit {
  ICONS = ICONS;
  constructor(private timeService: TimeService) {}

  ngOnInit() {
    this.timeService.startCurrentTime();
  }
}
