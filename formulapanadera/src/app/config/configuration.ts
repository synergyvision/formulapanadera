// Available languages
export const LANGUAGE = {
  default: "es",
  available: [
    { name: "Español", code: "es" },
    { name: "English", code: "en" },
  ],
};

// Currency
export const CURRENCY = "$";

// Number of loading items on listing pages
export const LOADING_ITEMS = 10;

// Page URLs
export const APP_URL = {
  auth: {
    name: "auth",
    routes: {
      sign_up: "sign-up",
      sign_in: "sign-in",
      forgot_password: "forgot-password",
    },
  },
  menu: {
    name: "menu",
    routes: {
      production: {
        main: "production",
        routes: {
          listing: "",
          details: "details",
          management: "manage",
          start: "start",
        },
      },
      formula: {
        main: "formula",
        routes: {
          listing: "",
          details: "details",
          management: "manage",
        },
      },
      ingredient: {
        main: "ingredient",
        routes: {
          listing: "",
          details: "details",
          management: "manage",
        },
      },
      settings: {
        main: "settings",
        routes: {
          settings: "",
          change_password: "change-password",
          user_groups: {
            main: "user-groups",
            routes: {
              listing: "",
              management: "manage",
            },
          },
          shared: {
            main: "shared",
            routes: {
              listing: "",
            },
          },
        },
      },
    },
  },
};

// Main page
export const MAIN_PAGE =
  "/" + APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main;
