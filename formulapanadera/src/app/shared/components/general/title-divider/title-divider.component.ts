import { Component, Input } from "@angular/core";

@Component({
  selector: "app-title-divider",
  templateUrl: "./title-divider.component.html",
  styleUrls: ["./styles/title-divider.component.scss"],
})
export class TitleDividerComponent {
  @Input() title: string;

  constructor() {}
}
