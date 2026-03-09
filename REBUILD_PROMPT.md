# Prompt: Build MealTrack from Scratch

> Use this prompt to rebuild the entire MealTrack application from zero. It contains every detail needed: architecture, tech stack, database schema, API endpoints, AI prompts, UI design system, and business logic.

---

## 1. App Overview

**MealTrack** is an AI-powered nutrition planning and meal tracking platform, fully localized in **Brazilian Portuguese (pt-BR)**.

**Core features:**
1. **AI-generated personalized nutrition plans** — Users fill a comprehensive multi-step health/lifestyle questionnaire (50+ fields), optionally attach lab results and bioimpedance files (images/PDFs). Claude AI generates a detailed 7-day meal plan with nutritional analysis, macro calculations, substitution tables, and clinical guidance.
2. **AI-powered meal tracking** — Users log meals via photo or text description. Claude Vision identifies foods, estimates portions and macros, and compares against the plan's targets.
3. **Adherence dashboard** — Calendar view with daily color-coded adherence (green/yellow/red), weekly summaries, and trend charts.

**Language**: All UI text, AI prompts, error messages, and generated content are in Portuguese (pt-BR).

---

## 2. Tech Stack

### Frontend
- **React 19** (Create React App + Craco for webpack alias `@/` → `src/`)
- **React Router DOM 7** for routing
- **Tailwind CSS 3.4** + `tailwindcss-animate` for styling
- **shadcn/ui** (Radix UI primitives) — ~47 components (Button, Card, Dialog, Select, Tabs, Table, Accordion, Progress, Badge, Skeleton, ScrollArea, Tooltip, Calendar, Sonner toaster, etc.)
- **React Hook Form + Zod** for form validation
- **Axios** for HTTP requests
- **Framer Motion** for animations/transitions
- **Recharts** for charts (weekly summary)
- **react-markdown + remark-gfm** for plan rendering
- **html2pdf.js** for client-side PDF export
- **Sonner** for toast notifications
- **Lucide React** for icons
- **date-fns** for date utilities
- **Package manager**: Yarn 1.22

### Backend
- **Python FastAPI** (single `server.py` file)
- **Uvicorn** as ASGI server
- **MongoDB** (async via Motor 3.3, sync via PyMongo for background threads)
- **Anthropic SDK** (Python) for Claude API calls
- **JWT auth** (PyJWT + bcrypt for password hashing)
- **Pillow + pillow-heif** for image processing (resize, HEIC→JPEG conversion)
- **Pydantic** for request/response models

### Infrastructure
- MongoDB Atlas (cloud)
- No containerization required (runs directly)

---

## 3. Environment Variables

### Backend `.env`
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=mealtrack
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Frontend `.env`
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 4. Project Structure

```
mealtracker/
├── backend/
│   ├── server.py                    # All API routes, models, AI prompts, auth
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html               # Google Fonts (Fraunces + DM Sans)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # ~47 shadcn/ui components
│   │   │   ├── form/                # Multi-step form step components
│   │   │   │   ├── StepPersonal.js
│   │   │   │   ├── StepGoals.js
│   │   │   │   ├── StepHealth.js
│   │   │   │   ├── StepLifestyle.js
│   │   │   │   ├── StepEating.js
│   │   │   │   ├── StepDigestion.js
│   │   │   │   ├── StepWomen.js
│   │   │   │   ├── StepReview.js
│   │   │   │   └── GeneratingScreen.js
│   │   │   ├── tracker/
│   │   │   │   └── WeeklySummary.js
│   │   │   └── AppHeader.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js       # JWT auth context
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── SignupPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── NewAssessmentPage.js
│   │   │   ├── PlanViewerPage.js
│   │   │   ├── TrackerPage.js
│   │   │   └── DayDetailPage.js
│   │   ├── data/
│   │   │   └── formConstants.js     # All form field options/labels
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   └── utils.js             # cn() utility (clsx + tailwind-merge)
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css                # Tailwind + design tokens + plan styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── craco.config.js              # Webpack alias @/ → src/
│   ├── jsconfig.json
│   ├── components.json              # shadcn/ui config
│   └── package.json
└── design_guidelines.md
```

---

## 5. Design System & Styling

