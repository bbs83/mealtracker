# MealTrack — plan.md

## 1) Objectives
- Prove the **core workflow** works reliably: **Patient JSON → Claude → full nutrition plan (5 etapas)**.
- Build a PT-BR v1 app with a clean journey: **Landing → cadastro/login → dashboard → novo questionário (8 passos) → revisão → gerar plano → ver plano + histórico**.
- Persist data per user in MongoDB: assessments (intake) + generated plans + timestamps.
- Ensure safety/guardrails from the prompt are preserved (disclaimer, kcal floors, no suplementos).

---

## 2) Implementation Steps (Phases)

### Phase 1 — Core POC (Isolation): Claude plan generation
**User stories (POC)**
1. As a dev, I want to send a real patient JSON to Claude and receive a long markdown plan.
2. As a dev, I want to verify the output contains all 5 sections (ETAPA 1–5) and disclaimer.
3. As a dev, I want to confirm the prompt respects kcal minimums and avoids supplement prescriptions.
4. As a dev, I want retries/timeouts so transient API failures don’t break the flow.
5. As a dev, I want deterministic-enough outputs (temperature) to reduce variability in tests.

**Steps**
- Web research: Anthropic/Claude best practices for long-form generation, token limits, timeouts, retries.
- Create a minimal **Python test script**:
  - Loads sample `{PATIENT_JSON}` (covering conditional women’s fields + allergies + goals).
  - Injects into the provided prompt template.
  - Calls Claude via **Emergent LLM Key**.
  - Validates: non-empty markdown, contains key headings/keywords for ETAPA 1–5, includes disclaimer, length sanity check.
- Iterate prompt parameters (max tokens, temperature) until stable.
- Freeze: prompt template version + model name + parameters.

**Exit criteria**: script succeeds repeatedly; output consistently includes required sections and is within token limits.

---

### Phase 2 — V1 App Development (MVP around proven core; auth deferred)
**User stories (v1 without auth)**
1. As a visitor, I can see a landing page explaining MealTrack and start the assessment.
2. As a user, I can fill the 8-step intake with smooth navigation and progress feedback.
3. As a user, I can review my answers and jump back to edit before submitting.
4. As a user, I can generate my nutrition plan and see it rendered as readable markdown.
5. As a user, I can start a new assessment and keep previous plans in a simple history list.

**Backend (FastAPI + MongoDB)**
- Data models/collections (MVP):
  - `assessments`: `{_id, user_id(optional in v1), created_at, patient_json}`
  - `plans`: `{_id, assessment_id, created_at, model, prompt_version, plan_markdown}`
- API endpoints (v1):
  - `POST /api/assessments` create assessment
  - `POST /api/assessments/{id}/generate-plan` calls Claude and stores plan
  - `GET /api/plans/{id}` fetch plan
  - `GET /api/plans` list recent plans (no auth: global or session-scoped; keep MVP simple)
- Implement Claude service wrapper (timeouts, retries, logging, token/max length controls).

**Frontend (React)**
- Routes/pages:
  - `/` Landing
  - `/app` Dashboard (v1: local/session scoped)
  - `/app/new` NutritionForm (based on `nutrition-form.jsx`)
  - `/app/plans/:id` Plan viewer (markdown renderer)
- Implement the form mirroring the artifact:
  - 8 steps, conditional women’s step, review step, validation for required fields.
  - Persist in local state; on submit call backend to create assessment + generate plan.
- Plan viewer:
  - Render markdown, provide “download/copy” actions.
  - Loading + failure states with retry.

**Testing (end of Phase 2)**
- 1 full E2E run: landing → form → generate → view plan → history shows it.
- Fix any broken states (timeouts, partial saves, navigation).

---

### Phase 3 — Add Auth + user-scoped dashboard/history (email/senha, JWT)
**User stories (auth)**
1. As a user, I can create an account with email/senha.
2. As a user, I can login and stay logged in via JWT.
3. As a user, I only see **my** assessments/plans.
4. As a user, I can logout and my data remains saved.
5. As a user, I can manage basic profile info (name) and start a new assessment anytime.

**Backend**
- `users` collection: `{_id, email, password_hash, created_at}`
- Auth endpoints:
  - `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout(optional)`
  - JWT middleware; protect assessments/plans endpoints.
- Migrate Phase 2 data flow to require `user_id`.

**Frontend**
- Auth pages: `/login`, `/signup`.
- Auth guard for `/app/*`.
- Dashboard: plan history per user; “New assessment” CTA.

**Testing (end of Phase 3)**
- E2E: signup → create assessment → generate plan → refresh → history persists → logout/login → still there.

---

### Phase 4 — Hardening + polish (PT-BR now; i18n-ready)
**User stories (polish)**
1. As a user, I get clear validation messages per step before advancing.
2. As a user, I can edit an existing assessment and regenerate a new plan version.
3. As a user, I can export my plan (PDF or print-friendly view) for sharing.
4. As a user, I can see status messages when Claude is generating (ETA + retry).
5. As a user, I can switch language later without losing content (foundation for ENG).

**Work**
- Introduce i18n structure (PT-BR default; ENG later).
- Improve plan rendering (table handling, anchors, print styles).
- Add plan versioning: multiple plans per assessment.
- Add rate limiting/basic abuse protection.
- Add monitoring logs for generation failures.

**Testing (end of Phase 4)**
- Regression E2E across main flows + generation under slow/failed AI responses.

---

## 3) Next Actions (Immediate)
1. Create and run Phase 1 Python POC calling Claude with the prompt + sample patient JSON.
2. Lock model + parameters (max tokens/temperature) once stable.
3. Implement FastAPI endpoints for assessment + generation using the proven wrapper.
4. Build React v1 pages (Landing, Dashboard, Form, Plan view) using the provided form artifact.
5. Run one end-to-end pass and fix issues before adding auth.

---

## 4) Success Criteria
- POC: 5/5 repeated runs return a complete markdown plan with ETAPA 1–5 + disclaimer; no truncated output.
- V1 (no auth): user can complete intake, generate plan, view it rendered, and see it in history.
- Auth phase: users have isolated data; sessions persist; protected endpoints enforce JWT.
- Reliability: generation failures show actionable UI errors and allow retry without data loss.
- No violations of safety rules (kcal floors, no supplement prescriptions) in generated plans across test cases.
