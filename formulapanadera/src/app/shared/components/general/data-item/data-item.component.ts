import { Component, Input } from "@angular/core";

@Component({
  selector: "app-data-item",
  templateUrl: "./data-item.component.html",
  styleUrls: ["./styles/data-item.component.scss"],
})
export class DataItemComponent {
  @Input() title: string;
  @Input() data: string;

  constructor() {}
}
