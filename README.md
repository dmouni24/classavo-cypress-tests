# classavo-cypress-tests# Classavo Candidate Assignment — Cypress Tests

This repository contains Cypress tests that simulate a simplified student flow:

1. Student signs up, confirms email, logs in
2. Enters course code & password to join
3. On success, is redirected to a Course Dashboard showing the course title and a **Start Course** button

> **Note:** There is no UI implementation here; network calls are stubbed using `cy.intercept`. Selectors like `data-cy="..."" are assumed to exist in the app.

## Structure
cypress/
e2e/
auth.cy.js
courseJoin.cy.js
dashboard.cy.js
edgeCases.cy.js
fixtures/
users.json
support/
commands.js
e2e.js
cypress.config.js
package.json
README.md


## Approach
- Split tests by feature area (auth, join, dashboard, edge cases)
- Stable `data-cy` selectors
- `cy.intercept` for deterministic tests
- `cy.login()` custom command stubs `/api/auth/login` and sets a token

## Assumptions
- Endpoints: `/api/auth/signup`, `/api/auth/confirm`, `/api/auth/login`
- Course endpoints: `POST /api/courses/join` (returns `{ courseId, title, joined }`), `GET /api/courses/:id`
- Routes: `/signup`, `/confirm`, `/login`, `/join`, `/dashboard/:courseId`
- Start button shows only when `joined === true`
- Auth token read from `localStorage.authToken`

## Staging vs Production
- **Staging:** full happy + negative flows, seeded data, writes allowed
- **Prod:** smoke-only, non-destructive, verify login and dashboard loads

## 1 day/week QA priorities
1) Critical path (login → join → start button)  
2) High-risk UX (double-submit prevention, trimming, expired session)  
3) Regression nets (error messages, route guards)

## Run locally
```bash
npm install
npm run cypress:open   # interactive
# or
npm run cypress:run    # headless


---

## 5) `cypress/support/e2e.js`
```js
// Loaded before each spec file
import './commands';
