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
    this.modalController.dismiss(this.organoleptic_characteristics);
  }
}
