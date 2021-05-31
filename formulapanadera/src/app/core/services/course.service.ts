import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { CourseModel, OrderedItemModel } from "../models/course.model";
import { FormulaModel } from "../models/formula.model";
import { IngredientModel } from "../models/ingredient.model";
import { ProductionModel } from "../models/production.model";
import { CourseCRUDService } from "./firebase/course.service";

@Injectable()
export class CourseService {
  private courses: BehaviorSubject<CourseModel[]> = new BehaviorSubject<CourseModel[]>(undefined);
  private shared_courses: BehaviorSubject<CourseModel[]> = new BehaviorSubject<CourseModel[]>(undefined);

  constructor(
    private courseCRUDService: CourseCRUDService
  ) {}
  
  public setMyCourses(courses: CourseModel[]) {
    this.courses.next(courses);
  }

  public setSharedCourses(courses: CourseModel[]) {
    this.shared_courses.next(courses);
  }

  public getMyCourses(): Observable<CourseModel[]> {
    return this.courses.asObservable();
  }

  public getMyCurrentCourses(): CourseModel[] {
    return this.courses.getValue();
  }

  public getSharedCourses(): Observable<CourseModel[]> {
    return this.shared_courses.asObservable();
  }

  public clearCourses() {
    this.courses = new BehaviorSubject<CourseModel[]>(undefined);
    this.shared_courses = new BehaviorSubject<CourseModel[]>(undefined);
  }
  
  public searchingState() {
    let searchingShellModel: CourseModel[] &
      ShellModel = [] as CourseModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new CourseModel);
    }
    searchingShellModel.isShell = true;
    return searchingShellModel;
  }

  /*
  Update
  */
  
  public hasAny(course: CourseModel, updated_ingredients: IngredientModel[], updated_formulas: FormulaModel[], updated_productions: ProductionModel[]): boolean {
    let has_any: boolean = false;
    course.ingredients.forEach(ingredient => {
      updated_ingredients.forEach(updated_ingredient => {
        if (ingredient.item.id == updated_ingredient.id) {
          has_any = true;
          ingredient.item = updated_ingredient;
        }
      })
    });
    course.formulas.forEach(formula => {
      updated_formulas.forEach(updated_formula => {
        if (formula.item.id == updated_formula.id) {
          has_any = true;
          formula.item = updated_formula;
        }
      })
    });
    course.productions.forEach(production => {
      updated_productions.forEach(updated_production => {
        if (production.item.id == updated_production.id) {
          has_any = true;
          production.item = updated_production;
        }
      })
    });
    return has_any;
  }

  public async updateAll(updated_courses: CourseModel[],updated_ingredients: IngredientModel[],updated_formulas: FormulaModel[], updated_productions: ProductionModel[]) {
    let courses: CourseModel[] = JSON.parse(JSON.stringify(this.getMyCurrentCourses()));
    const cour_promises = courses.map((course) => {
      let original_course: CourseModel = JSON.parse(JSON.stringify(course));
      let has_any: boolean = this.hasAny(course, updated_ingredients, updated_formulas, updated_productions);
      if (has_any) {
        updated_courses.push(course);
        return this.courseCRUDService.update(course, original_course);
      }
    })
    await Promise.all(cour_promises);
  }

  // Sort
  sortCourses(courses: CourseModel[]): CourseModel[] & ShellModel {
    return courses.sort(function (a, b) {
      if (a.name.toUpperCase() > b.name.toUpperCase()) {
        return 1;
      } else {
        return -1;
      }
    }) as CourseModel[] & ShellModel
  }

  orderItems(items: OrderedItemModel[]): OrderedItemModel[] {
    return items.sort(function (a, b) {
      if (a.order > b.order) {
        return 1;
      } else{
        return -1;
      }
    }) as OrderedItemModel[]
  }
}