### Color Palette (HSL for CSS custom properties)
```css
:root {
    --background: 45 33% 97%;        /* Warm cream */
    --foreground: 120 16% 14%;       /* Dark green-ink */
    --card: 0 0% 100%;               /* White */
    --card-foreground: 120 16% 14%;
    --popover: 0 0% 100%;
    --popover-foreground: 120 16% 14%;
    --primary: 97 20% 36%;           /* Sage/olive green */
    --primary-foreground: 45 33% 97%;
    --secondary: 36 25% 90%;         /* Light warm oat */
    --secondary-foreground: 120 16% 14%;
    --muted: 36 22% 92%;
    --muted-foreground: 110 9% 36%;
    --accent: 170 25% 90%;           /* Light ocean/teal */
    --accent-foreground: 120 16% 14%;
    --border: 32 18% 86%;
    --input: 32 18% 86%;
    --ring: 170 33% 32%;             /* Ocean teal for focus */
    --destructive: 6 69% 43%;        /* Red */
    --destructive-foreground: 45 33% 97%;
    --radius: 0.85rem;
    --chart-1: 97 20% 36%;
    --chart-2: 170 33% 32%;
    --chart-3: 18 45% 58%;
    --chart-4: 40 55% 55%;
    --chart-5: 110 16% 45%;
}
```

### Named Hex Palette
- Olive: `#5A7247` | Sage: `#7F9A72` | Clay: `#C97B63` | Oat: `#E2DDD4`
- Cream: `#FAF9F5` | Ink: `#1F2A1F` | Ocean: `#2F6F73` | Sun: `#D6A14A` | Danger: `#B42318`

### Typography
- **Headings (h1-h6)**: `Fraunces` (serif) — Google Fonts weights 400, 600, 700
- **Body/UI**: `DM Sans` (sans-serif) — Google Fonts weights 400, 500, 600, 700
- Load via `<link>` in `index.html` with `preconnect`

### Design Principles
- **Bento grid layout** for dashboard (compartmentalized cards with hierarchy)
- **Warm minimal** aesthetic — earthy tones, soft shadows, cream backgrounds
- **No dark/saturated gradients** — gradients only in hero section (≤20% viewport), using muted earthy colors
- **Generous spacing** — 2-3x more than feels comfortable
- **Micro-animations** — hover lift on cards/buttons, fade+slide transitions between form steps
- **Cards**: `rounded-2xl border border-border bg-card shadow-soft`, hover: lift + shadow
- **Buttons**: `rounded-xl`, primary uses shadow-soft → shadow-lift on hover with -translate-y-1px
- **No emoji icons** — use Lucide React icons only

### Status Badges
- Generating: `bg-[rgba(214,161,74,0.18)] text-[color:rgb(122,82,26)] border border-[rgba(214,161,74,0.35)]`
- Ready: `bg-[rgba(127,154,114,0.18)] text-[color:rgb(58,84,47)] border border-[rgba(127,154,114,0.35)]`
- Error: `bg-[rgba(180,35,24,0.10)] text-[color:rgb(180,35,24)] border border-[rgba(180,35,24,0.25)]`

---

## 6. Database Schema (MongoDB)

### Collection: `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (lowercase, trimmed)",
  "password_hash": "string (bcrypt)",
  "created_at": "datetime (UTC)"
}
```

### Collection: `assessments`
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "patient_data": {
    "name": "", "age": "", "sex": "", "weight": "", "height": "",
    "waist": "", "hip": "", "weight_history": "",
    "primary_goal": "", "target_weight": "", "clinical_goal_detail": "", "goal_notes": "",
    "conditions": [], "other_conditions": "", "allergies": [], "other_allergies": "",
    "medications": "", "lab_results": "", "family_history": "",
    "activity_level": "", "exercise_detail": "", "exercise_time": "",
    "exercise_meal_timing": "", "stress_level": "", "occupation": "",
    "alcohol": "", "alcohol_frequency": "", "smoking": "",
    "wake_time": "", "sleep_time": "",
    "meal_breakfast": "", "meal_morning_snack": "", "meal_lunch": "",
    "meal_afternoon_snack": "", "meal_dinner": "", "meal_supper": "",
    "meal_location": "", "food_loves": "", "food_hates": "",
    "dietary_restrictions": [], "budget": "",
    "bowel_frequency": "", "bowel_consistency": "",
    "gi_symptoms": [], "water_intake": "", "other_drinks": "",
    "menstrual_cycle": "", "pregnant": "", "pregnancy_weeks": "",
    "breastfeeding": "", "contraceptive": "", "contraceptive_type": "",
    "hormonal_symptoms": ""
  },
  "lab_file": { "base64": "string", "media_type": "string", "name": "string" },
  "bio_file": { "base64": "string", "media_type": "string", "name": "string" },
  "created_at": "datetime",
  "status": "completed"
}
```

