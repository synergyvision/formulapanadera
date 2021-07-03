import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { FormulaModel } from "src/app/core/models/formula.model";
import { IngredientListingModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";

@Component({
  selector: "app-shared-course-item",
  templateUrl: "./shared-course-item.component.html",
  styleUrls: ["./styles/shared-course-item.component.scss"],
})
export class SharedCourseItemComponent {
  ICONS = ICONS;
  APP_URL = APP_URL;

  @Input() course: CourseModel;
  @Input() type: "production" | "formula" | "ingredient"
  @Input() even: boolean = false;

  show: boolean = false;

  constructor(
    private router: Router,
    private ingredientCRUDService: IngredientCRUDService
  ) { }
  
  courseDetails(course: CourseModel) {
    if (course) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.settings.main +
        "/" +
        APP_URL.menu.routes.settings.routes.course.main +
        "/" +
        APP_URL.menu.routes.settings.routes.course.routes.details,
        {
          state: { course: JSON.parse(JSON.stringify(course)) },
        }
      );
    }
  }

  productionDetails(production: ProductionModel) {
    if (production.name !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.production.main +
          "/" +
          APP_URL.menu.routes.production.routes.details,
        {
          state: {
            production: JSON.parse(JSON.stringify(production)),
            isCourse: true
          },
        }
      );
    }
  }

  formulaDetails(formula: FormulaModel) {
    if (formula.name !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.formula.main +
          "/" +
          APP_URL.menu.routes.formula.routes.details,
        {
          state: {
            formula: JSON.parse(JSON.stringify(formula)),
            isCourse: true
          },
        }
      );
    }
  }

  async ingredientDetails(listing_ingredient: IngredientListingModel) {
    if (listing_ingredient.name !== undefined) {
      let ingredient = await this.ingredientCRUDService.updatedCacheData(listing_ingredient);
      if (ingredient) {
        this.router.navigateByUrl(
          APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.ingredient.main +
          "/" +
          APP_URL.menu.routes.ingredient.routes.details,
          {
            state: {
              ingredient: JSON.parse(JSON.stringify(ingredient)),
              isCourse: true
            },
          }
        );
      }
    }
  }
}
