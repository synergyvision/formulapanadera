import { Component, Input } from "@angular/core";
import { HYDRATION_CLASSIFICATION } from "src/app/config/formula";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-hydration-bar",
  templateUrl: "./hydration-bar.component.html",
  styleUrls: ["./styles/hydration-bar.component.scss"],
})
export class HydrationBarComponent {
  @Input() hydration: number;

  constructor(private languageService: LanguageService) {}

  breadType() {
    let type = "";
    HYDRATION_CLASSIFICATION.forEach((classification) => {
      if (
        this.hydration > classification.values.min &&
        this.hydration <= classification.values.max
      ) {
        type = this.languageService.getTerm(
          `formulas.hydration.${classification.name}`
        );
      }
    });
    return type;
  }
}
