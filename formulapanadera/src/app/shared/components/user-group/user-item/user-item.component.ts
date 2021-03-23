import { Component, Input } from "@angular/core";
import { ASSETS } from "src/app/config/assets";
import { APP_URL } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { UserResumeModel } from 'src/app/core/models/user.model';

@Component({
  selector: "app-user-item",
  templateUrl: "./user-item.component.html",
  styleUrls: [
    "./styles/user-item.component.scss",
    "./../../../styles/confirm.alert.scss"
  ],
})
export class UserItemComponent {
  ICONS = ICONS
  APP_URL = APP_URL
  DEFAULT_ICON = ASSETS.icons.default

  @Input() user: UserResumeModel;
  @Input() even: boolean = false;
  @Input() selected: boolean = false;
  @Input() clickable: boolean = true;

  constructor() { }
}
