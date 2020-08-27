import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { FormulaPage } from "./formula.page";

describe("FormulaPage", () => {
  let component: FormulaPage;
  let fixture: ComponentFixture<FormulaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormulaPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
