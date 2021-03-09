import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { CourseModel } from "../models/course.model";

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

  public clearCourses() {
    this.courses = null;
  }

  // Sort
  sortCourses(courses: CourseModel[]): CourseModel[] & ShellModel {
    return courses.sort(function (a, b) {
      if (a.name && b.name) {
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        if (b.name.toUpperCase() > a.name.toUpperCase()) {
          return -1;
        }
      }
      return 0;
    }) as CourseModel[] & ShellModel
  }
}
