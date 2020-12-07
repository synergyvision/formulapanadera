import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-show-hide-content",
  templateUrl: "./show-hide-content.component.html",
  styleUrls: ["./styles/show-hide-content.component.scss"],
})
export class ShowHideContentComponent {
  ICONS = ICONS;

  @Input() title: string;
  @Input() show: boolean;
  @Input() subtitle: boolean = false;
  @Input() transparent: boolean = false;

  constructor() {}
}
