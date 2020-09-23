import { Component, Input } from "@angular/core";

@Component({
  selector: "app-title",
  templateUrl: "./title.component.html",
  styleUrls: ["./styles/title.component.scss"],
})
export class TitleComponent {
  @Input() title: string;

  constructor() {}
}
