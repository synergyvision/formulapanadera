import { Component, OnInit } from "@angular/core";
import { UserResumeModel } from "src/app/core/models/user.model";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { DataStore } from "src/app/shared/shell/data-store";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { Router } from "@angular/router";
import { CourseModel } from "src/app/core/models/course.model";
import { CourseService } from "src/app/core/services/course.service";

@Component({
  selector: "app-course-listing",
  templateUrl: "course-listing.page.html",
  styleUrls: [
    "./styles/course-listing.page.scss",
    "../../../../shared/styles/filter.scss",
    "../../../../shared/styles/note.alert.scss",
    "../../../../shared/styles/confirm.alert.scss",
  ],
})
export class CourseListingPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  searchQuery: string;
  courses: CourseModel[] & ShellModel;
  all_courses: CourseModel[] & ShellModel;

  showFilters: boolean;

  user: UserResumeModel = new UserResumeModel();

  constructor(
    private router: Router,
    private courseService: CourseService,
    private userStorageService: UserStorageService,
  ) {
    this.showFilters = false;
  }

  async ngOnInit() {
    this.searchQuery = "";
    this.courses = this.courseService.searchingState();

    this.user = await this.userStorageService.getUser();
    this.courseService
      .getMyCourses()
      .subscribe(async (courses) => {
        this.courses = this.courseService.searchingState();
        this.all_courses = courses  as CourseModel[] & ShellModel;
        this.searchList();
      });
  }

  // Navigation

  createCourse() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.settings.main +
        "/" +
        APP_URL.menu.routes.settings.routes.course.main +
        "/" +
        APP_URL.menu.routes.settings.routes.course.routes.management
    );
  }

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

  // Search

  async searchList() {
    if (this.all_courses) {
      let filteredCourses = JSON.parse(JSON.stringify(this.all_courses));
      let filters = {
        query: this.searchQuery,
      };
    
      const dataSourceWithShellObservable = DataStore.AppendShell(
        of(filteredCourses),
        this.courseService.searchingState()
      );

      let updateSearchObservable = dataSourceWithShellObservable.pipe(
        map((filteredItems) => {
          // Just filter items by name if there is a search query and they are not shell values
          if (filters.query !== "" && !filteredItems.isShell) {
            const queryFilteredItems = filteredItems.filter((item) =>
              item.name.toLowerCase().includes(filters.query.toLowerCase())
            );
            // While filtering we strip out the isShell property, add it again
            return Object.assign(queryFilteredItems, {
              isShell: filteredItems.isShell,
            });
          } else {
            return filteredItems;
          }
        })
      );

      updateSearchObservable.subscribe((value) => {
        this.courses = value;
      });
    } else {
      this.courses = [] as CourseModel[] & ShellModel;
    }
  }
}
