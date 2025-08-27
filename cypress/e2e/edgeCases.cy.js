describe("Edge cases often missed", () => {
  beforeEach(() => {
    cy.fixture("users").then((u) => {
      cy.login(u.valid.email, u.valid.password);
    });
    cy.visit("/join");
  });

  it("prevents double-submit on Join (button disabled after first click)", () => {
    // Delay server reply; button should disable immediately
    cy.intercept("POST", "/api/courses/join", (req) => {
      const { code, password } = req.body || {};
      const ok = code === "COURSE123" && password === "securePass";
      setTimeout(() => {
        req.reply({
          statusCode: ok ? 200 : 400,
          body: ok
            ? { courseId: 42, title: "Intro to Biology", joined: true }
            : { message: "Invalid course code or password" }
        });
      }, 1000);
    }).as("joinCourseSlow");

    cy.get("[data-cy=course-code]").type("COURSE123");
    cy.get("[data-cy=course-password]").type("securePass");

    cy.get("[data-cy=join-course]").click().should("be.disabled");
    // Force click won’t re-submit if truly disabled
    cy.get("[data-cy=join-course]").click({ force: true });
    cy.wait("@joinCourseSlow");

    cy.url().should("include", "/dashboard/42");
  });

  it("trims whitespace in course code (UX robustness)", () => {
    cy.intercept("POST", "/api/courses/join", (req) => {
      const { code, password } = req.body || {};
      // Backend strict; frontend should trim before sending
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

    cy.get("[data-cy=course-code]").type("  COURSE123  ");
    cy.get("[data-cy=course-password]").type("securePass");
    cy.get("[data-cy=join-course]").click();

    cy.wait("@joinCourse").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/dashboard/42");
  });

  it("redirects to login if session expired while opening dashboard", () => {
    // Simulate missing/expired token
    cy.window().then((win) => win.localStorage.removeItem("authToken"));

    cy.intercept("GET", "/api/courses/42", {
      statusCode: 401,
      body: { message: "Unauthorized" }
    }).as("getCourse401");

    cy.visit("/dashboard/42");
    cy.wait("@getCourse401");
    cy.url().should("include", "/login");
  });
});
