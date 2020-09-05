import { Component, OnInit, OnDestroy, HostBinding } from "@angular/core";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "src/app/core/models/formula.model";
import { Subscription, merge } from "rxjs";
import { environment } from "src/environments/environment";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-formula-listing",
  templateUrl: "formula-listing.page.html",
  styleUrls: ["./styles/formula-listing.page.scss"],
})
export class FormulaListingPage implements OnInit, OnDestroy {
  formulaDataStore: DataStore<Array<FormulaModel>>;
  stateSubscription: Subscription;

  ingredient_cost_unit = environment.ingredient_cost_unit;
  formulas: FormulaModel[] & ShellModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.formulas && this.formulas.isShell ? true : false;
  }

  constructor(
    private formulaService: FormulaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.route.data.subscribe((resolvedRouteData) => {
      this.formulaDataStore = resolvedRouteData["data"];

      this.stateSubscription = merge(this.formulaDataStore.state).subscribe(
        (state) => {
          this.formulas = state;
        }
      );
    });
  }

  createFormula() {
    this.router.navigateByUrl("menu/formula/manage");
  }

  formulaDetails(formula: FormulaModel) {
    if (formula.id !== undefined) {
      this.router.navigateByUrl("menu/formula/details", {
        state: { formula: formula },
      });
    }
  }
}
