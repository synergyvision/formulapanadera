import { Component, OnInit } from "@angular/core";
import { UserResumeModel } from "src/app/core/models/user.model";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-course-details",
  templateUrl: "course-details.page.html",
  styleUrls: [
    "./styles/course-details.page.scss",
    "../../../../shared/styles/note.alert.scss",
    "../../../../shared/styles/confirm.alert.scss",
  ],
})
export class CourseDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  user: UserResumeModel = new UserResumeModel();

  constructor() {}

  async ngOnInit() {}
}
