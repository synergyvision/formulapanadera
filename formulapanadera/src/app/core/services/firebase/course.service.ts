import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { ProductionModel } from "../../models/production.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { CourseModel, OrderedItemModel } from "../../models/course.model";
import { FormulaModel } from "../../models/formula.model";
import { IngredientModel } from "../../models/ingredient.model";
import { FormulaCRUDService } from "./formula.service";
import { ProductionCRUDService } from "./production.service";
import { IngredientCRUDService } from "./ingredient.service";
import { UserGroupModel } from "../../models/user.model";
import { CourseService } from "../course.service";

@Injectable()
export class CourseCRUDService {
  collection = COLLECTIONS.course;

  constructor(
    private afs: AngularFirestore,
    private courseService: CourseService,
    private ingredientCRUDService: IngredientCRUDService,
    private formulaCRUDService: FormulaCRUDService,
    private productionCRUDService: ProductionCRUDService
  ) { }

  /*
    Course Collection
  */
  public getMyCoursesDataSource(
    user_email: string
  ): Observable<Array<CourseModel>> {
    return this.afs
      .collection<CourseModel>(this.collection, (ref) =>
        ref.where("user.owner", "==", user_email)
      )
      .valueChanges({ idField: "id" });
  }

  public getSharedCoursesDataSource(
    user_email: string
  ): Observable<Array<CourseModel>> {
    return this.afs
      .collection<CourseModel>(this.collection, (ref) =>
        ref.where("user.shared_references", "array-contains", user_email)
      )
      .valueChanges({ idField: "id" });
  }

