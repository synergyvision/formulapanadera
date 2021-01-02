import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ICONS } from "src/app/config/icons";
import { ReferenceModel } from "src/app/core/models/shared.model";

@Component({
  selector: "app-references-modal",
  templateUrl: "references.modal.html",
  styleUrls: ["./styles/references.modal.scss"],
})
export class ReferencesModal implements OnInit {
  ICONS = ICONS;

  @Input() references: Array<ReferenceModel>;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    if (!this.references) {
      this.references = [];
    }
    if (this.references.length == 0) {
      this.references.push(new ReferenceModel())
    }
  }

  dismissModal() {
    this.modalController.dismiss(undefined);
  }

  save() {
    this.modalController.dismiss(this.references);
  }

  addReference() {
    this.references.push(new ReferenceModel())
  }

  deleteReference(reference: ReferenceModel) {
    this.references.splice(
      this.references.indexOf(reference),
      1
    );
  }

  referencesEmpty() {
    let isEmpty = false;
    this.references.forEach((reference) => {
      if (!reference.name || !reference.url) {
        isEmpty = true;
      }
    });
    return isEmpty;
  }
}
