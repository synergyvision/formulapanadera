import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { ROLES } from "src/app/config/roles";
import { PermissionModel } from "../../core/models/role.model";
import { UserStorageService } from "../../core/services/storage/user.service";

@Directive({
  selector: "[appHasPermission]"
})
export class HasPermissionDirective {

  @Input('appHasPermission') permission: PermissionModel;
  constructor(
    private userStorageService: UserStorageService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }
  
  async ngOnInit() {
    const user = await this.userStorageService.getUser();
    let role = ROLES.find((role) => { return role.name == user.role });

    if (!role) {
      this.viewContainer.clear();
    }
    
    if (!this.permission || role.permissions.some((value) => { return value.name == this.permission.name && value.type == this.permission.type })) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}