import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { IngredientPage } from "./ingredient.page";
import { TranslateModule } from "@ngx-translate/core";

describe("IngredientPage", () => {
  let component: IngredientPage;
  let fixture: ComponentFixture<IngredientPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IngredientPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
