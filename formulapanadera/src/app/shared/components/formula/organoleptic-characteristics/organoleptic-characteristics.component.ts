import { Component, Input } from "@angular/core";
import { OrganolepticCharacteristicsModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-organoleptic-characteristics",
  templateUrl: "./organoleptic-characteristics.component.html",
  styleUrls: ["./styles/organoleptic-characteristics.component.scss"],
})
export class OrganolepticCharacteristicsComponent {
  @Input() organoleptic_characteristics: OrganolepticCharacteristicsModel;

  constructor() {}
}
