describe("Dashboard visibility rules", () => {
  beforeEach(() => {
    cy.fixture("users").then((u) => {
      cy.login(u.valid.email, u.valid.password);
    });
  });

  it("does NOT show Start Course before joining", () => {
    // User opens a course they haven't joined
    cy.intercept("GET", "/api/courses/99", {
      statusCode: 200,
      body: { id: 99, title: "Chemistry 101", joined: false }
    }).as("getCourseNotJoined");

    cy.visit("/dashboard/99");
    cy.wait("@getCourseNotJoined");

    cy.get("[data-cy=course-title]").should("contain", "Chemistry 101");
    cy.get("[data-cy=start-course]").should("not.exist");
  });
});
