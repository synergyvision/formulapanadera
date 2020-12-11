import { Component, HostBinding, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_URL, LOADING_ITEMS } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { UserGroupModel } from 'src/app/core/models/user.model';
import { UserCRUDService } from 'src/app/core/services/firebase/user.service';
import { LanguageService } from 'src/app/core/services/language.service';
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
    private userCRUDService: UserCRUDService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private languageService: LanguageService,
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

  async presentOptions(user_group: UserGroupModel) {
    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: [
        {
          text: this.languageService.getTerm("action.update"),
          icon: ICONS.create,
          cssClass: "action-icon",
          handler: () => {
            this.updateUserGroup(user_group);
          },
        },
        {
        text: this.languageService.getTerm("action.delete"),
        icon: ICONS.trash,
        cssClass: "delete-icon",
          handler: () => {
            this.deleteUserGroup(user_group);
          }
        },
        {
          text: this.languageService.getTerm("action.cancel"),
          icon: ICONS.close,
          role: "cancel",
          cssClass: "cancel-icon",
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  updateUserGroup(user_group: UserGroupModel) {
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

  async deleteUserGroup(user_group: UserGroupModel) {
    let user = await this.userStorageService.getUser();
    user.user_groups.forEach((group, index) => {
      if (group.name == user_group.name) {
        user.user_groups.splice(index, 1)
      }
    })
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: user_group.name,
      }),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: async () => {
            const loading = await this.loadingController.create({
              cssClass: "app-send-loading",
              message: this.languageService.getTerm("loading"),
            });
            await loading.present();

            this.userCRUDService
              .updateUser(user)
              .then(() => {
                this.userStorageService.setUser(user)
                  .then(() => {
                    this.searchList()
                  })
              })
              .catch(() => {
                this.presentToast(false);
              })
              .finally(async () => {
                await loading.dismiss();
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast(success: boolean, exists: boolean = false) {
    const toast = await this.toastController.create({
      message: exists
        ? this.languageService.getTerm("send.exists")
        : success
        ? this.languageService.getTerm("send.success")
        : this.languageService.getTerm("send.error"),
      color: "secondary",
      duration: 5000,
      position: "top",
      buttons: [
        {
          icon: ICONS.close,
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    toast.present();
  }
}
