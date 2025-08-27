// Custom command to perform a stubbed login
Cypress.Commands.add("login", (email, password) => {
  // Stub login
  cy.intercept("POST", "/api/auth/login", (req) => {
    const { email: e, password: p } = req.body || {};
    if (e === "student@test.com" && p === "Password123") {
      req.reply({
        statusCode: 200,
        body: {
          token: "fake-jwt-token",
          user: { id: 1, email: e }
        }
      });
    } else {
      req.reply({
        statusCode: 401,
        body: { message: "Invalid credentials" }
      });
    }
  }).as("loginApi");

  cy.visit("/login");
  cy.get("[data-cy=email]").type(email);
  cy.get("[data-cy=password]").type(password);
  cy.get("[data-cy=login-submit]").click();
  cy.wait("@loginApi").its("response.statusCode").should("eq", 200);

  // Simulate frontend auth state
  cy.window().then((win) => {
    win.localStorage.setItem("authToken", "fake-jwt-token");
  });
});
