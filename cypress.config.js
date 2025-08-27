const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // change if your app runs elsewhere
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    video: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    defaultCommandTimeout: 8000
  }
});
