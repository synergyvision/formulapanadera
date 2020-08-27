import { Component } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { PasswordValidator } from "../../../../core/validators/password.validator";
import { AuthService } from "../../../../core/services/auth.service";
import { LanguageService } from "../../../../core/services/language.service";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.page.html",
  styleUrls: ["./styles/change-password.page.scss"],
})
export class ChangePasswordPage {
  passwordForm: FormGroup;
  matching_passwords_group: FormGroup;
  submitError: string;
  validation_messages: Object;

  constructor(
    private authService: AuthService,
    private languageService: LanguageService
  ) {
    this.matching_passwords_group = new FormGroup(
      {
        password: new FormControl(
          "",
          Validators.compose([Validators.minLength(6), Validators.required])
        ),
        confirm_password: new FormControl("", Validators.required),
      },
      (formGroup: FormGroup) => {
        return PasswordValidator.areNotEqual(formGroup);
      }
    );

    this.passwordForm = new FormGroup({
      matching_passwords: this.matching_passwords_group,
    });

    this.validation_messages = this.getValidationMessages();
  }

  updatePassword() {
    const password = this.passwordForm.value.matching_passwords.password;
    console.log(password, this.passwordForm);
    this.authService.updatePassword(password);
  }

  getValidationMessages(): Object {
    return {
      password: [
        {
          type: "required",
          message: this.languageService.getTerm("validation.required.password"),
        },
        {
          type: "minlength",
          message: this.languageService.getTerm(
            "validation.minlength.password",
            {
              number: "6",
            }
          ),
        },
      ],
      confirm_password: [
        {
          type: "required",
          message: this.languageService.getTerm(
            "validation.required.confirm_password"
          ),
        },
      ],
      matching_passwords: [
        {
          type: "areNotEqual",
          message: this.languageService.getTerm(
            "validation.areNotEqual.password"
          ),
        },
      ],
    };
  }
}