### Collection: `plans`
```json
{
  "_id": "ObjectId",
  "assessment_id": "string",
  "user_id": "string",
  "status": "generating | ready | error",
  "plan_markdown": "string (full markdown from Claude, 4000-6000 words)",
  "model": "claude-sonnet-4-6",
  "created_at": "datetime",
  "completed_at": "datetime",
  "input_tokens": "number",
  "output_tokens": "number",
  "error_message": "string (if error)"
}
```

### Collection: `plan_targets`
```json
{
  "_id": "ObjectId",
  "plan_id": "string",
  "user_id": "string",
  "daily_targets": {
    "kcal": 1600, "protein_g": 120, "carbs_g": 180, "fat_g": 55, "fiber_g": 25
  },
  "meals": ["meal_breakfast", "meal_morning_snack", "meal_lunch", "meal_afternoon_snack", "meal_dinner"],
  "extracted_at": "datetime"
}
```

### Collection: `meal_logs`
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "plan_id": "string",
  "date": "YYYY-MM-DD",
  "meal_type": "meal_breakfast | meal_morning_snack | meal_lunch | meal_afternoon_snack | meal_dinner | meal_supper",
  "description": "string",
  "has_photo": "boolean",
  "ai_analysis": {
    "foods": [
      { "name": "Arroz branco", "portion": "4 col. sopa", "grams": 160, "kcal": 205, "protein_g": 4, "carbs_g": 45, "fat_g": 0.4, "fiber_g": 1 }
    ],
    "totals": { "kcal": 650, "protein_g": 45, "carbs_g": 70, "fat_g": 20, "fiber_g": 8 },
    "confidence": "alta | média | baixa",
    "assumptions": "string",
    "feedback": "string",
    "suggestions": "string",
    "items_count": 1
  },
  "status": "analyzed | error",
  "created_at": "datetime"
}
```

### Collection: `form_drafts`
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "form_data": { "...all assessment fields..." },
  "current_step": 0,
  "updated_at": "datetime"
}
```

---

## 7. API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register (name, email, password) → returns JWT token + user |
| POST | `/api/auth/login` | Login (email, password) → returns JWT token + user |
| GET | `/api/auth/me` | Get current user from Bearer token |

**JWT Config**: HS256 algorithm, 7-day expiration, stored in localStorage as `mealtrack_token`.

### Assessments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/assessments` | Create assessment with patient_data + optional lab_file/bio_file |
| GET | `/api/assessments` | List user's assessments (sorted by created_at desc) |
| GET | `/api/assessments/{id}` | Get single assessment |

**Note**: If lab_file or bio_file not provided, the backend carries forward files from the most recent previous assessment.

### Plans
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/assessments/{id}/generate-plan` | Start async plan generation (returns immediately with status="generating") |
| GET | `/api/plans` | List plans (excludes plan_markdown for performance) |
| GET | `/api/plans/{id}` | Get plan with full markdown |
| POST | `/api/plans/{id}/parse-targets` | Extract macro targets from plan markdown via Claude |
| GET | `/api/active-plan` | Get latest ready plan + its targets |

**Plan generation**: Runs in a background thread (not async). Uses sync PyMongo client. If a plan already exists for the assessment and is in error/stuck state (>12 min), it deletes and retries.

### Form Drafts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/form-draft` | Get draft or fallback to last assessment's patient_data |
| POST | `/api/form-draft` | Save/upsert form draft (one per user) |
| DELETE | `/api/form-draft` | Clear draft |

### Meal Tracking
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/meal-logs` | Create meal log (photo_base64 + photo_media_type OR description). If same meal_type+date exists, merges foods. |
| GET | `/api/meal-logs?date=YYYY-MM-DD` | Get meal logs for a date |
| GET | `/api/meal-logs/calendar?year=YYYY&month=MM` | Monthly calendar with daily aggregated macros + adherence status |
| GET | `/api/meal-logs/weekly-summary?end_date=YYYY-MM-DD` | 7-day aggregation with averages |
| DELETE | `/api/meal-logs/{id}` | Delete a meal log |
| POST | `/api/meal-logs/{id}/add-item` | Add item (photo/text) to existing meal log, merge foods |

### Health Check
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/` | Returns `{"message": "MealTrack API v2", "status": "healthy"}` |

