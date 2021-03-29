import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { FormulaModel } from "src/app/core/models/formula.model";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { UserModel } from "src/app/core/models/user.model";
import { CourseService } from "src/app/core/services/course.service";
import { CourseCRUDService } from "src/app/core/services/firebase/course.service";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
import { UserCRUDService } from "src/app/core/services/firebase/user.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { IngredientService } from "src/app/core/services/ingredient.service";
import { ProductionService } from "src/app/core/services/production.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { TimeService } from "src/app/core/services/time.service";
import { ShellModel } from "src/app/shared/shell/shell.model";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["./styles/tabs.page.scss"],
})
export class TabsPage implements OnInit, OnDestroy {
  ICONS = ICONS;

  user: UserModel;

  myCoursesSubscriber: Subscription;
  coursesSubscriber: Subscription;
  productionsSubscriber: Subscription;
  formulasSubscriber: Subscription;
  ingredientsSubscriber: Subscription;

  constructor(
    private timeService: TimeService,
    private userCRUDService: UserCRUDService,
    private userStorageService: UserStorageService,
    private courseCRUDService: CourseCRUDService,
    private courseService: CourseService,
    private productionCRUDService: ProductionCRUDService,
    private productionService: ProductionService,
    private formulaCRUDService: FormulaCRUDService,
    private formulaService: FormulaService,
    private ingredientCRUDService: IngredientCRUDService,
    private ingredientService: IngredientService
  ) { }

  async ngOnInit() {
    this.timeService.startCurrentTime();
    let user = await this.userStorageService.getUser();
    this.user = await this.userCRUDService.getUser(user.email)
    await this.userStorageService.setUser(this.user);
    this.ingredientsSubscriber = this.ingredientCRUDService
      .getIngredientsDataSource(this.user.email)
      .subscribe(async (ingredients) => {
        let ingredients_aux = JSON.parse(JSON.stringify(ingredients)) as IngredientModel[];
        const promises = ingredients_aux.map((ing)=>this.ingredientCRUDService.getSubIngredients(ing))
        await Promise.all(promises)
        this.ingredientService.setIngredients(
          ingredients_aux as IngredientModel[] & ShellModel
        );
      });
    this.formulasSubscriber = this.formulaCRUDService
      .getFormulasDataSource(this.user.email)
      .subscribe(async (formulas) => {
        let formulas_aux = JSON.parse(JSON.stringify(formulas)) as FormulaModel[];
        const promises = formulas_aux.map((form)=>this.formulaCRUDService.getIngredients(form))
        await Promise.all(promises)
        this.formulaService.setFormulas(
          formulas_aux as FormulaModel[] & ShellModel
        );
      });
    this.productionsSubscriber = this.productionCRUDService
      .getProductionsDataSource(this.user.email)
      .subscribe(async (productions) => {
        let productions_aux = JSON.parse(JSON.stringify(productions)) as ProductionModel[];
        const promises = productions_aux.map((prod)=>this.productionCRUDService.getFormulas(prod))
        await Promise.all(promises)
        this.productionService.setProductions(
          productions_aux as ProductionModel[] & ShellModel
        );
      });
    this.coursesSubscriber = this.courseCRUDService.getSharedCoursesDataSource(this.user.email)
      .subscribe(async (courses) => {
        let courses_aux = JSON.parse(JSON.stringify(courses)) as CourseModel[];
        const promises = courses_aux.map((course)=>this.courseCRUDService.getData(course))
        await Promise.all(promises)
        this.courseService.setSharedCourses(
          courses_aux as CourseModel[] & ShellModel
        );
      });
    if (this.user.instructor) {
      this.myCoursesSubscriber = this.courseCRUDService.getMyCoursesDataSource(this.user.email)
        .subscribe(async (courses) => {
          let courses_aux = JSON.parse(JSON.stringify(courses)) as CourseModel[];
          const promises = courses_aux.map((course) => this.courseCRUDService.getData(course))
          await Promise.all(promises)
          this.courseService.setMyCourses(
            courses_aux as CourseModel[] & ShellModel
          );
        });
    }
  }

  ngOnDestroy() {
    if (this.user.instructor) {
      this.myCoursesSubscriber.unsubscribe();
    }
    this.coursesSubscriber.unsubscribe();
    this.productionsSubscriber.unsubscribe();
    this.formulasSubscriber.unsubscribe();
    this.ingredientsSubscriber.unsubscribe();
    this.courseService.clearCourses();
    this.productionService.clearProductions();
    this.formulaService.clearFormulas();
    this.ingredientService.clearIngredients();
  }
}
