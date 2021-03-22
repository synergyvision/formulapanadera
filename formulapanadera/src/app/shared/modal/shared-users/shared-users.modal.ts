import { Component, Input, OnInit } from "@angular/core";
import { ShellModel } from "../../shell/shell.model";
import { DataStore } from "../../shell/data-store";
import { of } from "rxjs";
import { ModalController } from "@ionic/angular";
import { map } from "rxjs/operators";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from 'src/app/core/services/storage/user.service';
import { FormulaModel } from "src/app/core/models/formula.model";
import { UserModel, UserResumeModel } from "src/app/core/models/user.model";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { FormControl, FormGroup } from "@angular/forms";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";
import { UserService } from "src/app/core/services/user.service";

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

  @Input() type: "ingredient" | "formula" | "production";
  @Input() item: IngredientModel | FormulaModel | ProductionModel;

  searchQuery: string;
  groupForm: FormGroup;
  showFilters: boolean = false;

  selectedUsers: Array<string>;
  users: UserResumeModel[] & ShellModel;

  user: UserModel = new UserModel();

  constructor(
    private userService: UserService,
    private userStorageService: UserStorageService,
    private modalController: ModalController,
    private ingredientCRUDService: IngredientCRUDService,
    private formulaCRUDService: FormulaCRUDService,
    private productionCRUDService: ProductionCRUDService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.groupForm = new FormGroup({
      value: new FormControl("all"),
    });
    this.users = this.userService.userSearchingState()
    this.searchList();

    this.user = await this.userStorageService.getUser();
    this.user.user_groups[0].name
  }

  async searchList() {
    let filteredUsers = this.item.user.shared_users;
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
      this.userService.userSearchingState()
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

  // Manage shared

  stopShare() {
    // Modifies shared_users array
    this.selectedUsers.forEach(selected_user => {
      this.item.user.shared_users.forEach((user) => {
        if (user.email == selected_user) {
          this.item.user.shared_users.splice(this.item.user.shared_users.indexOf(user), 1)
        }
      })
    })
    this.selectedUsers.forEach(selected_user => {
      this.item.user.shared_references.forEach((email) => {
        if (email == selected_user) {
          this.item.user.shared_references.splice(this.item.user.shared_references.indexOf(email), 1)
        }
      })
    })

    if (this.type == "ingredient") {
      this.ingredientCRUDService.updateIngredient(this.item as IngredientModel, this.item as IngredientModel)
        .then(() => {
          this.dismissModal()
        })
    }
    if (this.type == "formula") {
      this.formulaCRUDService.updateFormula(this.item as FormulaModel, this.item as FormulaModel)
        .then(() => {
          this.dismissModal()
        })
    }
    if (this.type == "production") {
      this.productionCRUDService.updateProduction(this.item as ProductionModel, this.item as ProductionModel)
        .then(() => {
          this.dismissModal()
        })
    }
  }
}