---

## 8. AI Prompts (Claude)

### 8.1 Plan Generation System Prompt

Model: `claude-sonnet-4-6` | Max tokens: 16000 | Temperature: 0.4

```
Você é uma nutricionista clínica com 15 anos de experiência, especializada em nutrição funcional e esportiva, com registro ativo no CRN (Conselho Regional de Nutricionistas) do Brasil. Você elabora planos alimentares individualizados, baseados em evidências científicas, adaptados à realidade e preferências de cada paciente.

<dados_paciente>
{PATIENT_JSON}
</dados_paciente>

## Sua tarefa

Com base nos dados do paciente acima, elabore um **plano nutricional completo e personalizado** seguindo rigorosamente as etapas abaixo.

---

## ETAPA 1 — Avaliação Inicial

### 1.1 Análise de Composição Corporal e Antropometria
1. **IMC**: Calcule IMC = peso / (altura em m)² e classifique.
2. **Relação cintura-quadril (RCQ)**: Se informados, calcule e avalie risco cardiovascular.
3. **Circunferência da cintura**: Avalie risco metabólico (>80cm mulheres, >94cm homens = risco elevado).
4. **Análise da bioimpedância/DEXA**: Se dados fornecidos, analise % gordura, massa magra vs gorda, água corporal, TMB medida vs calculada, gordura visceral, idade metabólica.
5. **Peso ideal estimado**: Faixas de peso saudável baseadas na composição corporal.
6. Apresente tudo em **tabela resumo**.

### 1.2 Cálculo do Gasto Energético
- **TMB** via Mifflin-St Jeor:
  - Homens: TMB = (10 × peso) + (6,25 × altura cm) − (5 × idade) + 5
  - Mulheres: TMB = (10 × peso) + (6,25 × altura cm) − (5 × idade) − 161
- **Fator de atividade**: Sedentário ×1.2, Leve ×1.375, Moderado ×1.55, Muito ativo ×1.725, Atleta ×1.9
- **Meta calórica**: Emagrecimento = déficit 15-25% (nunca <1200 kcal mulheres / <1500 kcal homens). Ganho de massa = superávit 10-20%. Manutenção = GET.

### 1.3 Distribuição de Macronutrientes
- Proteína: 1.2-2.0g/kg | Gordura: 0.8-1.2g/kg (min 0.5g/kg) | Carboidrato: restante
- Apresentar em tabela com gramas e percentual.

### 1.4 Análise Clínica
- Alertas nutricionais, restrições obrigatórias, interações medicamento-nutriente, ajustes para gestante/lactante.

### 1.5 Análise Detalhada da Alimentação Atual
Para cada dia do recordatório semanal:
1. Estime calorias e macros de cada refeição
2. Calcule totais diários
3. Tabela comparativa (estimado vs meta) para cada dia
4. Média semanal
5. Identifique déficits, excessos, micronutrientes deficientes, qualidade de gorduras/carboidratos/fibras
6. Pontos positivos a manter
7. Padrões problemáticos

---

## ETAPA 2 — Plano Alimentar (7 dias, segunda a domingo)

Para cada refeição, tabela com:
- Horário sugerido
- Alimentos e quantidades (medidas caseiras + gramas/ml)
- Calorias e macros (kcal | P: Xg | C: Xg | G: Xg)

Refeições adaptadas ao que o paciente informou como viáveis. Regras: respeitar alergias/intolerâncias, excluir alimentos detestados, priorizar preferidos, respeitar restrições, variar ao longo da semana, alimentos acessíveis no Brasil, adaptar ao orçamento, ≥25g fibra/dia, ≥20g proteína por refeição principal, considerar horário de treino. Total diário em tabela ao final de cada dia.

---

## ETAPA 3 — Tabela de Substituições
Equivalências por grupo alimentar, 3-4 substitutos por alimento base, respeitando restrições.

---

## ETAPA 4 — Orientações Gerais
1. **Hidratação**: Meta 35ml/kg mínimo, ajustes para atividade
2. **Orientações para sintomas digestivos** (se reportados)
3. **Orientações para condições clínicas** (por condição)
4. **Dicas de preparo e organização** (meal prep, marmitas)
5. **Orientações para comer fora** (se aplicável)

---

## ETAPA 5 — Resumo Executivo
- Meta calórica diária e distribuição de macros (tabela)
- 3-5 principais mudanças recomendadas
- Alertas importantes
- Sugestão de reavaliação

---

## Regras de formatação:
- Linguagem acessível e acolhedora — o paciente lê diretamente
- Tratar pelo nome informado
- Evitar jargão sem explicação
- Usar **tabelas** para cardápio, substituições, cálculos
- Emojis com moderação (apenas títulos de seção)
- Markdown com ## e ### para estrutura
- **Negrito** para informações importantes
- Linhas horizontais (---) para separar seções
- 4.000-6.000 palavras

## Regras de segurança:
- Disclaimer claro: não substitui acompanhamento profissional presencial
- Reforçar acompanhamento médico para condições graves
- Nunca recomendar suplementação específica
- Nunca prescrever <1200 kcal (mulheres) ou <1500 kcal (homens)
```

