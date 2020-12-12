import { Component, HostBinding, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_URL, LOADING_ITEMS } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { UserGroupModel } from 'src/app/core/models/user.model';
import { UserStorageService } from 'src/app/core/services/storage/user.service';
import { UserService } from 'src/app/core/services/user.service';
import { DataStore } from 'src/app/shared/shell/data-store';
import { ShellModel } from 'src/app/shared/shell/shell.model';

@Component({
  selector: "app-user-groups-listing",
  templateUrl: "./user-groups-listing.page.html",
  styleUrls: ["./styles/user-groups-listing.page.scss", "../../../../shared/styles/filter.scss"],
})
export class UserGroupsListingPage implements OnInit, ViewWillEnter {
  ICONS = ICONS;
  APP_URL = APP_URL;

  searchQuery: string;

  user_groups: UserGroupModel[] & ShellModel;
  
  @HostBinding("class.is-shell") get isShell() {
    return this.user_groups && this.user_groups.isShell ? true : false;
  }
  constructor(
    private router: Router,
    private userService: UserService,
    private userStorageService: UserStorageService,
  ) { }
  
  async ngOnInit() {
    this.searchQuery = "";
    this.searchingState();
    this.searchList();
  }

  ionViewWillEnter() {
    this.searchList();
  }

  async searchList() {
    let filteredUserGroups = JSON.parse(
      JSON.stringify((await this.userStorageService.getUser()).user_groups)
    );
    let filters = {
      query: this.searchQuery,
    };
    
    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredUserGroups),
      this.searchingState()
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
      this.user_groups = this.userService.sortUserGroups(value);
    });
  }

  createUserGroup() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.settings.main +
        "/" +
        APP_URL.menu.routes.settings.routes.user_groups.main +
        "/" +
        APP_URL.menu.routes.settings.routes.user_groups.routes.management
    );
  }

  searchingState() {
    let searchingShellModel: UserGroupModel[] &
      ShellModel = [] as UserGroupModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new UserGroupModel());
    }
    searchingShellModel.isShell = true;
    this.user_groups = searchingShellModel;
    return searchingShellModel;
  }

  updateUserGroup(user_group: UserGroupModel) {
    if (user_group.name) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.settings.main +
        "/" +
        APP_URL.menu.routes.settings.routes.user_groups.main +
        "/" +
        APP_URL.menu.routes.settings.routes.user_groups.routes.management,
        {
          state: { user_group: user_group },
        }
      );
    }
  }
}
