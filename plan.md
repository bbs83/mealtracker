# MealTrack — Updated plan.md (Tracker Evolution)

## 1) Objectives
- Keep the **plan generation workflow** production-ready: **Patient JSON → Claude Opus 4.6 → full nutrition plan (ETAPA 1–5) in Markdown**.
- Evolve MealTrack into a **daily meal tracker** (not only a plan generator):
  - Log meals via **photo OR text**.
  - Provide **calendar-based adherence** and **plan vs actual** comparisons.
  - Provide **real-time AI feedback** and **weekly trends**.
- Ensure **per-user persistence** in MongoDB across: users, assessments, plans, plan targets, meal logs.
- Maintain safety and UX: disclaimers, kcal floors, no supplement prescriptions, clear explanations for estimates.
- Ensure the plan output is **more professional**: improved markdown formatting + strong table usage + better CSS rendering.

---

## 2) Implementation Steps (Phases)

### Phase 1 — Core POC: Claude plan generation ✅ COMPLETED
**What was proven**
- Prompt + patient JSON generates long-form plan with ETAPA 1–5 + disclaimer.

---

### Phase 2 — V1 App (Landing + Auth + Intake + Plan + History) ✅ COMPLETED
**Delivered**
- Landing, signup/login (JWT), dashboard, multi-step intake, plan generation, plan viewer, history.

---

### Phase 3 — Quality upgrades and UX improvements ✅ COMPLETED
**Implemented (recent)**
- Plan generation model updated to **Claude Opus 4.6**.
- Photo/PDF lab upload with multimodal support.
- Weekly recall + meal toggles.
- Generation loading improved: **up to 8 minutes**, sequential (non-looping) progress messages, elapsed timer, 10-minute client timeout.
- Professional plan formatting (CSS improvements for headings/tables/print).
- PT-BR accent corrections across UI.
- Plan export: **PDF**.

---

### Phase 4 — MealTrack Tracker (Calendar + Meal Logging + AI Analysis + Plan Comparison) 🔜 NEXT (Implement all at once)

#### 4.1 Product scope (user stories)
1. As a user, I can open a **monthly calendar** showing each day’s adherence status.
2. As a user, I can log a meal by **photo** OR **text description**.
3. As a user, I can review the AI’s interpretation and **edit/confirm** items before saving.
4. As a user, I can see a **daily view** comparing my consumed macros vs the plan targets.
5. As a user, I can see **meal-by-meal feedback** (above/below plan) and a suggested action.
6. As a user, I can see a **weekly summary** with trends and adherence.

#### 4.2 Model strategy (cost-optimized)
- **Plan generation**: `claude-opus-4-6` (high quality, long output).
- **Meal/photo analysis**: `claude-4-sonnet-20250514` (or latest Sonnet w/ vision) for best cost/quality.
  - Alternative ultra-low-cost option: `claude-haiku-4-5-20251001` (test quality before committing).

#### 4.3 Backend architecture (FastAPI + MongoDB)
**New collections**
- `meal_logs`:
  - `{ _id, user_id, plan_id, date, meal_type, photo_base64?, photo_media_type?, description?, ai_analysis: { foods:[{name, portion, grams_ml?, kcal, protein_g, carbs_g, fat_g, fiber_g}], totals:{kcal, protein_g, carbs_g, fat_g, fiber_g}, confidence, assumptions, feedback, suggestions }, status, created_at, updated_at }`
- `plan_targets`:
  - `{ _id, user_id, plan_id, extracted_at, daily_targets:{kcal, protein_g, carbs_g, fat_g, fiber_g}, meal_structure:[...], notes }`

**New endpoints**
- `GET /api/active-plan` → returns latest ready plan + parsed targets (or triggers parsing).
- `POST /api/plans/{id}/parse-targets` → extract daily macro targets from plan markdown (store in `plan_targets`).
- `POST /api/meal-logs` → create a meal log:
  - Accepts `{ date, meal_type, photo?, description? }`.
  - Triggers analysis with Sonnet Vision.
  - Stores structured foods + totals + feedback.
- `GET /api/meal-logs?date=YYYY-MM-DD` → get logs for a day.
- `GET /api/meal-logs/calendar?year=YYYY&month=MM` → monthly adherence summary.
- `GET /api/meal-logs/weekly-summary?end=YYYY-MM-DD` → 7-day aggregation.

**Core backend services**
- `PlanTargetExtractor`:
  - Uses LLM to parse plan markdown into `daily_targets`.
  - Heuristics + fallback if parsing fails.
- `MealAnalyzer`:
  - Input: image OR text.
  - Output: structured foods + portion estimates + macro totals + confidence + assumptions.
  - Always returns **editable** items.
- `Comparator`:
  - Computes meal delta + daily delta vs targets.
  - Produces short PT-BR feedback and suggestions.

**Guardrails**
- Always show “estimativas” and confidence.
- Avoid medical claims; advise professional consultation.

#### 4.4 Frontend architecture (React + shadcn/ui)
**New routes/pages**
- `/app/tracker`:
  - Monthly calendar
  - Quick add meal
  - Weekly summary preview
- `/app/tracker/:date`:
  - Daily view: plan targets vs actual totals
  - List of meals + AI analysis cards
  - Add/edit meal logs

**Key components**
- `CalendarView`:
  - Month grid with day badges (green/yellow/red/gray).
  - Click day → go to daily detail.
- `DailySummaryHeader`:
  - Macro progress bars vs targets.
  - Adherence score.
- `MealLogDialog`:
  - Tabs: Photo upload | Text input.
  - Meal type selector (breakfast/lunch/etc).
  - Submit → analysis state.
- `MealAnalysisCard`:
  - Displays identified foods + macros.
  - Edit UI (inline editable list).
- `WeeklySummary`:
  - Trends charts (recharts) and adherence stats.

**UX considerations**
- Make logging “one-tap”: open dialog, photo, confirm.
- Persist drafts in localStorage.
- Offline-friendly capture (upload when online) as vNext.

#### 4.5 Testing
- Unit tests for:
  - meal analysis response schema
  - comparator calculations
  - plan target extraction
- E2E tests:
  - generate plan → parse targets → log meal via text → calendar updates → daily deltas update.

**Exit criteria**
- User can track meals daily and see plan adherence by day/week.
- Stable parsing of plan targets for most generated plans.
- Meal analysis works for both photo and text with acceptable latency/cost.

---

## 3) Next Actions (Immediate)
1. Implement `plan_targets` extraction endpoint and storage.
2. Implement `meal_logs` CRUD + analysis pipeline (Sonnet Vision) for photo/text.
3. Build Tracker UI: `/app/tracker` calendar + `/app/tracker/:date` daily view.
4. Implement macro comparison + adherence scoring.
5. Add weekly summary charts.
6. Add caching + rate limiting for meal analysis.
7. Run full E2E.

---

## 4) Success Criteria
- Plan generation remains stable on **Opus 4.6**.
- Meal tracking is frictionless:
  - photo OR text logging
  - daily and weekly comparisons
  - actionable feedback
- Calendar and daily views feel fast and reliable.
- Cost is controlled by using **Sonnet** for meal analysis and reserving **Opus** for long plan generation.
- All data is user-scoped and persisted.
