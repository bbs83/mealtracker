# MealTrack — Updated plan.md

## 1) Objectives
- Confirm the **core workflow** is production-ready: **Patient JSON → Claude → full nutrition plan (ETAPA 1–5) in Markdown**.
- Deliver a polished PT-BR v1 with a clean journey: **Landing → cadastro/login → dashboard → novo questionário (8 passos) → revisão → gerar plano → ver plano + histórico**.
- Ensure **per-user persistence** in MongoDB: users, assessments, generated plans, timestamps, token usage.
- Maintain prompt **safety/guardrails** end-to-end (disclaimer, kcal floors, no suplementos) and render the plan clearly (tables, headings).
- Finish **final E2E validation** and small UX improvements (e.g., review step human-readable values) before release.

---

## 2) Implementation Steps (Phases)

### Phase 1 — Core POC (Isolation): Claude plan generation ✅ COMPLETED
**User stories (POC)**
1. As a dev, I want to send a real patient JSON to Claude and receive a long markdown plan.
2. As a dev, I want to verify the output contains all 5 sections (ETAPA 1–5) and disclaimer.
3. As a dev, I want to confirm the prompt respects kcal minimums and avoids supplement prescriptions.
4. As a dev, I want stable generation parameters (max tokens, temperature) for consistent output.

**What was done**
- Implemented and ran a POC script using **Anthropic SDK** with Claude Sonnet 4.5.
- Confirmed the model produces:
  - Complete plan with ETAPA 1–5
  - Disclaimer present
  - Adequate length (3k–5k+ words observed)
  - Non-truncated output (stop_reason = end_turn)
- Saved the generated output for inspection.

**Exit criteria**: Met.

---

### Phase 2 — V1 App Development (Full-stack MVP) ✅ COMPLETED
> Note: Auth was originally planned for Phase 3, but was implemented during Phase 2 to complete the “área logada própria” journey.

**User stories (v1)**
1. As a visitor, I can see a landing page explaining the app and start signup/login.
2. As a user, I can sign up/login with email/senha.
3. As a logged-in user, I can start a new nutrition assessment (multi-step form).
4. As a user, I can review all answers and edit sections before submitting.
5. As a user, I can generate my nutrition plan and view it rendered as Markdown.
6. As a user, I can see plan history in the dashboard.

**Backend (FastAPI + MongoDB) — Implemented**
- Collections:
  - `users`: email, password_hash, created_at
  - `assessments`: user_id, patient_data, created_at
  - `plans`: assessment_id, user_id, status, plan_markdown, model, created_at, completed_at, token usage
- Endpoints:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/assessments`
  - `GET /api/assessments`
  - `POST /api/assessments/{id}/generate-plan` (synchronous generation, returns stored plan)
  - `GET /api/plans` (excludes markdown)
  - `GET /api/plans/{id}`
- Claude integration:
  - Model: `claude-sonnet-4-5-20250929`
  - max_tokens: 16000, temperature: 0.4
  - Stores token usage

**Frontend (React + shadcn/ui + Tailwind) — Implemented**
- Routes/pages:
  - `/` Landing
  - `/signup`, `/login`
  - `/app` Dashboard (history)
  - `/app/new` Multi-step assessment
  - `/app/plans/:planId` Markdown plan viewer
- Key UX:
  - Progress bar + step counter
  - Conditional Women’s Health step (only if sex = female)
  - Review step with edit links back to sections
  - Generation screen with rotating status messages + skeleton
  - Markdown rendering via `react-markdown` + `remark-gfm`

**Fixes/iterations completed**
- Confirmed auth works in real browser automation (timing issues were non-reproducible).
- Improved review step: map raw values to **human-readable PT-BR** (e.g., `female → Feminino`, `lose_weight → Emagrecer`).

**Exit criteria**: Met.

---

### Phase 3 — Auth + user-scoped dashboard/history ✅ COMPLETED (Merged into Phase 2)
**Delivered**
- Email/senha auth with JWT.
- Protected routes for `/app/*`.
- Per-user access control on assessments and plans.

**Exit criteria**: Met.

---

### Phase 4 — Hardening + polish (PT-BR now; i18n-ready) 🔜 NEXT
**User stories (polish)**
1. As a user, I get clear validation per step before advancing (required fields).
2. As a user, I can retry plan generation if it fails.
3. As a user, I can export my plan (print-friendly/PDF) (optional v1.1).
4. As a user, I can see better statuses/timeouts during generation.
5. As a user, I can later switch language (ENG) without breaking structure.

**Work (recommended next improvements)**
- **Validation gating**: block “Próximo” until required fields are filled (name/age/sex/weight/height, primary_goal, activity_level, stress_level, meal_location, meals_per_day, food_diary, bowel_frequency, bowel_consistency).
- **AI generation robustness**:
  - Increase backend/client timeouts where needed.
  - Add retries for transient Anthropic errors.
  - Optionally move generation to background job (status polling) to prevent request timeouts.
- **Plan viewer enhancements**:
  - Optional TOC + section tabs (Avaliação/Cardápio/Substituições/Orientações/Resumo).
  - Improve table responsiveness on mobile.
- **Security**:
  - Add rate limiting to plan generation.
  - Stronger JWT secret management.
- **i18n groundwork**:
  - Extract UI strings into a dictionary.
  - Keep prompt template modular to enable EN prompt later.

**Exit criteria**: All above improvements tested; no P0 bugs; E2E stable.

---

## 3) Next Actions (Immediate)
1. Run **final full E2E**: signup/login → complete all form steps → submit → generation → plan view → dashboard history.
2. Add **required-field validation gating** per step (PT-BR messages) to prevent incomplete submissions.
3. Tune **timeouts**:
   - Frontend axios timeout for generate-plan already set to 5 minutes; confirm backend/proxy limits.
4. Re-run testing agent after the validation updates.
5. Prepare release checklist (env vars, JWT secret, Anthropic key management, CORS).

---

## 4) Success Criteria
- Claude generation: output includes **ETAPA 1–5 + disclaimer**; no truncation.
- App flow: Landing → Auth → Dashboard → New assessment → Review → Generate → View plan → History.
- Multi-step UX: progress accurate; women step conditional; review shows **human-readable** values.
- Reliability: generation failures are handled gracefully with retry guidance.
- Safety: no supplement prescriptions; kcal floors respected in generated plans across varied profiles.
