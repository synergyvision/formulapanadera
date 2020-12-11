import { Component, HostBinding, OnInit, Input } from "@angular/core";
import { ShellModel } from "../../shell/shell.model";
import { DataStore } from "../../shell/data-store";
import { of } from "rxjs";
import { ModalController } from "@ionic/angular";
import { map } from "rxjs/operators";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserGroupModel } from 'src/app/core/models/user.model';
import { UserStorageService } from 'src/app/core/services/storage/user.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: "app-user-group-picker-modal",
  templateUrl: "user-group-picker.modal.html",
  styleUrls: [
    "./styles/user-group-picker.modal.scss",
    "./../../styles/filter.scss",
  ],
})
export class UserGroupPickerModal implements OnInit {
  ICONS = ICONS;

  searchQuery: string;

  selectedGroups: Array<UserGroupModel>;

  user_groups: UserGroupModel[] & ShellModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.user_groups && this.user_groups.isShell ? true : false;
  }
  constructor(
    private userService: UserService,
    private userStorageService: UserStorageService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.searchQuery = "";
    this.searchingState();
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

  clickUserGroup(user_group: UserGroupModel) {
    if (user_group !== undefined && user_group.name !== undefined) {
      if (this.selectedGroups === undefined) {
        this.selectedGroups = [];
      }
      if (this.isSelected(user_group)) {
        for (let index = 0; index < this.selectedGroups.length; index++) {
          if (this.selectedGroups[index].name === user_group.name)
            this.selectedGroups.splice(index, 1);
        }
      } else {
        this.selectedGroups.push(user_group);
      }
    }
  }

  saveGroups() {
    this.modalController.dismiss({
      user_groups: this.selectedGroups,
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isSelected(user_group: UserGroupModel): boolean {
    let isSelected = false;
    if (this.selectedGroups !== undefined) {
      this.selectedGroups.map((selected) => {
        if (user_group.name == selected.name) {
          isSelected = true;
        }
      });
    }
    return isSelected;
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
}
