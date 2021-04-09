import { Component, Input } from "@angular/core";
import { DECIMALS } from 'src/app/config/formats';
import { FAT_CLASSIFICATION } from "src/app/config/formula";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-fat-bar",
  templateUrl: "./fat-bar.component.html",
  styleUrls: ["./styles/fat-bar.component.scss"],
})
export class FatBarComponent {
  @Input() fat: number;
  
  constructor(private languageService: LanguageService) {}

  breadType() {
    let type = "";
    FAT_CLASSIFICATION.forEach((classification) => {
      if (
        this.fat > classification.values.min &&
        this.fat <= classification.values.max
      ) {
        type = this.languageService.getTerm(
          `formulas.fat.${classification.name}`
        );
      }
    });
    return type;
  }

  getFatPercentage() {
    return (this.fat * 100).toFixed(DECIMALS.fat)
  }
}
