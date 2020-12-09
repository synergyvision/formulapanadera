import { Component } from "@angular/core";
import { APP_URL } from 'src/app/config/configuration';

@Component({
  selector: "app-user-groups",
  templateUrl: "./user-groups.page.html",
  styleUrls: ["./styles/user-groups.page.scss"],
})
export class UserGroupsPage {
  APP_URL = APP_URL
  
  constructor(){}
}
