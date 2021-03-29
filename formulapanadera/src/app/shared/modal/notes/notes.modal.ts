import { Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
import { IonTextarea, ModalController } from "@ionic/angular";
import { ICONS } from "src/app/config/icons";
import { NoteModel } from "src/app/core/models/shared.model";

@Component({
  selector: "app-notes-modal",
  templateUrl: "notes.modal.html",
  styleUrls: ["./styles/notes.modal.scss"],
})
export class NotesModal implements OnInit {
  ICONS = ICONS;

  @Input() notes: Array<NoteModel>;
  @ViewChildren("description") private textAreas: QueryList<IonTextarea>;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    if (!this.notes) {
      this.notes = [];
    }
    if (this.notes.length == 0) {
      this.notes.push(new NoteModel())
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
    this.modalController.dismiss(undefined);
  }

  save() {
    this.modalController.dismiss(this.notes);
  }

  addNote() {
    this.notes.push(new NoteModel())
  }

  deleteNote(note: NoteModel) {
    this.notes.splice(
      this.notes.indexOf(note),
      1
    );
  }

  notesEmpty() {
    let isEmpty = false;
    this.notes.forEach((note) => {
      if (!note.description) {
        isEmpty = true;
      }
    });
    return isEmpty;
  }
}
