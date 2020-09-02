import { IngredientPage } from "../../page-objects/ingredient/ingredient.po";
import { SignInPage } from "../../page-objects/auth/signIn.po";
import { TabsPage } from "../../page-objects/tabs/tabs.po";

describe("Ingredient", () => {
  const ingredientPage = new IngredientPage();
  const tabsPage = new TabsPage();
  const signInPage = new SignInPage();

  beforeEach(() => {
    signInPage.load();
    signInPage.enterEmail("user@test.com");
    signInPage.enterPassword("testtest");
    signInPage.clickSignIn();
    tabsPage.navigateToIngredients();
  });

  it("should display ingredient page", () => {
    expect(ingredientPage.rootElement().isDisplayed()).toEqual(true);
  });

  it("should create a new ingredient", () => {
    ingredientPage.clickCreate();
    ingredientPage.waitForModalPresent();
    ingredientPage.enterName("Whole grain flour");
    ingredientPage.enterHydration("0");
    ingredientPage.clickIsFlour();
    ingredientPage.enterCost("1.3");
    ingredientPage.clickSubmit();
    ingredientPage.wait();
  });

  it("should update an ingredient", () => {
    ingredientPage.clickIngredient();
    ingredientPage.waitForModalPresent();
    ingredientPage.enterHydration("70");
    ingredientPage.clickIsFlour();
    ingredientPage.enterCost("5");
    ingredientPage.clickSubmit();
    ingredientPage.wait();
  });

  it("should delete an ingredient", () => {
    ingredientPage.clickIngredient();
    ingredientPage.waitForModalPresent();
    ingredientPage.clickDelete();
    ingredientPage.wait();
  });
});