**User message**: `"Gere meu plano nutricional completo com base nos dados informados."` (+ optional: `"Considere os documentos/imagens anexados na sua análise."`)

**File handling**: Images processed through PIL (resize to max 1500px, convert to JPEG, compress to <5MB base64). PDFs sent as document blocks. If files cause BadRequestError, retry without images, then without all files.

### 8.2 Target Extraction Prompt

Model: `claude-sonnet-4-6` | Max tokens: 500 | Temperature: 0

```
Analise o plano nutricional abaixo e extraia as metas diárias de macronutrientes.

Retorne APENAS um JSON válido (sem markdown, sem ```), com esta estrutura exata:
{
  "daily_targets": {
    "kcal": 1600,
    "protein_g": 120,
    "carbs_g": 180,
    "fat_g": 55,
    "fiber_g": 25
  },
  "meals": ["meal_breakfast", "meal_morning_snack", "meal_lunch", "meal_afternoon_snack", "meal_dinner", "meal_supper"]
}

Extraia os valores da meta calórica e distribuição de macros definidos na ETAPA 1 ou no Resumo Executivo do plano. Os meals devem ser apenas os que aparecem no cardápio.

PLANO:
```

Sends first 8000 chars of plan_markdown. Fallback defaults if parsing fails: `{kcal: 1800, protein_g: 100, carbs_g: 200, fat_g: 60, fiber_g: 25}`.

### 8.3 Meal Analysis Prompt

Model: `claude-sonnet-4-6` | Max tokens: 2000 | Temperature: 0.2

```
Você é um nutricionista analisando uma refeição. Analise a imagem/descrição e identifique TODOS os alimentos visíveis, estimando porções e valores nutricionais.

