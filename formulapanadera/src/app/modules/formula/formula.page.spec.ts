import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { FormulaPage } from "./formula.page";
import { TranslateModule } from '@ngx-translate/core';

describe("FormulaPage", () => {
  let component: FormulaPage;
  let fixture: ComponentFixture<FormulaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormulaPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
