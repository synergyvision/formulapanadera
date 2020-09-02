import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { FormulaListingPage } from "./formula-listing.page";
import { TranslateModule } from '@ngx-translate/core';

describe("FormulaListingPage", () => {
  let component: FormulaListingPage;
  let fixture: ComponentFixture<FormulaListingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormulaListingPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaListingPage);
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
