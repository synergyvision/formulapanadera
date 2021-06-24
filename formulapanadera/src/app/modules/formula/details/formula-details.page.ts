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
import { DATE_FORMAT, DECIMALS, DECIMAL_BAKERS_PERCENTAGE_FORMAT, DECIMAL_COST_FORMAT, MOMENT_DATE_FORMAT } from "src/app/config/formats";
import { DatePipe } from "@angular/common";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from 'src/app/core/models/production.model';
import { FormatNumberService } from 'src/app/core/services/format-number.service';
import { ProductionCRUDService } from 'src/app/core/services/firebase/production.service';
import { UserGroupPickerModal } from 'src/app/shared/modal/user-group/user-group-picker.modal';
import { UserCRUDService } from "src/app/core/services/firebase/user.service";
import { SettingsStorageService } from "src/app/core/services/storage/settings.service";
import * as moment from "moment";

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
  units: number;

  bakers_percentage: string;
  total_weight: number;
  hydration: number;
  fat: number;
  unitary_cost: number;
  total_cost: string;

  currency: string = CURRENCY;

  ingredients: Array<IngredientPercentageModel>;
  steps: Array<StepDetailsModel>;
  ingredients_formula: Array<any> = [];
  isCourse: boolean = false;

  showOrganolepticCharacteristics: boolean;
  showNotes: boolean;
  showReferences: boolean;
  showIngredients: boolean;
  showSubIngredients: boolean;
  showMixing: boolean;
  showSteps: boolean;
  showTimes: boolean

  user: UserResumeModel = new UserResumeModel();
  is_modifier: boolean = false

  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    private languageService: LanguageService,
    private settingsStorageService: SettingsStorageService,
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
    private userCRUDService: UserCRUDService,
  ) {
    this.showOrganolepticCharacteristics = false;
    this.showNotes = false;
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
        this.isCourse = navParams.isCourse ? navParams.isCourse : false;
      }

      this.units = this.formula.units;
      this.ingredients = JSON.parse(JSON.stringify(this.formula.ingredients));
      if (this.formula.steps && this.formula.steps.length > 0) {
        this.steps = JSON.parse(JSON.stringify(this.formula.steps));
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
    let aux_formula: FormulaModel = JSON.parse(JSON.stringify(this.formula))
    aux_formula.units = this.units
    aux_formula.ingredients = JSON.parse(JSON.stringify(this.ingredients))
    let formula_without_compound = this.formulaService.getFormulaWithoutCompoundIngredients(aux_formula);
    let bakers_p = formula_without_compound.bakers_percentage;
    this.hydration = Number(
      this.formulaService.calculateHydration(formula_without_compound.formula.ingredients)
    );
    this.fat = Number(
      this.formulaService.calculateFat(formula_without_compound.formula.ingredients)
    );
    this.total_cost = this.formulaService.calculateTotalCost(
      formula_without_compound.formula.ingredients,
      Number(bakers_p)
    );
    this.unitary_cost = Number(this.total_cost) / this.units;

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

    if (this.steps && this.steps.length > 0) {
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
    }

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
    if (this.formula.steps && this.formula.steps.length > 0) {
      buttons.push({
        text: this.languageService.getTerm("action.do_production"),
        icon: ICONS.production_start,
        cssClass: "action-icon",
        handler: () => {
          this.doFormula();
        },
      });
    }
    if (!this.isCourse) {
      if (
        this.formula.user.owner == current_user
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
        this.formula.user.owner == current_user && (this.is_modifier || this.formula.user.creator.email == current_user)
      ) {
        buttons.push({
          text: this.languageService.getTerm("action.share"),
          icon: ICONS.share,
          cssClass: "action-icon",
          handler: async () => {
            let private_ing: boolean = false
            let share: boolean = true
            this.formula.ingredients.forEach(ingredient => {
              if (ingredient.ingredient.user && !ingredient.ingredient.user.public) {
                private_ing = true
              }
            })
            if (private_ing) {
              share = await this.sharePrivateIngredientsFormulaQuestion()
            }
            if (share == true) {
              this.shareFormula();
            }
          },
        });
      }
    }
    if (this.formula.user.owner == current_user || this.formula.user.can_clone) {
      buttons.push({
        text: this.languageService.getTerm("action.clone"),
        icon: ICONS.clone,
        cssClass: "action-icon",
        handler: () => {
          this.cloneFormulaAlert();
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
    if (!this.isCourse && this.formula.user.owner == current_user) {
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
        state: { formula: JSON.parse(JSON.stringify(this.formula)) },
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

  async sharePrivateIngredientsFormulaQuestion() {
    let share;
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.formula_privacy_question"),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {
            alert.dismiss(false);
            return false;
          },
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            alert.dismiss(true);
            return false;
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss().then((data) => {
        share = data.data
    })
    return share
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
            this.userCRUDService.getUser(data.email)
              .then((user) => {
                this.shareFormulaToEmail([{name: user.name, email: user.email}], can_clone)
              }).catch(() => {
                this.presentToast(false);
              })
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
      this.shareFormulaToEmail(users, can_clone, true)
    }
  }
  
  shareFormulaToEmail(users_to_share: UserResumeModel[], can_clone: boolean, toast: boolean = true) {
    let shared: boolean = false

    this.formula.user.can_clone = can_clone;

    if (this.formula.user.shared_references && this.formula.user.shared_references.length > 0) {
      users_to_share.forEach((newUser) => {
        shared = false;
        this.formula.user.shared_references.forEach(user => {
          if (user == newUser.email) {
            shared = true
          }
        })
        if (shared == false && newUser.email !== this.user.email) {
          this.formula.user.shared_users.push(newUser);
          this.formula.user.shared_references.push(newUser.email);
        }
      })
    } else {
      this.formula.user.shared_users = users_to_share;
      this.formula.user.shared_references = [];
      users_to_share.forEach(user => {
        this.formula.user.shared_references.push(user.email);
      })
    }

    this.formulaCRUDService
      .update(this.formula, this.formula)
      .then(() => {
        if (toast) {
          this.presentToast(true);
        }
      })
      .catch(() => {
        this.presentToast(false);
      });
  }

  async cloneFormulaAlert() {
    let settings = await this.settingsStorageService.getSettings();
    if (settings.clone_alert) {
      const alert = await this.alertController.create({
        header: this.languageService.getTerm("action.clone"),
        message: this.languageService.getTerm("formulas.clone.instructions"),
        cssClass: "alert clone-alert",
        inputs: [
          {
            name: 'repeat',
            type: 'checkbox',
            label: this.languageService.getTerm("action.stop_alert"),
            value: 'repeat',
          },
        ],
        buttons: [
          {
            text: this.languageService.getTerm("action.cancel"),
            role: "cancel",
            handler: () => { },
          },
          {
            text: this.languageService.getTerm("action.ok"),
            cssClass: "confirm-alert-accept",
            handler: (data) => {
              let repeat: boolean = data && data.length > 0 && data[0] == "repeat";
              settings.clone_alert = !repeat;
              this.settingsStorageService.setSettings(settings);
              this.cloneFormula();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.cloneFormula();
    }
  }

  async cloneFormula() {
    let formula: FormulaModel = JSON.parse(JSON.stringify(this.formula));
    delete(formula.id)
    formula.user.owner = this.user.email;
    formula.user.public = false;
    formula.user.reference = this.formula.id;
    formula.user.shared_references = [];
    formula.user.shared_users = [];
    formula.name = `${
      this.formula.name
    } (${this.languageService.getTerm("action.copy")})`;
    this.formulaCRUDService.create(formula).then(() => {
      this.router.navigateByUrl(
        APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
      );
    });
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

            this.formulaCRUDService
              .delete(this.formula)
              .then(async () => {
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
                )
              })
              .catch(() => {
                this.presentToast(false);
              })
              .finally(async () => {
                await loading.dismiss();
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
    let creator_date = "";
    if (typeof this.formula.user.creator.date === 'object' && this.formula.user.creator.date !== null) {
      creator_date = this.datePipe.transform(this.formula.user.creator.date.seconds * 1000, DATE_FORMAT);
    } else if (this.formula.user.creator.date !== null) {
      creator_date = moment(this.formula.user.creator.date).format(MOMENT_DATE_FORMAT);
    }
    let modifiers_title = this.languageService.getTerm("credits.modifiers");
    let modifiers = "";
    this.formula.user.modifiers.forEach((modifier) => {
      let date = "";
      if (typeof modifier.date === 'object' && modifier.date !== null) {
        date = this.datePipe.transform(modifier.date.seconds * 1000, DATE_FORMAT);
      } else if (modifier.date !== null) {
        date = moment(modifier.date).format(MOMENT_DATE_FORMAT);
      }
      modifiers =
        modifiers +
        `${modifier.name}<br/>${modifier.email}<br>${date}<br/><br/>`;
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

  async presentToast(success: boolean) {
    let message = "";
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

  async changeFormula(type: 'public' | 'clone', value: any) {
    let share: boolean = true;

    if (type == 'public') {
      this.formula.user.public = value;
    } else {
      this.formula.user.can_clone = value
    }
    if (type == "public" && value) {
      let private_ing: boolean = false
      this.formula.ingredients.forEach(ingredient => {
        if (ingredient.ingredient.user && !ingredient.ingredient.user.public) {
          private_ing = true
        }
      })
      if (private_ing) {
        share = await this.sharePrivateIngredientsFormulaQuestion()
      }
    }
    
    if (share == true) {
      const loading = await this.loadingController.create({
        cssClass: "app-send-loading",
        message: this.languageService.getTerm("loading"),
      });
      await loading.present();
      this.formulaCRUDService
        .update(this.formula, this.formula)
        .then(() => { })
        .catch(() => {
          this.presentToast(false);
        })
        .finally(async () => {
          await loading.dismiss();
        });
    } else {
      this.formula.user.public = false;
    }
  }

  async startProduction(production: ProductionModel) {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();
    
    this.productionCRUDService
      .create(production)
      .then(async () => {
        this.router.navigateByUrl(
          APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.production.main +
            "/" +
            APP_URL.menu.routes.production.routes.details,
          {
            state: { production: JSON.parse(JSON.stringify(production)) },
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
            production.user.creator = {
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
    if (this.formula.steps && this.formula.steps.length > 0) {
      this.formula.steps.forEach(step => {
        if (step.ingredients) {
          step.ingredients.forEach(ingredient => {
            if (ingredient.ingredient.id == ingredientFormula.ingredient.id) {
              compound_in_step = true
            }
          })
        }
      })
    }
    return !compound_in_step
  }
}
