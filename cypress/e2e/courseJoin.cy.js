describe("Course Join Flow", () => {
  beforeEach(() => {
    cy.fixture("users").then((u) => {
      cy.login(u.valid.email, u.valid.password);
    });

    // Stub join API + course fetch
    cy.intercept("POST", "/api/courses/join", (req) => {
      const { code, password } = req.body || {};
      if (code === "COURSE123" && password === "securePass") {
        req.reply({
          statusCode: 200,
          body: { courseId: 42, title: "Intro to Biology", joined: true }
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { message: "Invalid course code or password" }
        });
      }
    }).as("joinCourse");

    cy.intercept("GET", "/api/courses/42", {
      statusCode: 200,
      body: { id: 42, title: "Intro to Biology", joined: true }
    }).as("getCourse");

    cy.visit("/join");
  });

  it("joins successfully and lands on dashboard with Start Course visible", () => {
    cy.get("[data-cy=course-code]").type("COURSE123");
    cy.get("[data-cy=course-password]").type("securePass");
    cy.get("[data-cy=join-course]").should("be.enabled").click();

    cy.wait("@joinCourse").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/dashboard/42");
    cy.wait("@getCourse");

    cy.get("[data-cy=course-title]").should("contain", "Intro to Biology");
    cy.get("[data-cy=start-course]").should("be.visible");
  });

  it("rejects invalid code/password with visible error", () => {
    cy.get("[data-cy=course-code]").type("WRONG123");
    cy.get("[data-cy=course-password]").type("badPass");
    cy.get("[data-cy=join-course]").click();

    cy.wait("@joinCourse").its("response.statusCode").should("eq", 400);

    cy.get("[data-cy=error-message]")
      .should("be.visible")
      .and("contain", "Invalid course code or password");
  });
});
