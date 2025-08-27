describe("Auth flow (sign up -> confirm -> login)", () => {
  beforeEach(() => {
    // Stub server responses (email delivery not tested)
    cy.intercept("POST", "/api/auth/signup", {
      statusCode: 200,
      body: { message: "Signup OK" }
    }).as("signup");

    cy.intercept("POST", "/api/auth/confirm", {
      statusCode: 200,
      body: { message: "Confirmed" }
    }).as("confirm");
  });

  it("signs up, confirms email (stubbed), and logs in", () => {
    cy.visit("/signup");

    cy.get("[data-cy=email]").type("student@test.com");
    cy.get("[data-cy=password]").type("Password123");
    cy.get("[data-cy=signup-submit]").click();
    cy.wait("@signup").its("response.statusCode").should("eq", 200);

    // Simulate confirmation link click
    cy.visit("/confirm?token=fake-confirm-token");
    cy.get("[data-cy=confirm-cta]").click();
    cy.wait("@confirm").its("response.statusCode").should("eq", 200);

    // Login via custom command (stubs /api/auth/login)
    cy.login("student@test.com", "Password123");

    // Typical redirect after login
    cy.url().should("include", "/join");
  });
});
