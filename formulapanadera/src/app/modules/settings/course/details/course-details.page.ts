import { Component, OnInit } from "@angular/core";
import { UserModel } from "src/app/core/models/user.model";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { ActivatedRoute, Router } from "@angular/router";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { LanguageService } from "src/app/core/services/language.service";
import { ActionSheetController, AlertController, LoadingController, ToastController } from "@ionic/angular";
import { CourseCRUDService } from "src/app/core/services/firebase/course.service";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { FormulaModel } from "src/app/core/models/formula.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { CourseService } from "src/app/core/services/course.service";

@Component({
  selector: "app-course-details",
  templateUrl: "course-details.page.html",
  styleUrls: [
    "./styles/course-details.page.scss",
    "../../../../shared/styles/note.alert.scss",
    "../../../../shared/styles/confirm.alert.scss",
  ],
})
export class CourseDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  course: CourseModel = new CourseModel();
  segment: string = "productions"

  user: UserModel = new UserModel();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private courseCRUDService: CourseCRUDService,
    private languageService: LanguageService,
    private userStorageService: UserStorageService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      let navParams = this.router.getCurrentNavigation().extras.state;
      if (navParams) {
        this.course = navParams.course;
        this.segment = this.course.productions?.length > 0 ? "productions" : this.course.formulas?.length > 0 ? "formulas" : "ingredients"
        if (this.course.productions?.length > 0) {
          this.course.productions = this.courseService.orderItems(this.course.productions);
        }
        if (this.course.formulas?.length > 0) {
          this.course.formulas = this.courseService.orderItems(this.course.formulas);
        }
        if (this.course.ingredients?.length > 0) {
          this.course.ingredients = this.courseService.orderItems(this.course.ingredients);
        }
      }
      this.user = await this.userStorageService.getUser();
    })
  }

  async changeCourse(value: any) {
    this.course.user.can_clone = value;
    this.setPermissions();
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();
    this.courseCRUDService
      .updateCourse(this.course, this.course)
      .then(() => { })
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }

  setPermissions() {
    if (this.course.productions?.length > 0) {
      this.course.productions.forEach((production) => {
        production.item.user.can_clone = this.course.user.can_clone;
      })
    }
    if (this.course.formulas?.length > 0) {
      this.course.formulas.forEach((formula) => {
        formula.item.user.can_clone = this.course.user.can_clone;
      })
    }
    if (this.course.ingredients?.length > 0) {
      this.course.ingredients.forEach((ingredient) => {
        ingredient.item.user.can_clone = this.course.user.can_clone;
      })
    }
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  //Options

  async presentOptions() {
    let current_user = this.user.email;
    let buttons = [];
    if (
      this.course.user.owner == current_user
    ) {
      buttons.push({
        text: this.languageService.getTerm("action.update"),
        icon: ICONS.create,
        cssClass: "action-icon",
        handler: () => {
          this.updateCourse();
        },
      });
    }
    if (this.course.user.owner == current_user) {
      buttons.push({
        text: this.languageService.getTerm("action.delete"),
        icon: ICONS.trash,
        cssClass: "delete-icon",
        handler: () => {
          this.deleteCourse();
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

  updateCourse() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.settings.main +
        "/" +
        APP_URL.menu.routes.settings.routes.course.main +
        "/" +
        APP_URL.menu.routes.settings.routes.course.routes.management,
      {
        state: { course: JSON.parse(JSON.stringify(this.course)) },
      }
    );
  }

  async deleteCourse() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.course.name,
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

            this.courseCRUDService
              .deleteCourse(this.course)
              .then(async () => {
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" +
                  APP_URL.menu.routes.settings.main + "/" +
                  APP_URL.menu.routes.settings.routes.course.main
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

  details(
    type: "ingredient" | "formula" | "production",
    item: IngredientModel | FormulaModel | ProductionModel
  ) {
    if (item.name !== undefined) {
      if (type == "ingredient") {
        this.router.navigateByUrl(
          APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.ingredient.main +
            "/" +
            APP_URL.menu.routes.ingredient.routes.details,
          {
            state: { ingredient: JSON.parse(JSON.stringify(item)) },
          }
        );
      }
      if (type == "formula") {
        this.router.navigateByUrl(
          APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.formula.main +
          "/" +
          APP_URL.menu.routes.formula.routes.details,
          {
            state: { formula: JSON.parse(JSON.stringify(item)) },
          }
        );
      }
      if (type == "production") { 
        this.router.navigateByUrl(
          APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.production.main +
            "/" +
            APP_URL.menu.routes.production.routes.details,
          {
            state: { production: JSON.parse(JSON.stringify(item)) },
          }
        );
      }
    }
  }
}
