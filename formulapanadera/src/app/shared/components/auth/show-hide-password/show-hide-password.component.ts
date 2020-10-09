import { Component, ContentChild } from "@angular/core";

import { IonInput } from "@ionic/angular";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-show-hide-password",
  templateUrl: "./show-hide-password.component.html",
  styleUrls: ["./styles/show-hide-password.component.scss"],
})
export class ShowHidePasswordComponent {
  ICONS = ICONS;

  show = false;

  @ContentChild(IonInput) input: IonInput;

  constructor() {}

  toggleShow() {
    this.show = !this.show;
    if (this.show) {
      this.input.type = "text";
    } else {
      this.input.type = "password";
    }
  }
}
