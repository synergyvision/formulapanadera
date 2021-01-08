import { Component, Input, OnInit } from "@angular/core";
import { ShellModel } from "../../shell/shell.model";
import { DataStore } from "../../shell/data-store";
import { of } from "rxjs";
import { ModalController } from "@ionic/angular";
import { map } from "rxjs/operators";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from 'src/app/core/services/storage/user.service';
import { FormulaModel } from "src/app/core/models/formula.model";
import { UserResumeModel } from "src/app/core/models/user.model";

@Component({
  selector: "app-shared-users-picker-modal",
  templateUrl: "shared-users-picker.modal.html",
  styleUrls: [
    "./styles/shared-users-picker.modal.scss",
    "./../../styles/filter.scss",
  ],
})
export class SharedUsersPickerModal implements OnInit {
  ICONS = ICONS;

  @Input() formula: FormulaModel;

  searchQuery: string;

  selectedUsers: Array<string>;
  users: UserResumeModel[] & ShellModel;

  constructor(
    private userStorageService: UserStorageService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.searchQuery = "";
    this.searchingState();
    this.searchList();
  }

  async searchList() {
    let filteredUsers = this.formula.user.shared_users;
    let filters = {
      query: this.searchQuery,
    };
    
    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredUsers),
      this.searchingState()
    );

    let updateSearchObservable = dataSourceWithShellObservable.pipe(
      map((filteredItems) => {
        // Just filter items by name if there is a search query and they are not shell values
        if (filters.query !== "" && !filteredItems.isShell) {
          const queryFilteredItems = filteredItems.filter((item) =>
            item.name.toLowerCase().includes(filters.query.toLowerCase()) || item.email.toLowerCase().includes(filters.query.toLowerCase())
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
      this.users = value;
    });
  }

  clickUser(user: UserResumeModel) {
    if (user !== undefined && user.name !== undefined) {
      if (this.selectedUsers === undefined) {
        this.selectedUsers = [];
      }
      if (this.isSelected(user.email)) {
        for (let index = 0; index < this.selectedUsers.length; index++) {
          if (this.selectedUsers[index] === user.email)
            this.selectedUsers.splice(index, 1);
        }
      } else {
        this.selectedUsers.push(user.email);
      }
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isSelected(user: string): boolean {
    let isSelected = false;
    if (this.selectedUsers !== undefined) {
      this.selectedUsers.map((selected) => {
        if (user == selected) {
          isSelected = true;
        }
      });
    }
    return isSelected;
  }

  searchingState() {
    let searchingShellModel: UserResumeModel[] &
      ShellModel = [] as UserResumeModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new UserResumeModel());
    }
    searchingShellModel.isShell = true;
    this.users = searchingShellModel;
    return searchingShellModel;
  }

  // Manage shared

  stopShare() {
    console.log("STOPPING SHARE TO", this.selectedUsers)
  }
}
