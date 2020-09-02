import { async } from "@angular/core/testing";

import { PasswordValidator } from "./password.validator";
import { FormGroup, FormControl } from "@angular/forms";

describe("PasswordValidator", () => {
  let validator: PasswordValidator;
  let formGroup: FormGroup;

  beforeEach(async(() => {
    validator = new PasswordValidator();
  }));

  it("should create", () => {
    expect(validator).toBeDefined();
  });

  it("should be equal", () => {
    formGroup = new FormGroup(
      {
        password: new FormControl("password"),
        confirm_password: new FormControl("password"),
      },
      (formGroup: FormGroup) => {
        return PasswordValidator.areNotEqual(formGroup);
      }
    );
    expect(formGroup.value).toEqual({
      password: "password",
      confirm_password: "password",
    });
  });

  it("should be equal", () => {
    formGroup = new FormGroup(
      {
        password: new FormControl("not equal"),
        confirm_password: new FormControl("password"),
      },
      (formGroup: FormGroup) => {
        return PasswordValidator.areNotEqual(formGroup);
      }
    );
    expect(formGroup.value).toEqual({
      password: "not equal",
      confirm_password: "password",
    });
  });
});
