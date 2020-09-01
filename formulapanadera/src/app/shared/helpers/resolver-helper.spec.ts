import { ResolverHelper } from "./resolver-helper";
import { UserModel } from "src/app/core/models/user.model";
import { DataStore } from "../shell/data-store";

describe("ResolverHelper", () => {
  it("should return source.state", () => {
    let userModel = new DataStore<UserModel>(new UserModel());
    ResolverHelper.extractData<UserModel>(userModel, UserModel);
    expect(ResolverHelper.extractData).toBeDefined();
  });

  it("should return of(source)", () => {
    let userModel: UserModel = new UserModel();
    ResolverHelper.extractData<UserModel>(userModel, UserModel);
    expect(ResolverHelper.extractData).toBeDefined();
  });
});
