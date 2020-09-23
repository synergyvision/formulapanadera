import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule, IonInput } from "@ionic/angular";

import { ShowHidePasswordComponent } from "./show-hide-password.component";

describe("ShowHidePasswordComponent", () => {
  let component: ShowHidePasswordComponent;
  let fixture: ComponentFixture<ShowHidePasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShowHidePasswordComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowHidePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", async () => {
    await expect(component).toBeTruthy();
  });

  it("should toggle show: text", () => {
    component.input = {
      type: "text",
    } as IonInput;
    component.show = false;
    component.toggleShow();
    expect(component.input.type).toEqual("text");
  });

  it("should toggle show: password", () => {
    component.input = {
      type: "text",
    } as IonInput;
    component.show = true;
    component.toggleShow();
    expect(component.input.type).toEqual("password");
  });
});
