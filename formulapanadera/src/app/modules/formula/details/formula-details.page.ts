import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import {
  ActionSheetController,
  AlertController,
  IonRouterOutlet,
  LoadingController,
  ModalController,
  ToastController,
} from "@ionic/angular";
import {
  FormulaModel,
  StepDetailsModel,
  IngredientPercentageModel,
} from "src/app/core/models/formula.model";
import { ActivatedRoute, Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { UserGroupModel, UserResumeModel } from "src/app/core/models/user.model";
import { DATE_FORMAT, DECIMALS, DECIMAL_BAKERS_PERCENTAGE_FORMAT, DECIMAL_COST_FORMAT } from "src/app/config/formats";
import { DatePipe } from "@angular/common";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from 'src/app/core/models/production.model';
import { FormatNumberService } from 'src/app/core/services/format-number.service';
import { ProductionCRUDService } from 'src/app/core/services/firebase/production.service';
import { ProductionStorageService } from 'src/app/core/services/storage/production.service';
import { UserGroupPickerModal } from 'src/app/shared/modal/user-group/user-group-picker.modal';

@Component({
  selector: "app-formula-details",
  templateUrl: "formula-details.page.html",
  styleUrls: [
    "./styles/formula-details.page.scss",
    "./../../../shared/styles/note.alert.scss",
    "./../../../shared/styles/confirm.alert.scss",
  ],
})
export class FormulaDetailsPage implements OnInit, OnDestroy {
  APP_URL = APP_URL;
  ICONS = ICONS;
  FORMULA_COST_FORMAT = DECIMAL_COST_FORMAT.formula
  DECIMAL_BAKERS_PERCENTAGE_FORMAT = DECIMAL_BAKERS_PERCENTAGE_FORMAT

  formula: FormulaModel = new FormulaModel();
  formulaUnit = "%";
  units: number;

  bakers_percentage: string;
  total_weight: number;
  hydration: number;
  unitary_cost: string;
  total_cost: string;

  currency: string = CURRENCY;

  ingredients: Array<IngredientPercentageModel>;
  steps: Array<StepDetailsModel>;
  ingredients_formula: Array<any> = [];

  showOrganolepticCharacteristics: boolean;
  showReferences: boolean;
  showIngredients: boolean;
  showSubIngredients: boolean;
  showMixing: boolean;
  showSteps: boolean;
  showTimes: boolean

  user: UserResumeModel = new UserResumeModel();
  is_modifier: boolean = false
  public: boolean = false

  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    private languageService: LanguageService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private datePipe: DatePipe,
    private userStorageService: UserStorageService,
    private loadingController: LoadingController,
    private formatNumberService: FormatNumberService,
    private productionCRUDService: ProductionCRUDService,
    private productionStorageService: ProductionStorageService
  ) {
    this.showOrganolepticCharacteristics = false;
    this.showReferences = false;
    this.showIngredients = true;
    this.showSubIngredients = true;
    this.showMixing = false;
    this.showSteps = false;
    this.showTimes = false;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      let navParams = this.router.getCurrentNavigation().extras.state;
      if (navParams) {
        this.formula = navParams.formula;
      }

      this.units = this.formula.units;
      this.ingredients = JSON.parse(JSON.stringify(this.formula.ingredients));
      this.steps = JSON.parse(JSON.stringify(this.formula.steps));
      if (this.formula.user.owner == "") {
        this.public = true;
      }

      let user = await this.userStorageService.getUser();
      this.user = {name: user.name, email: user.email}
      this.is_modifier = false;
      this.formula.user.modifiers.forEach((user) => {
        if (user.email == this.user.email) {
          this.is_modifier = true;
        }
      });

      this.calculateFormula();
    });
  }

  ngOnDestroy() {
    this.units = this.formula.units;
    this.calculateFormula();
  }

  calculateFormula() {
    this.ingredients = JSON.parse(JSON.stringify(this.formula.ingredients));
    this.bakers_percentage = this.formulaService.calculateBakersPercentage(
      this.units * this.formula.unit_weight,
      this.ingredients
    )
    this.total_weight = Number(
      (this.units * this.formula.unit_weight).toFixed(DECIMALS.weight)
    );
    let formula: FormulaModel = JSON.parse(JSON.stringify(this.formula))
    formula.units = this.units
    formula.ingredients = JSON.parse(JSON.stringify(this.ingredients))
    let formula_without_compound: FormulaModel = JSON.parse(JSON.stringify(formula))
    formula_without_compound.ingredients.forEach((ingredient, index) => {
      if (ingredient.ingredient.formula) {
        formula_without_compound.ingredients.splice(
          index,
          1
        );
      }
    })
    let bakers_p = this.formulaService.deleteIngredientsWithFormula(formula, formula_without_compound)
    this.hydration = Number(
      this.formulaService.calculateHydration(formula_without_compound.ingredients)
    );
    this.total_cost = this.formulaService.calculateTotalCost(
      formula_without_compound.ingredients,
      Number(bakers_p)
    );
    this.unitary_cost = (Number(this.total_cost) / this.units).toString();

    this.ingredients_formula = []
    let ing_formula: IngredientPercentageModel[] = [];
    //Identifies ingredients with formula
    this.formulaService.getIngredientsWithFormula(
      this.ingredients,
      ing_formula
    );
    this.formulaService.getAllIngredientsWithFormula(
      Number(this.bakers_percentage),
      this.ingredients,
      ing_formula,
      this.ingredients_formula
    )

    this.steps.forEach((step) => {
      ing_formula = [];
      if (step.ingredients) {
        step.ingredients.forEach((ingredient) => {
          if (ingredient.ingredient.formula) {
            ing_formula.push(ingredient);
          }
        });
        this.formulaService.getIngredientsCalculatedPercentages(
          Number(this.total_weight),
          Number(this.bakers_percentage),
          JSON.parse(JSON.stringify(this.ingredients)),
          ing_formula,
          "ADD",
          this.ingredients_formula
        );
      }
    });

    this.steps.forEach((item) => {
      if (item.ingredients) {
        item.ingredients = this.formulaService.sortIngredients(
          item.ingredients
        );
      }
    });
    this.ingredients_formula.forEach((item) => {
      item.ingredient.formula.ingredients = this.formulaService.sortIngredients(
        item.ingredient.formula.ingredients
      );
    });
    this.ingredients = this.formulaService.sortIngredients(this.ingredients);
  }

  changeUnits(event: any) {
    if (event.detail.value > 0) {
      this.calculateFormula();
    }
  }

  //Options

  async presentOptions() {
    let current_user = this.user.email;
    let buttons = [];
    buttons.push({
      text: this.languageService.getTerm("action.do_production"),
      icon: ICONS.production_start,
      cssClass: "action-icon",
      handler: () => {
        this.doFormula();
      },
    });
    if (
      this.formula.user.cloned ||
      (!this.formula.user.cloned &&
        this.formula.user.creator.email == current_user)
    ) {
      buttons.push({
        text: this.languageService.getTerm("action.update"),
        icon: ICONS.create,
        cssClass: "action-icon",
        handler: () => {
          this.updateFormula();
        },
      });
    }
    if (
      this.formula.user.owner &&
      ((this.formula.user.cloned && this.is_modifier) ||
        this.formula.user.creator.email == current_user)
    ) {
      // If not public but is cloned and was modified or user is creator
      buttons.push({
        text: this.languageService.getTerm("action.share"),
        icon: ICONS.share,
        cssClass: "action-icon",
        handler: () => {
          this.shareFormula();
        },
      });
    }
    if (this.formula.user.can_clone || this.formula.user.creator.email == current_user) {
      buttons.push({
        text: this.languageService.getTerm("action.clone"),
        icon: ICONS.clone,
        cssClass: "action-icon",
        handler: () => {
          this.cloneFormula();
        },
      });
    }
    buttons.push(
      {
        text: this.languageService.getTerm("credits.name"),
        icon: ICONS.credits,
        cssClass: "action-icon",
        handler: () => {
          this.showCredits();
        },
      },
    );
    if (this.formula.user.owner == current_user ||
      (this.formula.user.owner == "" &&
        this.formula.user.creator.email == current_user)) {
      // If not public or cloned
      buttons.push({
        text: this.languageService.getTerm("action.delete"),
        icon: ICONS.trash,
        cssClass: "delete-icon",
        handler: () => {
          this.deleteFormula();
        },
      });
    }
    buttons.push(
      {
        text: this.languageService.getTerm("action.cancel"),
        icon: ICONS.close,
        role: "cancel",
        cssClass: "cancel-icon",
        handler: () => {},
      }
    );

    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: buttons,
    });
    await actionSheet.present();
  }

  updateFormula() {
    this.units = this.formula.units;
    this.calculateFormula();
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.formula.main +
        "/" +
        APP_URL.menu.routes.formula.routes.management,
      {
        state: { formula: this.formula },
      }
    );
  }

  async shareFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.share"),
      message: this.languageService.getTerm("formulas.share.options.instructions"),
      cssClass: "alert share-alert",
      inputs: [
        {
          name: 'can_clone',
          type: 'checkbox',
          label: this.languageService.getTerm("formulas.can_clone"),
          value: 'can_clone',
          checked: this.formula.user.can_clone
        },
      ],
      buttons: [
        {
          text: this.languageService.getTerm("formulas.share.options.one"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            let can_clone: boolean = data && data.length > 0 && data[0] == "can_clone"
            this.shareOne(can_clone)
          },
        },
        {
          text: this.languageService.getTerm("formulas.share.options.group"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            let can_clone: boolean = data && data.length > 0 && data[0] == "can_clone"
            this.shareGroup(can_clone)
          },
        },
      ],
    });
    await alert.present();
  }

  async shareOne(can_clone: boolean) {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.share"),
      message: this.languageService.getTerm("formulas.share.instructions"),
      cssClass: "alert share-alert",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: this.languageService.getTerm("input.email"),
        },
      ],
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            this.shareFormulaToEmail({name: "----", email: data.email}, can_clone)
          },
        },
      ],
    });
    await alert.present();
  }
  
  async shareGroup(can_clone: boolean) {
    const modal = await this.modalController.create({
      component: UserGroupPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data !== undefined) {
      let user_groups: UserGroupModel[] = data.user_groups as UserGroupModel[]
      let users: UserResumeModel[] = [];
      user_groups.forEach(group => {
        group.users.forEach(user => {
          users.push(user)
        })
      })
      users = [...new Set(users)];
      users.forEach(user => {
        this.shareFormulaToEmail(user, can_clone, true)
      })
    }
  }
  
  shareFormulaToEmail(user_to_share: UserResumeModel, can_clone: boolean, toast: boolean = true) {
    let shared: boolean = false

    let formula = JSON.parse(JSON.stringify(this.formula));
    formula.user.can_clone = can_clone;
    formula.user.owner = user_to_share.email;
    formula.user.cloned = false;
    formula.user.reference = this.formula.id;
    formula.user.shared_users = [];

    if (this.formula.user.shared_users && this.formula.user.shared_users.length > 0) {
      this.formula.user.shared_users.forEach(user => {
        if (user.email == user_to_share.email) {
          shared = true
        }
      })
      if (shared == false) {
        this.formula.user.shared_users.push(user_to_share);
      }
    } else {
      this.formula.user.shared_users.push(user_to_share);
    }

    if (user_to_share.email == this.user.email) {
      shared = true
    }

    if (shared == false) {
      this.formulaCRUDService
        .createFormula(formula)
        .then(() => {
            this.formulaCRUDService
              .updateFormula(this.formula)
              .then(() => {
                if (toast) {
                  this.presentToast(true, user_to_share.email);
                }
              })
              .catch(() => {
                this.presentToast(false, user_to_share.email);
              });
        })
        .catch(() => {
          this.presentToast(false, user_to_share.email);
        });
    } else {
      this.presentToast(false, user_to_share.email);
    }
  }

  async cloneFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.clone"),
      message: this.languageService.getTerm("formulas.clone.instructions"),
      cssClass: "alert clone-alert",
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
            let formula = JSON.parse(JSON.stringify(this.formula));
            formula.user.owner = this.user.email;
            formula.user.cloned = true;
            formula.user.reference = "";
            formula.name = `${
              this.formula.name
            } (${this.languageService.getTerm("action.copy")})`;
            this.formulaCRUDService.createFormula(formula).then(() => {
              this.router.navigateByUrl(
                APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
              );
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.formula.name,
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
          handler: async () => {
            const loading = await this.loadingController.create({
              cssClass: "app-send-loading",
              message: this.languageService.getTerm("loading"),
            });
            await loading.present();

            this.formulaCRUDService.deleteFormula(this.formula.id)
              .then(() => {
                if (this.formula.user.reference) {
                  this.formulaCRUDService.getFormula(this.formula.user.reference)
                    .subscribe((original_formula) => {
                      original_formula.user.shared_users.forEach((user) => {
                        if (user.email == this.user.email) {
                          original_formula.user.shared_users.splice(original_formula.user.shared_users.indexOf(user), 1)
                        }
                      })
                      this.formulaCRUDService.updateFormula(original_formula)
                        .then(() => {
                          this.router.navigateByUrl(
                            APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
                          )
                        })
                    });
                } else {
                  this.router.navigateByUrl(
                    APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
                  )
                }
                
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
                )
              .catch(() => {
                this.presentToast(false);
              })
              .finally(async () => {
                await loading.dismiss();
              });
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async showCredits() {
    let creator_title = this.languageService.getTerm("credits.creator");
    let creator_name = `${this.formula.user.creator.name}<br/>${this.formula.user.creator.email}`;
    let creator_date = `${this.datePipe.transform(
      this.formula.user.creator.date.seconds * 1000,
      DATE_FORMAT
    )}`;
    let modifiers_title = this.languageService.getTerm("credits.modifiers");
    let modifiers = "";
    this.formula.user.modifiers.forEach((modifier) => {
      modifiers =
        modifiers +
        `${modifier.name}<br/>${modifier.email}<br>${this.datePipe.transform(
          modifier.date.seconds * 1000,
          DATE_FORMAT
        )}<br/><br/>`;
    });
    let text = `<strong>${creator_title}</strong><br/>${creator_name}<br/>${creator_date}<br/>`;
    if (modifiers) {
      text = text + `<br/><strong>${modifiers_title}</strong><br/>${modifiers}`;
    }
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("credits.name"),
      message: text,
      cssClass: "alert clone-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {},
        },
      ],
    });
    await alert.present();
  }

  async presentToast(success: boolean, email?: string) {
    let message = ""
    message = `${email}: `;
    if (success) {
      message = message + this.languageService.getTerm("formulas.share.success")
    } else {
      message = message + this.languageService.getTerm("formulas.share.error")
    }
    const toast = await this.toastController.create({
      message: message,
      color: "secondary",
      duration: 5000,
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

  async changeFormula() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    if (this.public) {
      this.formula.user.owner = "";
      this.formula.user.cloned = false;
    } else {
      this.formula.user.owner = this.user.email;
    }
    this.formulaCRUDService
      .updateFormula(this.formula)
      .then(() => {})
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }

  returnToList() {
    this.router.navigateByUrl(
      APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
    );
  }

  async startProduction(production: ProductionModel) {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();
    
    this.productionCRUDService
      .createProduction(production)
      .then(async (document) => {
        production.id = document.id;
        await this.productionStorageService
          .createProduction(production)
          .then(() => {
            this.router.navigateByUrl(
              APP_URL.menu.name +
                "/" +
                APP_URL.menu.routes.production.main +
                "/" +
                APP_URL.menu.routes.production.routes.details,
              {
                state: { production: production },
              }
            );
          });
      })
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }

  async doFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.do_production"),
      message: this.languageService.getTerm("formulas.do_production.units"),
      cssClass: "alert do-production-alert",
      inputs: [
        {
          name: "number",
          type: "number",
          placeholder: this.languageService.getTerm("formulas.units"),
        },
      ],
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            data.number = Number(
              this.formatNumberService.formatNonZeroPositiveNumber(data.number)
            );
            let production: ProductionModel = new ProductionModel();
            production.name = this.formula.name;
            production.formulas = [{ formula: this.formula, number: data.number, warming_time: 10 }]
            production.owner = {
              name: this.user.name,
              email: this.user.email,
              date: new Date(),
            };
            this.startProduction(production);
          },
        },
      ],
    });
    await alert.present();
  }

  compoundIngredientNotInStep(ingredientFormula: any) {
    let compound_in_step = false
    this.formula.steps.forEach(step => {
      if (step.ingredients) {
        step.ingredients.forEach(ingredient => {
          if (ingredient.ingredient.id == ingredientFormula.ingredient.id) {
            compound_in_step = true
          }
        })
      }
    })
    return !compound_in_step
  }
}
