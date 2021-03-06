import { Component, OnInit } from "@angular/core";
import { UserGroupModel, UserModel, UserResumeModel } from "src/app/core/models/user.model";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { CourseModel, OrderedItemModel } from "src/app/core/models/course.model";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { AlertController, IonRouterOutlet, LoadingController, ModalController, ToastController, ViewWillEnter } from "@ionic/angular";
import { IngredientPickerModal } from "src/app/shared/modal/ingredient/ingredient-picker.modal";
import { FormulaModel, IngredientPercentageModel } from "src/app/core/models/formula.model";
import { LanguageService } from "src/app/core/services/language.service";
import { FormulaNumberModel, ProductionModel } from "src/app/core/models/production.model";
import { FormulaPickerModal } from "src/app/shared/modal/formula/formula-picker.modal";
import { ProductionPickerModal } from "src/app/shared/modal/production/production-picker.modal";
import { UserGroupPickerModal } from "src/app/shared/modal/user-group/user-group-picker.modal";
import { CourseCRUDService } from "src/app/core/services/firebase/course.service";
import { CourseService } from "src/app/core/services/course.service";
import { UserCRUDService } from "src/app/core/services/firebase/user.service";
import { NoteModel } from "src/app/core/models/shared.model";
import { NotesModal } from "src/app/shared/modal/notes/notes.modal";

@Component({
  selector: "app-course-manage",
  templateUrl: "course-manage.page.html",
  styleUrls: [
    "./styles/course-manage.page.scss",
    "../../../../shared/styles/note.alert.scss",
    "../../../../shared/styles/confirm.alert.scss",
  ],
})
export class CourseManagePage implements OnInit, ViewWillEnter {
  APP_URL = APP_URL;
  ICONS = ICONS;

  course: CourseModel = new CourseModel();
  original_course: CourseModel = new CourseModel();

  manageCourseForm: FormGroup;
  update: boolean = false;

  user: UserModel = new UserModel();

  constructor(
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private courseService: CourseService,
    private courseCRUDService: CourseCRUDService,
    private userStorageService: UserStorageService,
    private languageService: LanguageService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private userCRUDService: UserCRUDService,
  ) {}

