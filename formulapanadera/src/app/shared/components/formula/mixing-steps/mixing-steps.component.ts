import { Component, Input } from "@angular/core";
import { IngredientMixingModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-mixing-steps",
  templateUrl: "./mixing-steps.component.html",
  styleUrls: ["./styles/mixing-steps.component.scss"],
})
export class MixingStepsComponent {
  @Input() steps: Array<IngredientMixingModel>;

  constructor() {}
}
