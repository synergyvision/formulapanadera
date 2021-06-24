import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
  ViewWillEnter,
} from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import {
  FormulaNumberModel,
  ProductionModel,
} from "src/app/core/models/production.model";
import { UserModel } from "src/app/core/models/user.model";
import { CourseCRUDService } from "src/app/core/services/firebase/course.service";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { LanguageService } from "src/app/core/services/language.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { UserService } from "src/app/core/services/user.service";
import { FormulaPickerModal } from "src/app/shared/modal/formula/formula-picker.modal";

@Component({
  selector: "app-production-manage",
  templateUrl: "./production-manage.page.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/production-manage.page.scss",
  ],
})
export class ProductionManagePage implements OnInit, ViewWillEnter {
  APP_URL = APP_URL;
  ICONS = ICONS;

  update: boolean = false;

  production: ProductionModel = new ProductionModel();
  original_production: ProductionModel = new ProductionModel();
  manageProductionForm: FormGroup;

  current_user = new UserModel();

  constructor(
    private productionCRUDService: ProductionCRUDService,
    private courseCRUDService: CourseCRUDService,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private languageService: LanguageService,
    private router: Router,
    private formatNumberService: FormatNumberService,
    private userStorageService: UserStorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private userService: UserService
  ) {}

  async ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    this.production = new ProductionModel();
    this.update = false;
    if (state == undefined) {
      this.manageProductionForm = new FormGroup({
        name: new FormControl(null, Validators.required),
      });
      this.production.user = {
        owner: this.current_user.email,
        can_clone: false,
        public: false,
        reference: "",
        shared_users: [],
        shared_references: [],
        creator: {
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        },
        modifiers: [],
      };
    } else {
      this.update = true;
      this.manageProductionForm = new FormGroup({
        name: new FormControl(state.production.name, Validators.required),
      });
      this.original_production = JSON.parse(JSON.stringify(state.production))
      this.production.id = state.production.id;
      this.production.user = state.production.user;
      this.production.formulas = [];
      state.production.formulas.forEach((formula) => {
        this.production.formulas.push(formula);
      });
      this.production.user = state.production.user;
    }
    this.current_user = await this.userStorageService.getUser();
  }

  ionViewWillEnter() {
    if (this.production.id) {
      this.update = true;
    } else {
      this.update = false;
    }
  }

  async sendProduction() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    this.production.name = this.manageProductionForm.value.name;
    if (this.update) {
      this.production.user.modifiers.push({
        name: this.current_user.name,
        email: this.current_user.email,
        date: new Date(),
      });
      this.productionCRUDService
        .update(this.production, this.original_production)
        .then(async () => {
          if (this.userService.hasPermission(this.current_user.role, [{name: 'COURSE', type: 'MANAGE'}])) {
            let updated_productions: ProductionModel[] = [this.production]
            let updated_courses: CourseModel[] = []
            await this.courseCRUDService.updateAll(updated_courses, [], [], updated_productions);
          }
          this.router.navigateByUrl(
            APP_URL.menu.name +
              "/" +
              APP_URL.menu.routes.production.main +
              "/" +
              APP_URL.menu.routes.production.routes.details,
            {
              state: { production: JSON.parse(JSON.stringify(this.production)) },
              replaceUrl: true
            }
          );
        })
        .catch(() => {
          this.presentToast(false);
        })
        .finally(async () => {
          await loading.dismiss();
        });
    } else {
      this.production.user = {
        owner: this.current_user.email,
        can_clone: this.production.user.can_clone,
        public: this.production.user.public,
        reference: "",
        shared_users: [],
        shared_references: [],
        creator: {
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        },
        modifiers: [],
      };
      this.productionCRUDService
        .create(this.production)
        .then(async () => {
          this.router.navigateByUrl(
            APP_URL.menu.name +
              "/" +
              APP_URL.menu.routes.production.main +
              "/" +
              APP_URL.menu.routes.production.routes.details,
            {
              state: { production: JSON.parse(JSON.stringify(this.production)) },
              replaceUrl: true
            }
          );
        })
        .catch(() => {
          this.presentToast(false);
        })
        .finally(async () => {
          await loading.dismiss();
        });
    }
  }

  async formulaPicker(formulas: Array<FormulaNumberModel>) {
    const modal = await this.modalController.create({
      component: FormulaPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedFormulas: formulas,
        forProduction: true,
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
        if (!formula.number || (formula.number && formula.number <= 0)) {
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
    formula.warming_time = Number(
      this.formatNumberService.formatNonZeroPositiveNumber(formula.warming_time)
    );
  }

  async presentToast(success: boolean) {
    const toast = await this.toastController.create({
      message: success
        ? this.languageService.getTerm("send.success")
        : this.languageService.getTerm("send.error"),
      color: "secondary",
      duration: 5000,
      position: "top",
      buttons: [
        {
          icon: ICONS.close,
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    toast.present();
  }
}