  async ngOnInit() {
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
        shared_groups: [],
        shared_references: [],
        creator: {
          name: this.user.name,
          email: this.user.email,
          date: new Date(),
        },
        modifiers: [],
        last_modified: new Date()
      };
    } else {
      this.update = true;
      this.manageCourseForm = new FormGroup({
        name: new FormControl(state.course.name, Validators.required),
        description: new FormControl(state.course.description, null)
      });
      this.original_course = JSON.parse(JSON.stringify(state.course))
      this.course.id = state.course.id;
      this.course.user = state.course.user;
      this.course.notes = [];
      this.course.ingredients = [];
      this.course.formulas = [];
      this.course.productions = [];
      if (state.course.notes?.length > 0) {
        state.course.notes.forEach((note) => {
          this.course.notes.push(JSON.parse(JSON.stringify(note)));
        });
      }
      if (state.course.ingredients && state.course.ingredients.length > 0) {
        state.course.ingredients.forEach((ingredient) => {
          this.course.ingredients.push(JSON.parse(JSON.stringify(ingredient)));
        });
        this.course.ingredients = this.courseService.orderItems(this.course.ingredients);
      }
      if (state.course.formulas && state.course.formulas.length > 0) {
        state.course.formulas.forEach((formula) => {
          this.course.formulas.push(JSON.parse(JSON.stringify(formula)));
        });
        this.course.formulas = this.courseService.orderItems(this.course.formulas);
      }
      if (state.course.productions && state.course.productions.length > 0) {
        state.course.productions.forEach((production) => {
          this.course.productions.push(JSON.parse(JSON.stringify(production)));
        });
        this.course.productions = this.courseService.orderItems(this.course.productions);
      }
    }
    this.user = await this.userStorageService.getUser();
  }

  ionViewWillEnter() {
    if (this.course.id) {
      this.update = true;
    } else {
      this.update = false;
    }
  }

  async sendCourse() {
    this.course.name = this.manageCourseForm.value.name;
    this.course.description = this.manageCourseForm.value.description;

    this.course.user.shared_references = [];
    this.course.user.shared_groups.forEach(userGroup => {
      userGroup.users.forEach(user => {
        this.course.user.shared_references.push(user.email);
      })
    })
    this.course.user.shared_users.forEach(user => {
      this.course.user.shared_references.push(user.email);
    })

    this.saveOrder();
    
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
        this.courseCRUDService
          .update(this.course, this.original_course)
          .then(() => {
            this.router.navigateByUrl(
              APP_URL.menu.name +
              "/" +
              APP_URL.menu.routes.settings.main +
              "/" +
              APP_URL.menu.routes.settings.routes.course.main +
              "/" +
              APP_URL.menu.routes.settings.routes.course.routes.details,
              {
                state: { course: JSON.parse(JSON.stringify(this.course)) },
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
      this.course.user.owner = this.user.email;
      this.course.user.creator = {
        name: this.user.name,
        email: this.user.email,
        date: new Date(),
      };
      const loading = await this.loadingController.create({
        cssClass: "app-send-loading",
        message: this.languageService.getTerm("loading"),
      });
      await loading.present();
      this.courseCRUDService
        .create(this.course)
        .then(() => {
          this.router.navigateByUrl(
            APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.settings.main +
            "/" +
            APP_URL.menu.routes.settings.routes.course.main +
            "/" +
            APP_URL.menu.routes.settings.routes.course.routes.details,
            {
              state: { course: JSON.parse(JSON.stringify(this.course)) },
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

  saveOrder() {
    if (this.course.productions?.length > 0) {
      this.course.productions.forEach((production, index) => {
        this.course.productions[index].order = index;
        this.course.productions[index].item.user.can_clone = this.course.user.can_clone;
      })
    }
    if (this.course.formulas?.length > 0) {
      this.course.formulas.forEach((formula, index) => {
        this.course.formulas[index].order = index;
        this.course.formulas[index].item.user.can_clone = this.course.user.can_clone;
      })
    }
    if (this.course.ingredients?.length > 0) {
      this.course.ingredients.forEach((ingredient, index) => {
        this.course.ingredients[index].order = index;
        this.course.ingredients[index].item.user.can_clone = this.course.user.can_clone;
      })
    }
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

  dontSubmitCourse(): boolean {
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

  async addNotes() {
    let notes: Array<NoteModel>;
    if (this.course.notes) {
      notes = JSON.parse(JSON.stringify(this.course.notes))
    }
    const modal = await this.modalController.create({
      component: NotesModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        notes: notes
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.course.notes = data;
    }
  }

  async ingredientPicker() {
    let ingredients = this.course.ingredients ? this.course.ingredients : [];
    let aux_ingredients: IngredientPercentageModel[] = [];
    ingredients.forEach(ing => {
      aux_ingredients.push({
        ingredient: ing.item as IngredientModel,
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
      data.ingredients.forEach((ing: IngredientPercentageModel) => {
        this.course.ingredients.push({ order: 0, item: ing.ingredient })
      })
    }
  }

  reorderIngredients(event) {
    const draggedItem = this.course.ingredients.splice(event.detail.from, 1)[0];
    this.course.ingredients.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();  
  }

  deleteIngredient(ingredient: OrderedItemModel) {
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
        formula: formula.item as FormulaModel,
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
      data.formulas.forEach((formula: FormulaNumberModel) => {
        this.course.formulas.push({ order: 0, item: formula.formula })
      })
    }
  }

  reorderFormulas(event) {
    const draggedItem = this.course.formulas.splice(event.detail.from, 1)[0];
    this.course.formulas.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();  
  }

  deleteFormula(formula: OrderedItemModel) {
    this.course.formulas.splice(
      this.course.formulas.indexOf(formula),
      1
    );
  }

  async productionPicker() {
    let productions = this.course.productions ? this.course.productions : [];
    let aux_productions: ProductionModel[] = [];
    productions.forEach(production => {
      aux_productions.push(production.item as ProductionModel)
    })
    const modal = await this.modalController.create({
      component: ProductionPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedProductions: aux_productions,
        forProduction: true,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.course.productions = [];
      data.productions.forEach((production: ProductionModel) => {
        this.course.productions.push({ order: 0, item: production })
      })
    }
  }

  reorderProductions(event) {
    const draggedItem = this.course.productions.splice(event.detail.from, 1)[0];
    this.course.productions.splice(event.detail.to, 0, draggedItem);
    event.detail.complete();  
  }

  deleteProduction(production: OrderedItemModel) {
    this.course.productions.splice(
      this.course.productions.indexOf(production),
      1
    );
  }

  async shareCourse() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.share"),
      message: this.languageService.getTerm("formulas.share.options.instructions"),
      cssClass: "alert share-alert",
      buttons: [
        {
          text: this.languageService.getTerm("formulas.share.options.one"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            this.shareOne();
          },
        },
        {
          text: this.languageService.getTerm("formulas.share.options.group"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            this.userGroupsPicker();
          },
        },
      ],
    });
    await alert.present();
  }

  async shareOne() {
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
                this.shareCourseToEmail({ name: user.name, email: user.email })
              }).catch(() => {
                this.presentToast(false);
              })
          },
        },
      ],
    });
    await alert.present();
  }

  shareCourseToEmail(user_to_share: UserResumeModel) {
    let shared: boolean = false

    if (this.course.user.shared_users && this.course.user.shared_users.length > 0) {
      shared = false;
      this.course.user.shared_users.forEach(user => {
        if (user.email == user_to_share.email) {
          shared = true
        }
      })
      if (shared == false && user_to_share.email !== this.user.email) {
        this.course.user.shared_users.push(user_to_share);
      }
    } else {
      this.course.user.shared_users = [user_to_share];
    }
  }

  deleteUser(user: UserResumeModel) {
    this.course.user.shared_users.splice(
      this.course.user.shared_users.indexOf(user),
      1
    );
  }

  async userGroupsPicker() {
    let aux_user_groups: UserGroupModel[] = this.course.user.shared_groups ? this.course.user.shared_groups : [];
    const modal = await this.modalController.create({
      component: UserGroupPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedGroups: aux_user_groups
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      let user_groups: UserGroupModel[] = data.user_groups as UserGroupModel[]
      this.course.user.shared_groups = user_groups;
    }
  }

  deleteUserGroup(userGroup: UserGroupModel) {
    this.course.user.shared_groups.splice(
      this.course.user.shared_groups.indexOf(userGroup),
      1
    );
  }
}
