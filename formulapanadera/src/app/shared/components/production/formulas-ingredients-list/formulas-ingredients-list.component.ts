import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { FormulaPresentModel } from "src/app/core/models/production.model";

@Component({
  selector: "app-formulas-ingredients-list",
  templateUrl: "./formulas-ingredients-list.component.html",
  styleUrls: ["./styles/formulas-ingredients-list.component.scss"],
})
export class FormulasIngredientsListComponent {
  ICONS = ICONS;

  @Input() formulas: Array<FormulaPresentModel & { show: boolean }>;
  @Input() highlight: boolean = false;
  @Input() showMixing: boolean = false;

  constructor() {}
}
