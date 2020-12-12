import { Component, NgZone, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { APP_URL } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { UserGroupModel, UserModel, UserResumeModel } from 'src/app/core/models/user.model';
import { UserCRUDService } from 'src/app/core/services/firebase/user.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { UserStorageService } from 'src/app/core/services/storage/user.service';

@Component({
  selector: "app-user-groups-manage",
  templateUrl: "./user-groups-manage.page.html",
  styleUrls: ["./styles/user-groups-manage.page.scss", "../../../../shared/styles/confirm.alert.scss"],
})
export class UserGroupsManagePage implements OnInit {
  ICONS = ICONS;
  APP_URL = APP_URL;

  update: boolean = false;

  user_group: UserGroupModel = new UserGroupModel();
  manageUserGroupForm: FormGroup;
  original_name: string = "";

  user: UserModel = new UserModel()
  
  constructor(
    private router: Router,
    private userStorageService: UserStorageService,
    private userCRUDService: UserCRUDService,
    private languageService: LanguageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private ngZone: NgZone
  ){}

  async ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    this.user_group.users = []
    if (state == undefined) {
      this.manageUserGroupForm = new FormGroup({
        name: new FormControl(null, Validators.required),
        description: new FormControl(null, null),
        image_url: new FormControl(null, null),
      });
    } else {
      this.update = true;
      this.manageUserGroupForm = new FormGroup({
        name: new FormControl(state.user_group.name, Validators.required),
        description: new FormControl(state.user_group.description, null),
        image_url: new FormControl(state.user_group.image_url, null),
      });
      this.original_name = state.user_group.name;
      this.user_group.name = state.user_group.name;
      this.user_group.description = state.user_group.description;
      this.user_group.image_url = state.user_group.image_url;
      state.user_group.users.forEach((user) => {
        this.user_group.users.push(user);
      });
    }
    this.user = await this.userStorageService.getUser();
  }

  async sendUserGroup() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    let group_exists = false;
    if (this.user.user_groups && this.user.user_groups.length>0) {
      this.user.user_groups.forEach((group) => {
        if (group.name == this.manageUserGroupForm.value.name && group.name !== this.original_name) {
          group_exists = true;
        }
      });
    }
    if (group_exists) {
      loading.dismiss();
      this.presentToast(false, true);
    } else {
      if (this.update) {
        this.user.user_groups.forEach((group, group_index) => {
          if (group.name == this.user_group.name) {
            this.user.user_groups[group_index].name = this.manageUserGroupForm.value.name;
            this.user.user_groups[group_index].description = this.manageUserGroupForm.value.description;
            this.user.user_groups[group_index].image_url = this.manageUserGroupForm.value.image_url;
            this.user.user_groups[group_index].users = this.user_group.users;
          }
        })
      } else {
        this.user_group.name = this.manageUserGroupForm.value.name;
        this.user_group.description = this.manageUserGroupForm.value.description;
        this.user_group.image_url = this.manageUserGroupForm.value.image_url;
        this.user.user_groups.push(this.user_group)
      }
      this.userCRUDService
        .updateUser(this.user)
        .then(async () => {
          await this.userStorageService
            .setUser(this.user)
            .then(() => {
              this.ngZone.run(() =>
                this.router.navigate(
                  [
                    APP_URL.menu.name +
                    "/" +
                    APP_URL.menu.routes.settings.main +
                    "/" +
                    APP_URL.menu.routes.settings.routes.user_groups.main
                  ]
                )
              );
            });
        })
        .catch(() => {
          this.presentToast(false);
        })
        .finally(async () => {
          await loading.dismiss();
        });
    }
  }

  addUser() {
    this.user_group.users.push(new UserResumeModel())
  }

  deleteUser(user: UserResumeModel) {
    this.user_group.users.splice(
      this.user_group.users.indexOf(user),
      1
    );
  }

  canSend(): boolean {
    return (
      !this.manageUserGroupForm.valid ||
      !this.user_group.users ||
      this.user_group.users.length == 0 ||
      !this.usersAreValid()
    );
  }

  usersAreValid(): boolean {
    let valid = true;
    if (this.user_group.users) {
      this.user_group.users.forEach((user) => {
        if (
          !user.name ||
          !user.email ||
          !user.email.match("[A-Za-z0-9._%+-]{1,}@[a-zA-Z]{1,}([.]{1}[a-zA-Z]{1,}|[.]{1}[a-zA-Z]{1,}[.]{1}[a-zA-Z]{1,})")
        ) {
          valid = false;
        }
      });
    }
    return valid;
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

  async presentOptions(user_group: UserGroupModel) {
    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: [
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
                    this.ngZone.run(() =>
                      this.router.navigate(
                        [
                          APP_URL.menu.name +
                          "/" +
                          APP_URL.menu.routes.settings.main +
                          "/" +
                          APP_URL.menu.routes.settings.routes.user_groups.main
                        ]
                      )
                    );
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
}
