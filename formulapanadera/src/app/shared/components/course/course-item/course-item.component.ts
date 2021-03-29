import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";

@Component({
  selector: "app-course-item",
  templateUrl: "./course-item.component.html",
  styleUrls: ["./styles/course-item.component.scss"],
})
export class CourseItemComponent {
  @Input() course: CourseModel;
  @Input() clickable: boolean = false;
  @Input() selected: boolean = false;
  @Input() even: boolean = false;

  ICONS = ICONS;

  constructor() {}
}
