import { Component, Input } from "@angular/core";
import { NoteModel } from "src/app/core/models/shared.model";

@Component({
  selector: "app-notes",
  templateUrl: "./notes.component.html",
  styleUrls: ["./styles/notes.component.scss"],
})
export class NotesComponent {
  @Input() notes: Array<NoteModel>;

  constructor() { }
}
