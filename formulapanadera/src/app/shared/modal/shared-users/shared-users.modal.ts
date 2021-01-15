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
import { UserModel, UserResumeModel } from "src/app/core/models/user.model";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-shared-users-modal",
  templateUrl: "shared-users.modal.html",
  styleUrls: [
    "./styles/shared-users.modal.scss",
    "./../../styles/filter.scss",
  ],
})
export class SharedUsersModal implements OnInit {
  ICONS = ICONS;

  @Input() formula: FormulaModel;

  searchQuery: string;
  groupForm: FormGroup;
  showFilters: boolean = false;

  selectedUsers: Array<string>;
  users: UserResumeModel[] & ShellModel;

  user: UserModel = new UserModel();

  constructor(
    private userStorageService: UserStorageService,
    private modalController: ModalController,
    private formulaCRUDService: FormulaCRUDService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.groupForm = new FormGroup({
      value: new FormControl("all"),
    });
    this.searchingState();
    this.searchList();

    this.user = await this.userStorageService.getUser();
    this.user.user_groups[0].name
  }

  async searchList() {
    let filteredUsers = this.formula.user.shared_users;
    let filters = {
      group: this.groupForm.value.value,
      query: this.searchQuery,
    };

    if (filters.group !== "all") {
      let group: UserResumeModel[] = [];
      this.user.user_groups.forEach((user_group) => {
        if (user_group.name == filters.group) {
          group = user_group.users;
        }
      })
      filteredUsers = filteredUsers.filter((user) => 
        group.find((group_user) => group_user.email == user.email)
      )
    }

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
    // Modifies shared_users array of formula
    this.selectedUsers.forEach(selected_user => {
      this.formula.user.shared_users.forEach((user) => {
        if (user.email == selected_user) {
          this.formula.user.shared_users.splice(this.formula.user.shared_users.indexOf(user), 1)
        }
      })
    })

    // Gets associated formulas
    this.formulaCRUDService.getSharedFormulas(this.formula.id)
      .subscribe((shared_formulas) => {
        const formulas_to_delete = shared_formulas.filter((item) =>
          this.selectedUsers.find((name)=> name == item.user.owner)
        );
        // Deletes each selected formula
        formulas_to_delete.forEach((formula) => {
          this.formulaCRUDService.deleteFormula(formula.id)
        })
      });
    
    // Updates original formula
    this.formulaCRUDService.updateFormula(this.formula)
      .then(() => {
        this.dismissModal()
      })
  }
}