Retorne APENAS um JSON válido (sem markdown, sem ```), com esta estrutura:
{
  "foods": [
    {"name": "Arroz branco", "portion": "4 colheres de sopa", "grams": 160, "kcal": 205, "protein_g": 4, "carbs_g": 45, "fat_g": 0.4, "fiber_g": 1},
    {"name": "Feijão carioca", "portion": "1 concha", "grams": 85, "kcal": 77, "protein_g": 5, "carbs_g": 14, "fat_g": 0.5, "fiber_g": 5}
  ],
  "totals": {"kcal": 650, "protein_g": 45, "carbs_g": 70, "fat_g": 20, "fiber_g": 8},
  "confidence": "alta",
  "assumptions": "Porções estimadas visualmente. Temperos e óleos de preparo estimados.",
  "feedback": "",
  "suggestions": ""
}

REGRAS:
- Estime porções com base no tamanho visual (se foto) ou descrição.
- Use tabela TACO/IBGE como referência para valores nutricionais de alimentos brasileiros.
- Inclua óleos de preparo estimados se aplicável.
- O campo "confidence" pode ser "alta", "média" ou "baixa".
- feedback e suggestions serão preenchidos depois pelo sistema.
```

Appended to prompt: meal type label, date, and description (if provided). If no photo: `"Não há foto. Analise baseado apenas na descrição textual."`

---

## 9. Frontend Routes

```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/app" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/app/new" element={<ProtectedRoute><NewAssessmentPage /></ProtectedRoute>} />
  <Route path="/app/plans/:planId" element={<ProtectedRoute><PlanViewerPage /></ProtectedRoute>} />
  <Route path="/app/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
  <Route path="/app/tracker/:date" element={<ProtectedRoute><DayDetailPage /></ProtectedRoute>} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 10. Authentication (AuthContext)

- JWT token stored in `localStorage` as `mealtrack_token`
- React Context provides: `user`, `token`, `loading`, `signup()`, `login()`, `logout()`, `getAuthHeaders()`, `API` (base URL)
- Auto-check on mount: calls `GET /api/auth/me` with stored token
- `ProtectedRoute` wrapper redirects to `/login` if not authenticated
- Backend: bcrypt password hashing, HS256 JWT with `{user_id, email, exp}` claims, 7-day expiry

---

## 11. Page Descriptions

### LandingPage (`/`)
Public page with:
- Hero section with CTA "Começar agora" (only section allowed to have gradient background)
- "Como funciona" — 3 steps in bento cards
- "O que você recebe" — 5 plan sections in tabs
- FAQ in accordion
- Minimal footer

### LoginPage (`/login`) & SignupPage (`/signup`)
- Split-screen desktop (left: benefits text, right: form card)
- Single column on mobile
- Cream background + white card + soft shadow

### DashboardPage (`/app`)
- Bento grid layout (`grid-cols-1 md:grid-cols-12 gap-4`)
- Card "Novo Plano" CTA (md:col-span-7) — summary + "Novo questionário" button
- Card "Último plano" (md:col-span-5) — status badge, date, "Ver plano" button
- Card "Histórico" (md:col-span-12) — table of past plans with status badges
- Tracker CTA card
- If a plan is "generating", show generating state with animated messages

### NewAssessmentPage (`/app/new`)
8-step multi-step form:

1. **StepPersonal** — name, age, sex, weight, height, waist, hip, weight_history, bioimpedance file upload
2. **StepGoals** — primary_goal (6 options), target_weight, clinical_goal_detail (conditional), goal_notes
3. **StepHealth** — conditions (multi-select from 18 common + other), allergies (multi-select from 10 + other), medications, lab_results text, lab file upload, family_history
4. **StepLifestyle** — wake_time, sleep_time, activity_level, exercise_detail, exercise_time, exercise_meal_timing, stress_level, occupation, alcohol (+frequency), smoking
5. **StepEating** — Weekly meal recall for each of 6 meals (breakfast, morning snack, lunch, afternoon snack, dinner, supper) with day-by-day textareas. Also: meal_location, food_loves, food_hates, dietary_restrictions, budget
6. **StepDigestion** — bowel_frequency, bowel_consistency, gi_symptoms (multi-select), water_intake, other_drinks
7. **StepWomen** — Conditional (only if sex=Feminino): menstrual_cycle, pregnant, pregnancy_weeks, breastfeeding, contraceptive, contraceptive_type, hormonal_symptoms
8. **StepReview** — Read-only summary of all fields organized by section

Features:
- Sticky header with progress bar ("Passo X de 8") + breadcrumb
- Sticky footer with Anterior/Próximo/Salvar e sair buttons
- Auto-save draft (debounced 2s) — excludes base64 file data
- On load: check for draft → fallback to last assessment → empty form
- Form state managed by React Hook Form + Zod validation
- On submit: create assessment → navigate to dashboard → trigger plan generation

### PlanViewerPage (`/app/plans/:planId`)
- Polls plan status until "ready"
- Renders plan_markdown with react-markdown + remark-gfm
- Custom markdown components mapping to shadcn Table styles
- Copy to clipboard button
- PDF export via html2pdf.js
- Plan content styled with `.plan-content` CSS class (see index.css)
- Print-optimized styles

### TrackerPage (`/app/tracker`)
- Monthly calendar grid showing days with logged meals
- Each day shows color-coded adherence dot (green/yellow/red based on kcal ratio to target)
- Click day → navigate to `/app/tracker/:date`
- Month navigation (prev/next)
- Daily target macros display
- WeeklySummary component with Recharts bar charts

### DayDetailPage (`/app/tracker/:date`)
- Shows all meal logs for the selected date
- Plan targets for reference
- Macro comparison (actual vs target)
- "Add meal" dialog — select meal_type, then photo upload OR text description
- Each logged meal shows: foods list, per-food macros, totals, confidence, feedback, suggestions
- Delete meal option

---

## 12. Form Constants

All form field options defined in `formConstants.js`:

```javascript
STEPS = [
  { id: 'personal', label: 'Sobre Você', icon: 'User' },
  { id: 'goals', label: 'Seu Objetivo', icon: 'Target' },
  { id: 'health', label: 'Saúde', icon: 'Heart' },
  { id: 'lifestyle', label: 'Rotina', icon: 'Clock' },
  { id: 'eating', label: 'Alimentação', icon: 'UtensilsCrossed' },
  { id: 'digestion', label: 'Digestão', icon: 'Droplets' },
  { id: 'women', label: 'Saúde Feminina', icon: 'Flower2' },
  { id: 'review', label: 'Resumo', icon: 'ClipboardCheck' },
];

GOALS = [
  { value: 'lose_weight', label: 'Emagrecer', desc: 'Perder peso com saúde' },
  { value: 'gain_muscle', label: 'Ganhar massa', desc: 'Hipertrofia muscular' },
  { value: 'maintain', label: 'Manter peso', desc: 'Equilíbrio e saúde' },
  { value: 'performance', label: 'Performance', desc: 'Rendimento esportivo' },
  { value: 'health', label: 'Saúde geral', desc: 'Comer melhor' },
  { value: 'clinical', label: 'Controle clínico', desc: 'Condição específica' },
];

ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentário', desc: 'Sem exercício regular' },
  { value: 'light', label: 'Levemente ativo', desc: '1-3x por semana' },
  { value: 'moderate', label: 'Moderado', desc: '3-5x por semana' },
  { value: 'very_active', label: 'Muito ativo', desc: '6-7x por semana' },
  { value: 'athlete', label: 'Atleta', desc: 'Treino intenso diário' },
];

