import { Component, OnInit } from "@angular/core";
import { UserResumeModel } from "src/app/core/models/user.model";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { IonRouterOutlet, LoadingController, ModalController, ToastController } from "@ionic/angular";
import { IngredientPickerModal } from "src/app/shared/modal/ingredient/ingredient-picker.modal";
import { FormulaModel, IngredientPercentageModel } from "src/app/core/models/formula.model";
import { LanguageService } from "src/app/core/services/language.service";
import { FormulaNumberModel, ProductionModel } from "src/app/core/models/production.model";
import { FormulaPickerModal } from "src/app/shared/modal/formula/formula-picker.modal";
import { ProductionPickerModal } from "src/app/shared/modal/production/production-picker.modal";

@Component({
  selector: "app-course-manage",
  templateUrl: "course-manage.page.html",
  styleUrls: [
    "./styles/course-manage.page.scss",
    "../../../../shared/styles/note.alert.scss",
    "../../../../shared/styles/confirm.alert.scss",
  ],
})
export class CourseManagePage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  course: CourseModel = new CourseModel();

  manageCourseForm: FormGroup;
  update: boolean = false;

  user: UserResumeModel = new UserResumeModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private userStorageService: UserStorageService,
    private languageService: LanguageService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private toastController: ToastController,
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      let state = this.router.getCurrentNavigation().extras.state;
      this.course = new CourseModel();
      this.update = false;
      if (state == undefined) {
        this.manageCourseForm = new FormGroup({
          name: new FormControl(null, Validators.required),
          description: new FormControl(null, null),
        });
        this.course.user = {
          owner: this.user.email,
          can_clone: false,
          public: false,
          reference: "",
          shared_users: [],
          shared_references: [],
          creator: {
            name: this.user.name,
            email: this.user.email,
            date: new Date(),
          },
          modifiers: [],
        };
      } else {
        this.update = true;
        this.manageCourseForm = new FormGroup({
          name: new FormControl(state.course.name, Validators.required),
          description: new FormControl(state.course.description, null)
        });
        this.course.id = state.course.id;
        this.course.user = state.course.user;
        this.course.ingredients = [];
        this.course.formulas = [];
        this.course.productions = [];
        if (state.course.ingredients && state.course.ingredients.length > 0) {
          state.course.ingredients.forEach((ingredient) => {
            this.course.ingredients.push(JSON.parse(JSON.stringify(ingredient)));
          });
        }
        if (state.course.formulas && state.course.formulas.length > 0) {
          state.course.formulas.forEach((formula) => {
            this.course.formulas.push(JSON.parse(JSON.stringify(formula)));
          });
        }
        if (state.course.productions && state.course.productions.length > 0) {
          state.course.productions.forEach((production) => {
            this.course.productions.push(JSON.parse(JSON.stringify(production)));
          });
        }
      }
      this.user = await this.userStorageService.getUser();
    })
  }

  async sendCourse() {
    this.course.name = this.manageCourseForm.value.name;
    this.course.description = this.manageCourseForm.value.description;
    
    if (this.update) {
      this.course.user.modifiers.push({
        name: this.user.name,
        email: this.user.email,
        date: new Date(),
      });
        const loading = await this.loadingController.create({
          cssClass: "app-send-loading",
          message: this.languageService.getTerm("loading"),
        });
        await loading.present();
        // this.courseCRUDService
        //   .updateCourse(this.course)
        //   .then(() => {
        //     this.router.navigateByUrl(
        //       APP_URL.menu.name +
        //       "/" +
        //       APP_URL.menu.routes.formula.main +
        //       "/" +
        //       APP_URL.menu.routes.formula.routes.details,
        //       {
        //         state: { course: JSON.parse(JSON.stringify(this.course)) },
        //       }
        //     );
        //   })
        //   .catch(() => {
        //     this.presentToast(false);
        //   })
        //   .finally(async () => {
        //     await loading.dismiss();
        //   });
    } else {
      this.course.user = {
        owner: this.user.email,
        can_clone: this.course.user.can_clone,
        public: this.course.user.public,
        reference: "",
        shared_users: [],
        shared_references: [],
        creator: {
          name: this.user.name,
          email: this.user.email,
          date: new Date(),
        },
        modifiers: [],
      };
      const loading = await this.loadingController.create({
        cssClass: "app-send-loading",
        message: this.languageService.getTerm("loading"),
      });
      await loading.present();
      // this.formulaCRUDService
      //   .createFormula(this.formula)
      //   .then(() => {
      //     this.router.navigateByUrl(
      //       APP_URL.menu.name +
      //       "/" +
      //       APP_URL.menu.routes.formula.main +
      //       "/" +
      //       APP_URL.menu.routes.formula.routes.details,
      //       {
      //         state: { formula: JSON.parse(JSON.stringify(this.formula)) },
      //       }
      //     );
      //   })
      //   .catch(() => {
      //     this.presentToast(false);
      //   })
      //   .finally(async () => {
      //     await loading.dismiss();
      //   });
    }

    console.log(this.course)
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

  dontSubmitCourse(): boolean{
    return (
      !this.manageCourseForm.valid ||
      (
        (!this.course.ingredients || this.course.ingredients.length == 0) &&
        (!this.course.formulas || this.course.formulas.length == 0) &&
        (!this.course.productions || this.course.productions.length == 0)
      )
    )
  }

  // Pickers

  async ingredientPicker() {
    let ingredients = this.course.ingredients ? this.course.ingredients : [];
    let aux_ingredients: IngredientPercentageModel[] = [];
    ingredients.forEach(ing => {
      aux_ingredients.push({
        ingredient: ing,
        percentage: 0
      })
    })
    const modal = await this.modalController.create({
      component: IngredientPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedIngredients: aux_ingredients,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.course.ingredients = [];
      data.ingredients.forEach(ing => {
        this.course.ingredients.push(ing.ingredient)
      })
    }
  }

  deleteIngredient(ingredient: IngredientModel) {
    this.course.ingredients.splice(
      this.course.ingredients.indexOf(ingredient),
      1
    );
  }

  async formulaPicker() {
    let formulas = this.course.formulas ? this.course.formulas : [];
    let aux_formulas: FormulaNumberModel[] = [];
    formulas.forEach(formula => {
      aux_formulas.push({
        formula: formula,
        number: 0
      })
    })
    const modal = await this.modalController.create({
      component: FormulaPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedFormulas: aux_formulas,
        forProduction: true,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.course.formulas = [];
      data.formulas.forEach(formula => {
        this.course.formulas.push(formula.formula)
      })
    }
  }

  deleteFormula(formula: FormulaModel) {
    this.course.formulas.splice(
      this.course.formulas.indexOf(formula),
      1
    );
  }

  async productionPicker() {
    let productions = this.course.productions ? this.course.productions : [];
    const modal = await this.modalController.create({
      component: ProductionPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedProductions: productions,
        forProduction: true,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.course.productions = data.productions;
    }
  }

  deleteProduction(production: ProductionModel) {
    this.course.productions.splice(
      this.course.productions.indexOf(production),
      1
    );
  }
}
