import { Component, OnDestroy, OnInit } from "@angular/core";
import { of, Subscription } from "rxjs";
import { COLLECTIONS } from "src/app/config/firebase";
import { ICONS } from "src/app/config/icons";
import { FirebaseService } from "src/app/core/interfaces/firebase-service.interface";
import { StoredRequest } from "src/app/core/interfaces/stored-request.interface";
import { CourseModel } from "src/app/core/models/course.model";
import { FormulaModel } from "src/app/core/models/formula.model";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { SettingsModel } from "src/app/core/models/settings.model";
import { UserModel } from "src/app/core/models/user.model";
import { CourseService } from "src/app/core/services/course.service";
import { CourseCRUDService } from "src/app/core/services/firebase/course.service";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
import { UserCRUDService } from "src/app/core/services/firebase/user.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { IngredientService } from "src/app/core/services/ingredient.service";
import { NetworkService } from "src/app/core/services/network.service";
import { OfflineManagerService } from "src/app/core/services/offline-manager.service";
import { ProductionService } from "src/app/core/services/production.service";
import { SettingsStorageService } from "src/app/core/services/storage/settings.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { TimeService } from "src/app/core/services/time.service";
import { UserService } from "src/app/core/services/user.service";
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
    private ingredientService: IngredientService,
    private settingsStorageService: SettingsStorageService,
    private networkService: NetworkService,
    private offlineManager: OfflineManagerService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.timeService.startCurrentTime();
    let settings = await this.settingsStorageService.getSettings();
    if (!settings) {
      await this.settingsStorageService.setSettings(new SettingsModel());
    }

    let user = await this.userStorageService.getUser();
    this.user = await this.userCRUDService.getUser(user.email);
    if (!this.user?.id) {
      this.user = user;
    }
    await this.userStorageService.setUser(this.user);
    
    this.ingredientsSubscriber = this.ingredientCRUDService
      .getIngredientsDataSource(this.user.email)
      .subscribe(async (ingredients) => {
        if (this.networkService.isConnectedToNetwork()) {
          let ingredients_aux = JSON.parse(JSON.stringify(ingredients)) as IngredientModel[];
          const promises = ingredients_aux.map((ing) => this.ingredientCRUDService.getSubIngredients(ing))
          await Promise.all(promises)
          this.ingredientService.setIngredients(
            ingredients_aux as IngredientModel[] & ShellModel
          );
          this.ingredientCRUDService.setLocalData(JSON.parse(JSON.stringify(ingredients_aux)));
        } else {
          this.ingredientService.setIngredients(
            await this.ingredientCRUDService.getLocalData() as IngredientModel[] & ShellModel
          );
        };
      });
    this.formulasSubscriber = this.formulaCRUDService
      .getFormulasDataSource(this.user.email)
      .subscribe(async (formulas) => {
        if (this.networkService.isConnectedToNetwork()) {
          let formulas_aux = JSON.parse(JSON.stringify(formulas)) as FormulaModel[];
          const promises = formulas_aux.map((form) => this.formulaCRUDService.getIngredients(form))
          await Promise.all(promises)
          this.formulaService.setFormulas(
            formulas_aux as FormulaModel[] & ShellModel
          );
          this.formulaCRUDService.setLocalData(JSON.parse(JSON.stringify(formulas_aux)));
        } else {
          this.formulaService.setFormulas(
            await this.formulaCRUDService.getLocalData() as FormulaModel[] & ShellModel
          );
        };
      });
    this.productionsSubscriber = this.productionCRUDService
      .getProductionsDataSource(this.user.email)
      .subscribe(async (productions) => {
        if (this.networkService.isConnectedToNetwork()) {
          let productions_aux = JSON.parse(JSON.stringify(productions)) as ProductionModel[];
          const promises = productions_aux.map((prod) => this.productionCRUDService.getFormulas(prod))
          await Promise.all(promises)
          this.productionService.setProductions(
            productions_aux as ProductionModel[] & ShellModel
          );
          this.productionCRUDService.setLocalData(JSON.parse(JSON.stringify(productions_aux)));
        } else {
          this.productionService.setProductions(
            await this.productionCRUDService.getLocalData() as ProductionModel[] & ShellModel
          );
        };
      });
    this.coursesSubscriber = this.courseCRUDService.getSharedCoursesDataSource(this.user.email)
      .subscribe(async (courses) => {
        if (this.networkService.isConnectedToNetwork()) {
          let courses_aux = JSON.parse(JSON.stringify(courses)) as CourseModel[];
          const promises = courses_aux.map((course) => this.courseCRUDService.getData(course))
          await Promise.all(promises)
          this.courseService.setSharedCourses(
            courses_aux as CourseModel[] & ShellModel
          );
          this.courseCRUDService.setLocalData('shared', JSON.parse(JSON.stringify(courses_aux)));
        } else {
          this.courseService.setSharedCourses(
            await this.courseCRUDService.getLocalData('shared') as CourseModel[] & ShellModel
          );
        };
      });
    if (this.userService.hasPermission(this.user.role, [{name: 'COURSE', type: 'MANAGE'}])) {
      this.myCoursesSubscriber = this.courseCRUDService.getMyCoursesDataSource(this.user.email)
        .subscribe(async (courses) => {
          if (this.networkService.isConnectedToNetwork()) {
            let courses_aux = JSON.parse(JSON.stringify(courses)) as CourseModel[];
            const promises = courses_aux.map((course) => this.courseCRUDService.getData(course))
            await Promise.all(promises)
            this.courseService.setMyCourses(
              courses_aux as CourseModel[] & ShellModel
            );
            this.courseCRUDService.setLocalData('mine', JSON.parse(JSON.stringify(courses_aux)));
          } else {
            this.courseService.setMyCourses(
              await this.courseCRUDService.getLocalData('mine') as CourseModel[] & ShellModel
            );
          }
        });
    }

    setTimeout(() => {
      this.networkService.onNetworkChange().subscribe(async () => {
        if (this.networkService.isConnectedToNetwork()) {
          let requests = await this.offlineManager.getStoredRequests();
          if (requests) {
            requests = JSON.parse(requests) as StoredRequest[];
            if (requests.length > 0) {
              const promises = requests.map(async (req: StoredRequest) => {
                let service = this.returnService(req.collection);
                await this.doOperation(req, service);
                if (req.type == 'U') {
                  await this.syncOperations(req);
                }
                await this.offlineManager.clearRequest(req);
              })
              await Promise.all(promises);
            }
          }
        }
      });
    }, 15000);
  }

  ngOnDestroy() {
    if (this.userService.hasPermission(this.user.role, [{name: 'COURSE', type: 'MANAGE'}])) {
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

  returnService(collection: string): FirebaseService {
    if (collection == COLLECTIONS.ingredients) {
      return this.ingredientCRUDService;
    }
    if (collection == COLLECTIONS.formula) {
      return this.formulaCRUDService;
    }
    if (collection == COLLECTIONS.production) {
      return this.productionCRUDService;
    }
    if (collection == COLLECTIONS.course) {
      return this.courseCRUDService;
    }
  }

  doOperation(req: StoredRequest, service: FirebaseService) {
    if (req.type == 'C') {
      return service.create(req.data);
    }
    if (req.type == 'U') {
      return service.update(req.data, req.originalData);
    }
    if (req.type == 'D') {
      return service.delete(req.data);
    }
  }

  async syncOperations(req: StoredRequest) {
    if (req.collection == COLLECTIONS.ingredients) {
      let updated_ingredients: IngredientModel[] = [req.data];
      await this.ingredientCRUDService.updateIngredients(req.data, updated_ingredients);
      let updated_formulas: FormulaModel[] = [];
      await this.formulaCRUDService.updateIngredients(updated_ingredients, updated_formulas);
      let updated_productions: ProductionModel[] = []
      await this.productionCRUDService.updateFormulas(updated_formulas, updated_productions);
      if (this.userService.hasPermission(this.user.role, [{name: 'COURSE', type: 'MANAGE'}])) {
        let updated_courses: CourseModel[] = []
        await this.courseCRUDService.updateAll(updated_courses, updated_ingredients, updated_formulas, updated_productions);
      }
    }
    if (req.collection == COLLECTIONS.formula) {
      let updated_formulas: FormulaModel[] = [req.data];
      let updated_productions: ProductionModel[] = []
      await this.productionCRUDService.updateFormulas(updated_formulas, updated_productions);
      if (this.userService.hasPermission(this.user.role, [{name: 'COURSE', type: 'MANAGE'}])) {
        let updated_courses: CourseModel[] = []
        await this.courseCRUDService.updateAll(updated_courses, [], updated_formulas, updated_productions);
      }
    }
    if (req.collection == COLLECTIONS.production) {
      if (this.userService.hasPermission(this.user.role, [{name: 'COURSE', type: 'MANAGE'}])) {
        let updated_productions: ProductionModel[] = [req.data]
        let updated_courses: CourseModel[] = []
        await this.courseCRUDService.updateAll(updated_courses, [], [], updated_productions);
      }
    }
  }
}