STRESS_LEVELS = [
  { value: 'low', label: 'Baixo', desc: 'Tranquilo no dia a dia' },
  { value: 'moderate', label: 'Moderado', desc: 'Estresse normal' },
  { value: 'high', label: 'Alto', desc: 'Bastante estressado' },
  { value: 'very_high', label: 'Muito alto', desc: 'Estresse constante' },
];

COMMON_CONDITIONS = [
  'Diabetes tipo 1', 'Diabetes tipo 2', 'Pré-diabetes',
  'Hipertensão', 'Colesterol alto', 'Triglicerídeos alto',
  'Hipotireoidismo', 'Hipertireoidismo', 'SOP',
  'Gastrite', 'Refluxo', 'Síndrome do intestino irritável',
  'Doença celíaca', 'Doença de Crohn', 'Anemia',
  'Depressão', 'Ansiedade', 'Insônia',
];

COMMON_ALLERGIES = [
  'Lactose', 'Glúten', 'Ovo', 'Amendoim',
  'Castanhas', 'Soja', 'Frutos do mar', 'Peixe',
  'Trigo', 'Milho',
];

MEAL_DEFS = [
  { key: 'meal_breakfast', label: 'Café da manhã', icon: 'Coffee', placeholder: 'Ex: 1 xícara de café com leite, 2 fatias de pão integral com queijo branco, 1 banana' },
  { key: 'meal_morning_snack', label: 'Lanche da manhã', icon: 'Apple', placeholder: 'Ex: 1 maçã, 5 castanhas de caju' },
  { key: 'meal_lunch', label: 'Almoço', icon: 'UtensilsCrossed', placeholder: 'Ex: 4 col. sopa arroz, 1 concha feijão, 120g frango grelhado, salada' },
  { key: 'meal_afternoon_snack', label: 'Lanche da tarde', icon: 'Cup', placeholder: 'Ex: 1 iogurte natural, 1 col. sopa granola, 1 fruta' },
  { key: 'meal_dinner', label: 'Jantar', icon: 'Moon', placeholder: 'Ex: Sopa de legumes com frango desfiado, 1 fatia de pão' },
  { key: 'meal_supper', label: 'Ceia', icon: 'Star', placeholder: 'Ex: 1 copo de leite morno, 3 biscoitos integrais' },
];

