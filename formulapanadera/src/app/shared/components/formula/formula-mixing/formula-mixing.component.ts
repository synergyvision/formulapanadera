import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { FormulaMixingModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-formula-mixing",
  templateUrl: "./formula-mixing.component.html",
  styleUrls: ["./styles/formula-mixing.component.scss"],
})
export class FormulaMixingComponent {
  ICONS = ICONS;

  @Input() mixing: FormulaMixingModel;
  showMixing: boolean = false;

  constructor() {}

}
