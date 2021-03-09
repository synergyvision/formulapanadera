import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { ProductionModel } from "../../models/production.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { CourseModel } from "../../models/course.model";
import { FormulaModel } from "../../models/formula.model";
import { IngredientModel } from "../../models/ingredient.model";
import { FormulaCRUDService } from "./formula.service";
import { ProductionCRUDService } from "./production.service";
import { IngredientCRUDService } from "./ingredient.service";

@Injectable()
export class CourseCRUDService {
  collection = COLLECTIONS.course;

  constructor(
    private afs: AngularFirestore,
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
      const docs = await this.afs.collection<ProductionModel>(`${collection}/${course.id}/${COLLECTIONS.production}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let production: ProductionModel = doc.data() as ProductionModel;
          await this.productionCRUDService.getFormulas(production, `${collection}/${course.id}/${COLLECTIONS.production}`);
          course.productions.push(production)
        }
      })
      await Promise.all(promises)
    }
    if (!course.formulas || course.formulas.length == 0) {
      course.formulas = [];
      const docs = await this.afs.collection<FormulaModel>(`${collection}/${course.id}/${COLLECTIONS.formula}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let formula: FormulaModel = doc.data() as FormulaModel;
          await this.formulaCRUDService.getIngredients(formula, `${collection}/${course.id}/${COLLECTIONS.formula}`);
          course.formulas.push(formula)
        }
      })
      await Promise.all(promises)
    }
    if (!course.ingredients || course.ingredients.length == 0) {
      course.ingredients = [];
      const docs = await this.afs.collection<IngredientModel>(`${collection}/${course.id}/${COLLECTIONS.ingredients}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let ingredient: IngredientModel = doc.data() as IngredientModel;
          await this.ingredientCRUDService.getSubIngredients(ingredient, `${collection}/${course.id}/${COLLECTIONS.ingredients}`);
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
      let productions: ProductionModel[] = JSON.parse(JSON.stringify(courseData.productions));
      const production_promises = productions.map(async production => {
        let prod: ProductionModel = JSON.parse(JSON.stringify(production));
        delete prod.formulas;
        await this.afs.collection(`${collection}/${COLLECTIONS.production}`).doc(production.id).set(prod);
        await this.productionCRUDService.createFormulas(`${collection}/${COLLECTIONS.production}/${production.id}/${COLLECTIONS.formula}`, production);
      })
      await Promise.all(production_promises)
    }
    if (courseData.formulas && courseData.formulas.length > 0) {
      let formulas: FormulaModel[] = JSON.parse(JSON.stringify(courseData.formulas));
      const formula_promises = formulas.map(async formula => {
        let form: FormulaModel = JSON.parse(JSON.stringify(formula));
        delete form.ingredients;
        if (form.mixing && form.mixing.length > 0) {
          form.mixing.forEach(mix => {
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
        await this.afs.collection(`${collection}/${COLLECTIONS.formula}`).doc(formula.id).set(form);
        await this.formulaCRUDService.createIngredients(`${collection}/${COLLECTIONS.formula}/${formula.id}/${COLLECTIONS.ingredients}`, formula);
      })
      await Promise.all(formula_promises)
    }
    if (courseData.ingredients && courseData.ingredients.length > 0) {
      let ingredients: IngredientModel[] = JSON.parse(JSON.stringify(courseData.ingredients));
      const ingredient_promises = ingredients.map(async ingredient => {
        let ing: IngredientModel = JSON.parse(JSON.stringify(ingredient))
        if (ingredient.formula) {
          delete ing.formula.ingredients;
        }
        await this.afs.collection(`${collection}/${COLLECTIONS.ingredients}`).doc(ingredient.id).set(ing);
        await this.ingredientCRUDService.createSubIngredient(`${collection}/${COLLECTIONS.ingredients}`, ingredient.id, ingredient);
      })
      await Promise.all(ingredient_promises)
    }
  }

  public async updateCourse(courseData: CourseModel): Promise<void> {
    let course: CourseModel = JSON.parse(JSON.stringify(courseData));
    delete course.productions;
    delete course.formulas;
    delete course.ingredients;
    // Delete formulas
    await this.deleteData(courseData);
    // Set formulas
    await this.createData(`${this.collection}/${courseData.id}`, courseData);
    await this.afs.collection(this.collection).doc(courseData.id).set(course);
  }

  public async deleteCourse(courseData: CourseModel): Promise<void> {
    await this.deleteData(courseData);
    return this.afs.collection(this.collection).doc(courseData.id).delete();
  }

  public async deleteData(courseData: CourseModel, collection = this.collection): Promise<void>{
    if (courseData.productions && courseData.productions.length > 0) {
      const promises = courseData.productions.map(async production => {
        let subcollection = `${collection}/${courseData.id}/${COLLECTIONS.production}`;
        await this.productionCRUDService.deleteFormulas(production, subcollection);
        await this.afs.collection(subcollection).doc(production.id).delete();
      })
      await Promise.all(promises)
    }
    if (courseData.formulas && courseData.formulas.length > 0) {
      const promises = courseData.formulas.map(async formula => {
        let subcollection = `${collection}/${courseData.id}/${COLLECTIONS.formula}`;
        await this.formulaCRUDService.deleteIngredients(formula, subcollection);
        await this.afs.collection(subcollection).doc(formula.id).delete();
      })
      await Promise.all(promises)
    }
    if (courseData.ingredients && courseData.ingredients.length > 0) {
      const promises = courseData.ingredients.map(async ingredient => {
        let subcollection = `${collection}/${courseData.id}/${COLLECTIONS.ingredients}`;
        await this.ingredientCRUDService.deleteSubIngredient(ingredient, subcollection);
        await this.afs.collection(subcollection).doc(ingredient.id).delete();
      })
      await Promise.all(promises)
    }
  }
}
