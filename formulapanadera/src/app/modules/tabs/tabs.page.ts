import { Component, OnInit } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { CourseService } from "src/app/core/services/course.service";
import { CourseCRUDService } from "src/app/core/services/firebase/course.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { TimeService } from "src/app/core/services/time.service";
import { ShellModel } from "src/app/shared/shell/shell.model";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["./styles/tabs.page.scss"],
})
export class TabsPage implements OnInit {
  ICONS = ICONS;
  constructor(
    private timeService: TimeService,
    private userStorageService: UserStorageService,
    private courseCRUDService: CourseCRUDService,
    private courseService: CourseService
  ) { }

  async ngOnInit() {
    this.timeService.startCurrentTime();
    let user = await this.userStorageService.getUser();
    this.courseCRUDService.getSharedCoursesDataSource(user.email)
      .subscribe(async (courses) => {
        const promises = courses.map((course)=>this.courseCRUDService.getData(course))
        await Promise.all(promises)
        this.courseService.setSharedCourses(
          courses as CourseModel[] & ShellModel
        );
      });
  }
}
