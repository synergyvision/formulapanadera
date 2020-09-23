import { Component, Input } from "@angular/core";
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
    if (this.hydration < 0.55) {
      return this.languageService.getTerm("formulas.hydration.hard");
    } else if (0.55 < this.hydration && this.hydration < 0.63) {
      return this.languageService.getTerm("formulas.hydration.standard");
    } else if (0.63 < this.hydration) {
      return this.languageService.getTerm("formulas.hydration.rustic");
    }
  }
}
