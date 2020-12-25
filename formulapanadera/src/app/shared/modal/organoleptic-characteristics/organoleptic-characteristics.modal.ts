import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
import { IonTextarea, ModalController } from "@ionic/angular";
import { ICONS } from "src/app/config/icons";
import {
  BasicCharacteristicsModel,
  OrganolepticCharacteristicsModel,
} from "src/app/core/models/formula.model";

@Component({
  selector: "app-organoleptic-characteristics-modal",
  templateUrl: "organoleptic-characteristics.modal.html",
  styleUrls: ["./styles/organoleptic-characteristics.modal.scss"],
})
export class OrganolepticCharacteristicsModal implements AfterViewInit, OnInit {
  ICONS = ICONS;

  @ViewChildren("organolepticCharacteristics") private textAreas: QueryList<IonTextarea>
  @Input() organoleptic_characteristics: OrganolepticCharacteristicsModel;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    if (!this.organoleptic_characteristics) {
      this.organoleptic_characteristics = new OrganolepticCharacteristicsModel();
    }
    if (!this.organoleptic_characteristics.crumb) {
      this.organoleptic_characteristics.crumb = new BasicCharacteristicsModel();
    }
    if (!this.organoleptic_characteristics.crust) {
      this.organoleptic_characteristics.crust = {
        ...new BasicCharacteristicsModel(),
        hardness: null
      };
    }
  }
  
  ngAfterViewInit() {
    this.textAreas.toArray().forEach(textArea => {
      textArea.autoGrow = true;
      textArea.ionChange.subscribe(() => {
        textArea.autoGrow = true;
      })
    })
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  save() {
    if (!this.organoleptic_characteristics || this.allFieldsEmpty()) {
      this.modalController.dismiss(undefined);
    } else {
      let organoleptic_characteristics: OrganolepticCharacteristicsModel;
      organoleptic_characteristics = { ...this.organoleptic_characteristics };
      organoleptic_characteristics.crumb = { ...this.organoleptic_characteristics.crumb };
      organoleptic_characteristics.crust = { ...this.organoleptic_characteristics.crust };
      this.modalController.dismiss(organoleptic_characteristics);
    }
  }

  allFieldsEmpty(): boolean {
    let fields_empty: boolean = false;
    if (
      !this.organoleptic_characteristics.overview &&
      !this.organoleptic_characteristics.shape &&
      !this.organoleptic_characteristics.weight &&
      !this.organoleptic_characteristics.cell_size &&
      !this.organoleptic_characteristics.bubbles_presence &&
      !this.organoleptic_characteristics.useful_life
    ) {
      if (
        (
          !this.organoleptic_characteristics.crumb ||
          (
            !this.organoleptic_characteristics.crumb.aroma &&
            !this.organoleptic_characteristics.crumb.texture &&
            !this.organoleptic_characteristics.crumb.color &&
            !this.organoleptic_characteristics.crumb.flavor
          )
        )
        &&
        (
          !this.organoleptic_characteristics.crust ||
          (
            !this.organoleptic_characteristics.crust.aroma &&
            !this.organoleptic_characteristics.crust.texture &&
            !this.organoleptic_characteristics.crust.color &&
            !this.organoleptic_characteristics.crust.flavor &&
            !this.organoleptic_characteristics.crust.hardness
          )
        )
      ) {
        fields_empty = true;
      }
    }
    return fields_empty;
  }
}
