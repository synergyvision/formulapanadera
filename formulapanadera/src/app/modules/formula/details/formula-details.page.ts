import { Component, OnInit } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import { ModalController } from "@ionic/angular";
import { FormulaModel } from "src/app/core/models/formula.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-formula-deatils",
  templateUrl: "formula-details.page.html",
  styleUrls: ["./styles/formula-details.page.scss"],
})
export class FormulaDetailsPage implements OnInit {
  formula: FormulaModel = new FormulaModel();
  formulaUnit = "%";
  temperatureUnit = "C";

  constructor(
    private formulaService: FormulaService,
    public modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      this.router.navigateByUrl("menu/formula");
    } else {
      this.formula = state.formula;
    }
  }

  updateFormula() {
    this.router.navigateByUrl("menu/formula/manage", {
      state: { formula: this.formula },
    });
  }
}
