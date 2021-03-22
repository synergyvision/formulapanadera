import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { CourseModel, OrderedItemModel } from "../models/course.model";

@Injectable()
export class CourseService {
  private courses: BehaviorSubject<CourseModel[]> = new BehaviorSubject<CourseModel[]>(undefined);
  private shared_courses: BehaviorSubject<CourseModel[]> = new BehaviorSubject<CourseModel[]>(undefined);

  constructor() {}
  
  public setMyCourses(courses: CourseModel[]) {
    this.courses.next(courses);
  }

  public setSharedCourses(courses: CourseModel[]) {
    this.shared_courses.next(courses);
  }

  public getMyCourses(): Observable<CourseModel[]> {
    return this.courses.asObservable();
  }

  public getSharedCourses(): Observable<CourseModel[]> {
    return this.shared_courses.asObservable();
  }

  public clearCourses() {
    this.courses = new BehaviorSubject<CourseModel[]>(undefined);
    this.shared_courses = new BehaviorSubject<CourseModel[]>(undefined);
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