BOWEL_FREQUENCY, BOWEL_CONSISTENCY, GI_SYMPTOMS, DIETARY_RESTRICTIONS,
EXERCISE_MEAL_TIMING, MEAL_LOCATIONS, WEEKDAYS, REVIEW_SECTIONS, FIELD_LABELS
// (see full definitions in section 12 constants above)
```

---

## 13. Key Business Logic

### Plan Generation Pipeline
1. User fills 8-step form → submit creates assessment
2. User clicks "Generate plan" → POST creates plan doc with `status: "generating"`
3. Background thread launches:
   - Loads assessment data + files
   - Processes images through PIL (resize, convert HEIC→JPEG, compress)
   - Builds system prompt with `{PATIENT_JSON}` replaced
   - Calls Claude with patient JSON + image/PDF blocks
   - Graceful fallback: if files cause error → retry without images → retry text-only
   - Stores markdown + token usage, sets `status: "ready"`
4. Frontend polls plan status until ready
5. User views rendered markdown, can copy or export PDF

### Meal Logging & Merging
1. User selects meal type + provides photo or text description
2. Backend calls Claude for food identification → returns JSON with foods, totals, confidence
3. **Merge logic**: If a meal_log already exists for same `user_id + date + meal_type`, merge foods arrays and recalculate totals (don't create duplicate)
4. **Feedback computation**: Compare meal totals vs per-meal targets (daily target ÷ number of planned meals). Generate Portuguese feedback strings.
5. Also supports `add-item` endpoint for adding to existing log

### Adherence Scoring
- Daily: aggregate all meal logs → compare kcal vs target
- Green: 85-115% of target | Yellow: 70-130% | Red: outside yellow range

### Form Draft Auto-Save
- Debounced 2-second save after field changes
- Excludes base64 file data (files kept in browser memory only)
- On load: draft → last assessment → empty form
- One draft per user (upsert)

---

## 14. Markdown Plan Viewer Styles

The generated plan is rendered in a `.plan-content` wrapper with these styles:

```css
.plan-content { text-size: sm/base; line-height: 1.8; }
.plan-content h1 { text-2xl/3xl, font-semibold, mt-10, mb-4, pb-2, border-b, font: Fraunces }
.plan-content h2 { text-xl/2xl, font-semibold, mt-10, mb-4, pb-2, border-b/50, color: primary }
.plan-content h3 { text-lg/xl, font-semibold, mt-8, mb-3, font: Fraunces }
.plan-content table { w-full, border-collapse, my-6, rounded-lg, overflow-hidden }
.plan-content thead { bg-primary/10 }
.plan-content th { border, px-3, py-2.5, text-xs, uppercase, tracking-wider, color: primary }
.plan-content td { border, px-3, py-2, text-sm }
.plan-content tbody tr:nth-child(even) { bg-muted/20 }
.plan-content tbody tr:hover { bg-muted/40 with transition }
.plan-content blockquote { border-l-4 primary/40, pl-4, italic, bg-muted/30, rounded-r-lg }
```

Print styles optimize for PDF with page-break rules.

---

## 15. Export Conventions

- **Components**: Named exports (`export const ComponentName = ...`)
- **Pages**: Default exports (`export default function PageName() {...}`)
- **shadcn/ui**: Import from `@/components/ui/component-name`
- **Path alias**: `@/` maps to `src/` via Craco + jsconfig

---

## 16. Backend Startup

```python
# server.py runs as:
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload

# CORS middleware added last, allows configured origins
# MongoDB connections: async (Motor) for route handlers, sync (PyMongo) for background threads
# Anthropic client initialized at module level
```

---

## 17. Key Python Dependencies

```
fastapi==0.110.1
uvicorn==0.25.0
motor==3.3.1
pymongo==4.5.0
anthropic==0.79.0
pydantic==2.12.5
PyJWT==2.11.0
bcrypt==4.1.3
pillow==12.1.0
pillow_heif==1.2.0
python-dotenv==1.2.1
python-dateutil==2.9.0
```

---

## 18. Key Frontend Dependencies

```json
{
  "react": "^19.0.0",
  "react-router-dom": "^7.5.1",
  "axios": "^1.8.4",
  "react-hook-form": "^7.56.2",
  "@hookform/resolvers": "^5.0.1",
  "zod": "^3.24.4",
  "framer-motion": "^12.34.0",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "recharts": "^3.6.0",
  "html2pdf.js": "^0.14.0",
  "sonner": "^2.0.3",
  "lucide-react": "^0.507.0",
  "date-fns": "^4.1.0",
  "tailwindcss": "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.2.0",
  "@craco/craco": "^7.1.0"
}
```

Plus ~25 `@radix-ui/react-*` packages for shadcn/ui components.
