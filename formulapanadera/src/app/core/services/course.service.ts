import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { CourseModel, OrderedItemModel } from "../models/course.model";

@Injectable()
export class CourseService {
  private courses: CourseModel[] & ShellModel;

  constructor() {}
  
  public setCourses(courses: CourseModel[] & ShellModel) {
    this.courses = courses;
  }

  public getCourses(): Observable<CourseModel[]> {
    return of(this.courses);
  }

  public getMyCourses(): CourseModel[] {
    return this.courses;
  }

  public clearCourses() {
    this.courses = null;
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
