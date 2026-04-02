describe("Auth Flow", () => {
  describe("Public Pages", () => {
    it("loading login page", () => {
      cy.visit("/login");
      cy.get("button").should("exist");
    });

    it("loading register page", () => {
      cy.visit("/register");
      cy.get("form").should("exist");
    });

    it("loading offline page", () => {
      cy.visit("/offline");
      cy.contains("Çevrimdışı").should("be.visible");
    });

    it("protected route redirects to login", () => {
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });

    it("group page redirects to login", () => {
      cy.visit("/groups");
      cy.url().should("include", "/login");
    });
  });

  describe("Login Form", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("Google button is visible", () => {
      cy.contains("Google").should("be.visible");
    });

    it("form elements exist", () => {
      cy.get("input").should("exist");
      cy.get("button").should("exist");
    });
  });

  describe("Register Form", () => {
    beforeEach(() => {
      cy.visit("/register");
    });

    it("form elements exist", () => {
      cy.get("input[type='email']").should("exist");
      cy.get("input[type='password']").should("exist");
    });

    it("submit button exists", () => {
      cy.get("button[type='submit']").should("exist");
    });

    it("empty form cannot be submitted", () => {
      cy.get("button[type='submit']").click();
      cy.url().should("include", "/register");
    });
  });
});