  public async getData(course: CourseModel, collection = this.collection) {
    if (!course.productions || course.productions.length == 0) {
      course.productions = [];
      const docs = await this.afs.collection<OrderedItemModel>(`${collection}/${course.id}/${COLLECTIONS.production}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let production: OrderedItemModel = doc.data() as OrderedItemModel;
          await this.productionCRUDService.getFormulas(production.item as ProductionModel, `${collection}/${course.id}/${COLLECTIONS.production}`);
          course.productions.push(production)
        }
      })
      await Promise.all(promises)
    }
    if (!course.formulas || course.formulas.length == 0) {
      course.formulas = [];
      const docs = await this.afs.collection<OrderedItemModel>(`${collection}/${course.id}/${COLLECTIONS.formula}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let formula: OrderedItemModel = doc.data() as OrderedItemModel;
          await this.formulaCRUDService.getIngredients(formula.item as FormulaModel, `${collection}/${course.id}/${COLLECTIONS.formula}`);
          course.formulas.push(formula)
        }
      })
      await Promise.all(promises)
    }
    if (!course.ingredients || course.ingredients.length == 0) {
      course.ingredients = [];
      const docs = await this.afs.collection<OrderedItemModel>(`${collection}/${course.id}/${COLLECTIONS.ingredients}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let ingredient: OrderedItemModel = doc.data() as OrderedItemModel;
          await this.ingredientCRUDService.getSubIngredients(ingredient.item as IngredientModel, `${collection}/${course.id}/${COLLECTIONS.ingredients}`);
          course.ingredients.push(ingredient)
        }
      })
      await Promise.all(promises)
    }
  }

  public async getCourse(
    id: string
  ): Promise<CourseModel> {
    let doc = await this.afs.collection<CourseModel>(this.collection).doc(id).ref.get()
    if (doc.exists) {
      let course = doc.data() as CourseModel;
      await this.getData(course);
      return course;
    }
    return new CourseModel;
  }

  /*
    Course Management
  */
  public async createCourse(
    courseData: CourseModel
  ): Promise<void> {
    let id = this.afs.createId();
    courseData.id = id;
    let course: CourseModel = JSON.parse(JSON.stringify(courseData));
    delete course.productions;
    delete course.formulas;
    delete course.ingredients;
    // Set data
    await this.createData(`${this.collection}/${id}`, courseData);
    await this.afs.collection(this.collection).doc(id).set(course);
  }

  private async createData(collection: string, courseData: CourseModel) {
    if (courseData.productions && courseData.productions.length > 0) {
      let productions: OrderedItemModel[] = JSON.parse(JSON.stringify(courseData.productions));
      const production_promises = productions.map(async production => {
        let prod: OrderedItemModel = JSON.parse(JSON.stringify(production));
        delete (prod.item as ProductionModel).formulas;
        await this.afs.collection(`${collection}/${COLLECTIONS.production}`).doc(production.item.id).set(prod);
        await this.productionCRUDService.createFormulas(`${collection}/${COLLECTIONS.production}/${production.item.id}/${COLLECTIONS.formula}`, production.item as ProductionModel);
      })
      await Promise.all(production_promises)
    }
    if (courseData.formulas && courseData.formulas.length > 0) {
      let formulas: OrderedItemModel[] = JSON.parse(JSON.stringify(courseData.formulas));
      const formula_promises = formulas.map(async formula => {
        let form: OrderedItemModel = JSON.parse(JSON.stringify(formula));
        delete (form.item as FormulaModel).ingredients;
        if ((form.item as FormulaModel).mixing && (form.item as FormulaModel).mixing.length > 0) {
          (form.item as FormulaModel).mixing.forEach(mix => {
            mix.mixing_order.forEach(step => {
              step.ingredients.forEach(ing => {
                if (ing.ingredient.formula) {
                  delete ing.ingredient.formula.ingredients;
                  delete ing.ingredient.formula.mixing;
                }
              })
            })
          })
        }
        await this.afs.collection(`${collection}/${COLLECTIONS.formula}`).doc(formula.item.id).set(form);
        await this.formulaCRUDService.createIngredients(`${collection}/${COLLECTIONS.formula}/${formula.item.id}/${COLLECTIONS.ingredients}`, formula.item as FormulaModel);
      })
      await Promise.all(formula_promises)
    }
    if (courseData.ingredients && courseData.ingredients.length > 0) {
      let ingredients: OrderedItemModel[] = JSON.parse(JSON.stringify(courseData.ingredients));
      const ingredient_promises = ingredients.map(async ingredient => {
        let ing: OrderedItemModel = JSON.parse(JSON.stringify(ingredient))
        if ((ingredient.item as IngredientModel).formula) {
          delete (ing.item as IngredientModel).formula.ingredients;
        }
        await this.afs.collection(`${collection}/${COLLECTIONS.ingredients}`).doc(ingredient.item.id).set(ing);
        await this.ingredientCRUDService.createSubIngredient(`${collection}/${COLLECTIONS.ingredients}`, ingredient.item.id, ingredient.item as IngredientModel);
      })
      await Promise.all(ingredient_promises)
    }
  }

  public async updateCourse(courseData: CourseModel, originalCourse: CourseModel): Promise<void> {
    let course: CourseModel = JSON.parse(JSON.stringify(courseData));
    delete course.productions;
    delete course.formulas;
    delete course.ingredients;
    // Delete formulas
    await this.deleteData(originalCourse);
    // Set formulas
    await this.createData(`${this.collection}/${courseData.id}`, courseData);
    await this.afs.collection(this.collection).doc(courseData.id).set(course);
  }

  public async updateGroup(groupData: UserGroupModel) {
    console.log("AQUITEVOY")
    let courses = this.courseService.getMyCurrentCourses();
    courses.forEach(async (course: CourseModel) => {
      let courseHasGroup = false;
      course.user.shared_groups.forEach((courseGroup, index) => {
        if (courseGroup.id == groupData.id) {
          courseHasGroup = true;
          course.user.shared_groups[index] = groupData;
        }
      })
      if (courseHasGroup) {
        delete course.productions;
        delete course.formulas;
        delete course.ingredients;
        course.user.shared_references = [];
        course.user.shared_groups.forEach(userGroup => {
          userGroup.users.forEach(user => {
            course.user.shared_references.push(user.email);
          })
        })
        course.user.shared_users.forEach(user => {
          course.user.shared_references.push(user.email);
        })
        let new_course = JSON.parse(JSON.stringify(course)) as CourseModel
        await this.afs.collection(this.collection).doc(new_course.id).set(new_course);
      }
    })
  }

  public async deleteCourse(courseData: CourseModel): Promise<void> {
    await this.deleteData(courseData);
    return this.afs.collection(this.collection).doc(courseData.id).delete();
  }

  public async deleteData(courseData: CourseModel, collection = this.collection): Promise<void>{
    if (courseData.productions && courseData.productions.length > 0) {
      const promises = courseData.productions.map(async production => {
        let subcollection = `${collection}/${courseData.id}/${COLLECTIONS.production}`;
        await this.productionCRUDService.deleteFormulas(production.item as ProductionModel, subcollection);
        await this.afs.collection(subcollection).doc(production.item.id).delete();
      })
      await Promise.all(promises)
    }
    if (courseData.formulas && courseData.formulas.length > 0) {
      const promises = courseData.formulas.map(async formula => {
        let subcollection = `${collection}/${courseData.id}/${COLLECTIONS.formula}`;
        await this.formulaCRUDService.deleteIngredients(formula.item as FormulaModel, subcollection);
        await this.afs.collection(subcollection).doc(formula.item.id).delete();
      })
      await Promise.all(promises)
    }
    if (courseData.ingredients && courseData.ingredients.length > 0) {
      const promises = courseData.ingredients.map(async ingredient => {
        let subcollection = `${collection}/${courseData.id}/${COLLECTIONS.ingredients}`;
        await this.ingredientCRUDService.deleteSubIngredient(ingredient.item as IngredientModel, subcollection);
        await this.afs.collection(subcollection).doc(ingredient.item.id).delete();
      })
      await Promise.all(promises)
    }
  }
}
