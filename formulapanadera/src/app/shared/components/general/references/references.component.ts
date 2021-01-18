import { Component, Input } from "@angular/core";
import { ReferenceModel } from "src/app/core/models/shared.model";

@Component({
  selector: "app-references",
  templateUrl: "./references.component.html",
  styleUrls: ["./styles/references.component.scss"],
})
export class ReferencesComponent {
  @Input() references: Array<ReferenceModel>;

  constructor() { }
  
  openLink(reference: ReferenceModel) {
    window.open(reference.url, '_system', 'location=yes');
    return false;
  }
}
