import { Component, Input } from "@angular/core";
import { APP_URL } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { UserGroupModel } from 'src/app/core/models/user.model';

@Component({
  selector: "app-user-group-item",
  templateUrl: "./user-group-item.component.html",
  styleUrls: [
    "./styles/user-group-item.component.scss",
    "./../../../styles/confirm.alert.scss"
  ],
})
export class UserGroupItemComponent {
  ICONS = ICONS
  APP_URL = APP_URL

  @Input() user_group: UserGroupModel;
  @Input() even: boolean = false;

  constructor() { }
}
