import { SignInPage } from "../../page-objects/auth/signIn.po";
import { TabsPage } from "../../page-objects/tabs/tabs.po";
import { ProductionPage } from "../../page-objects/production/production.po";
import { FormulaPage } from "../../page-objects/formula/formula.po";
import { IngredientPage } from "../../page-objects/ingredient/ingredient.po";
import { OptionsPage } from "../../page-objects/settings/options.po";

describe("Tabs", () => {
  const tabsPage = new TabsPage();
  const productionPage = new ProductionPage();
  const formulaPage = new FormulaPage();
  const ingredientPage = new IngredientPage();
  const optionsPage = new OptionsPage();
  const signInPage = new SignInPage();

  beforeAll(() => {
    signInPage.load();
    signInPage.enterEmail("user@test.com");
    signInPage.enterPassword("testtest");
    signInPage.clickSignIn();
  });

  it("should display tabs", () => {
    expect(tabsPage.rootElement().isDisplayed()).toEqual(true);
  });

  it("allows navigation to production tab", () => {
    tabsPage.navigateToProduction();
    productionPage.waitUntilVisible();
  });

  it("allows navigation to formula tab", () => {
    tabsPage.navigateToFormulas();
    formulaPage.waitUntilVisible();
  });

  it("allows navigation to ingredient tab", () => {
    tabsPage.navigateToIngredients();
    ingredientPage.waitUntilVisible();
  });

  it("allows navigation to settings tab", () => {
    tabsPage.navigateToSettings();
    optionsPage.waitUntilVisible();
  });
});
