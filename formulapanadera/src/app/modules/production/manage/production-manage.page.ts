import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  AlertController,
  IonRouterOutlet,
  ModalController,
} from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import {
  FormulaNumberModel,
  ProductionModel,
} from "src/app/core/models/production.model";
import { UserModel } from "src/app/core/models/user.model";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { LanguageService } from "src/app/core/services/language.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { FormulaPickerModal } from "src/app/shared/modal/formula/formula-picker.modal";

@Component({
  selector: "app-production-manage",
  templateUrl: "./production-manage.page.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/production-manage.page.scss",
  ],
})
export class ProductionManagePage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  update: boolean = false;

  production: ProductionModel = new ProductionModel();
  manageProductionForm: FormGroup;

  current_user = new UserModel();

  constructor(
    private productionCRUDService: ProductionCRUDService,
    public modalController: ModalController,
    private alertController: AlertController,
    private routerOutlet: IonRouterOutlet,
    private languageService: LanguageService,
    private router: Router,
    private formatNumberService: FormatNumberService,
    private userStorageService: UserStorageService
  ) {}

  async ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      this.manageProductionForm = new FormGroup({
        name: new FormControl(null, Validators.required),
      });
    } else {
      this.update = true;
      this.manageProductionForm = new FormGroup({
        name: new FormControl(state.production.name, Validators.required),
      });
      this.production.id = state.production.id;
      this.production.formulas = [];
      state.production.formulas.forEach((formula) => {
        this.production.formulas.push(formula);
      });
      this.production.owner = state.production.owner;
    }
    this.current_user = await this.userStorageService.getUser();
  }

  sendProduction() {
    this.production.name = this.manageProductionForm.value.name;
    if (this.update) {
      this.productionCRUDService.updateProduction(this.production).then(() => {
        this.router.navigateByUrl(
          APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
        );
      });
    } else {
      this.production.owner = {
        name: this.current_user.name,
        email: this.current_user.email,
        date: new Date(),
      };
      this.productionCRUDService.createProduction(this.production).then(() => {
        this.router.navigateByUrl(
          APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
        );
      });
    }
  }

  async deleteProduction() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.manageProductionForm.value.name,
      }),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            this.productionCRUDService
              .deleteProduction(this.production.id)
              .then(() => {
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
                );
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async formulaPicker(formulas: Array<FormulaNumberModel>) {
    const modal = await this.modalController.create({
      component: FormulaPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedIngredients: formulas,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async pickFormula() {
    let data = await this.formulaPicker(this.production.formulas);
    if (data !== undefined) {
      if (this.production.formulas == null) {
        this.production.formulas = [];
      }
      this.production.formulas = data.formulas;
    }
  }

  deleteFormula(formula: FormulaNumberModel) {
    this.production.formulas.splice(
      this.production.formulas.indexOf(formula),
      1
    );
  }

  canSend(): boolean {
    return (
      !this.manageProductionForm.valid ||
      !this.production.formulas ||
      !this.formulasAreValid()
    );
  }

  formulasAreValid(): boolean {
    let valid = true;
    if (this.production.formulas) {
      this.production.formulas.forEach((formula) => {
        if (formula.number && formula.number <= 0) {
          valid = false;
        }
      });
    }
    return valid;
  }

  formatFormulaNumber(formula: FormulaNumberModel) {
    formula.number = Number(
      this.formatNumberService.formatNonZeroPositiveNumber(formula.number)
    );
  }
}
