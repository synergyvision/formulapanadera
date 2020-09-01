import { Component, HostBinding } from "@angular/core";
import { LanguageService } from "../../../core/services/language.service";
import { AuthService } from "../../../core/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { UserModel } from "src/app/core/models/user.model";
import {
  IResolvedRouteData,
  ResolverHelper,
} from "../../../shared/helpers/resolver-helper";

@Component({
  selector: "app-options",
  templateUrl: "options.page.html",
  styleUrls: [
    "./styles/options.page.scss",
    "./../../../shared/styles/language.alert.scss",
  ],
})
export class OptionsPage {
  subscriptions: Subscription;
  user: UserModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.user && this.user.isShell ? true : false;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // On init, the route subscription is the active subscription
    this.subscriptions = this.route.data.subscribe(
      (resolvedRouteData: IResolvedRouteData<UserModel>) => {
        // Route subscription resolved, now the active subscription is the Observable extracted from the resolved route data
        this.subscriptions = ResolverHelper.extractData<UserModel>(
          resolvedRouteData.data,
          UserModel
        ).subscribe(
          (state) => {
            this.user = state;
          },
          (error) => {}
        );
      },
      (error) => {}
    );
    this.languageService.initLanguages();
  }

  ionViewWillLeave(): void {
    this.subscriptions.unsubscribe();
  }

  async openLanguageChooser() {
    await this.languageService.openLanguageChooser();
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(["auth/sign-in"], { replaceUrl: true });
    });
  }
}
