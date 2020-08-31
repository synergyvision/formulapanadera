import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { IngredientListingPage } from "./ingredient-listing.page";
import { TranslateModule } from "@ngx-translate/core";

describe("IngredientListingPage", () => {
  let component: IngredientListingPage;
  let fixture: ComponentFixture<IngredientListingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IngredientListingPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
