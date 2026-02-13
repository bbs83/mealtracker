from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import json
import anthropic

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'mealtrack')]

# Anthropic client
anthropicClient = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', ''))

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ HELPERS ============
def serialize_doc(doc):
    """Convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == '_id':
            result['id'] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else v for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result

# ============ MODELS ============
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class LabFile(BaseModel):
    base64: str
    media_type: str
    name: str = "exames"

class AssessmentCreate(BaseModel):
    patient_data: Dict[str, Any]
    lab_file: Optional[LabFile] = None
    bio_file: Optional[LabFile] = None

class GeneratePlanRequest(BaseModel):
    pass

# ============ PROMPT TEMPLATE ============
PROMPT_TEMPLATE = """Você é uma nutricionista clínica com 15 anos de experiência, especializada em nutrição funcional e esportiva, com registro ativo no CRN (Conselho Regional de Nutricionistas) do Brasil. Você elabora planos alimentares individualizados, baseados em evidências científicas, adaptados à realidade e preferências de cada paciente.

<dados_paciente>
{PATIENT_JSON}
</dados_paciente>

## Sua tarefa

Com base nos dados do paciente acima, elabore um **plano nutricional completo e personalizado** seguindo rigorosamente as etapas abaixo.

---

## ETAPA 1 — Avaliação Inicial

Antes de montar o plano, faça os cálculos e análises necessários. Apresente-os de forma clara e visualmente organizada.

### 1.1 Análise de Composição Corporal e Antropometria

Antes dos cálculos energéticos, faça uma análise completa da composição corporal do paciente:

1. **IMC (Índice de Massa Corporal)**: Calcule IMC = peso / (altura em m)² e classifique (abaixo do peso, eutrófico, sobrepeso, obesidade grau I/II/III).
2. **Relação cintura-quadril (RCQ)**: Se cintura e quadril foram informados, calcule RCQ e avalie risco cardiovascular.
3. **Circunferência da cintura**: Avalie risco metabólico com base nos pontos de corte (>80cm mulheres, >94cm homens = risco elevado).
4. **Análise da bioimpedância/DEXA**: Se dados de bioimpedância foram fornecidos (arquivo ou texto), analise:
   - Percentual de gordura corporal e classificação (essencial, atleta, fitness, aceitável, obesidade)
   - Massa magra vs massa gorda
   - Água corporal total
   - Taxa metabólica basal medida vs calculada (comparar se disponível)
   - Gordura visceral
   - Idade metabólica vs idade cronológica
5. **Peso ideal estimado**: Com base na composição corporal, estime faixas de peso saudável.
6. Apresente tudo em uma **tabela resumo** clara e visualmente organizada.

### 1.2 Cálculo do Gasto Energético
- Calcule a **Taxa Metabólica Basal (TMB)** usando a fórmula de Mifflin-St Jeor:
  - Homens: TMB = (10 × peso em kg) + (6,25 × altura em cm) − (5 × idade) + 5
  - Mulheres: TMB = (10 × peso em kg) + (6,25 × altura em cm) − (5 × idade) − 161
- Aplique o **fator de atividade** para obter o Gasto Energético Total Diário (GET):
  - Sedentário: TMB × 1,2
  - Levemente ativo: TMB × 1,375
  - Moderadamente ativo: TMB × 1,55
  - Muito ativo: TMB × 1,725
  - Atleta: TMB × 1,9
- Defina a **meta calórica diária** com base no objetivo:
  - Emagrecimento: déficit de 15-25% sobre o GET (nunca abaixo de 1200 kcal para mulheres ou 1500 kcal para homens)
  - Ganho de massa: superávit de 10-20% sobre o GET
  - Manutenção: GET
  - Para outros objetivos, ajuste conforme indicado clinicamente
- Apresente os cálculos numa tabela resumo clara.

### 1.3 Distribuição de Macronutrientes
Defina a distribuição de macros (proteínas, carboidratos, gorduras) em gramas e percentual, justificando a escolha com base no objetivo, nível de atividade e condições clínicas do paciente. Apresente numa tabela.

Diretrizes gerais (ajuste conforme contexto clínico):
- **Proteína**: 1,2-2,0g/kg de peso corporal
- **Gordura**: 0,8-1,2g/kg (nunca abaixo de 0,5g/kg)
- **Carboidrato**: restante das calorias após proteína e gordura

### 1.4 Análise Clínica
- Identifique **alertas nutricionais** relevantes.
- Liste **restrições obrigatórias**.
- Considere interações medicamento-nutriente relevantes.
- Se o paciente for gestante ou lactante, ajuste as necessidades.

### 1.5 Análise Detalhada da Alimentação Atual

**IMPORTANTE**: Faça uma análise APROFUNDADA e DETALHADA do recordatório alimentar semanal do paciente. Para cada dia informado:

1. **Estime as calorias e macronutrientes** de cada refeição relatada (proteínas, carboidratos, gorduras, fibras).
2. **Calcule os totais diários estimados** para cada dia da semana.
3. **Monte uma tabela comparativa** mostrando:
   - Calorias estimadas por dia vs. meta calórica
   - Proteína estimada por dia vs. meta
   - Carboidrato estimado por dia vs. meta
   - Gordura estimada por dia vs. meta
   - Fibra estimada por dia vs. meta (25g/dia)
4. **Calcule a média semanal** de cada nutriente.
5. **Identifique claramente**:
   - Déficits nutricionais específicos (ex: "déficit médio de 40g de proteína/dia")
   - Excessos nutricionais (ex: "excesso médio de 30g de carboidrato refinado")
   - Micronutrientes possivelmente deficientes com base nos alimentos consumidos
   - Qualidade das gorduras consumidas (saturadas vs. insaturadas)
   - Ingestão de fibras e qualidade dos carboidratos
6. **Pontos positivos** a manter na alimentação atual.
7. **Padrões problemáticos** identificados (pular refeições, excesso de ultraprocessados, baixa ingestão de proteínas, etc.).

Considere o orçamento, quem prepara as refeições e a rotina de horários ao planejar.

---

## ETAPA 2 — Plano Alimentar

Monte um cardápio detalhado para **7 dias (segunda a domingo)**.

### Estrutura de cada dia:
Para cada refeição, apresente numa **tabela organizada**:
- **Horário sugerido**
- **Alimentos e quantidades** em medidas caseiras E em gramas/ml entre parênteses
- **Calorias e macros da refeição** (kcal | P: Xg | C: Xg | G: Xg)

### Refeições do dia:
Adapte o número de refeições ao que o paciente informou como viáveis (campos meal_breakfast, meal_morning_snack, meal_lunch, meal_afternoon_snack, meal_dinner, meal_supper).

### Regras do cardápio:
- Respeite todas as alergias e intolerâncias
- Exclua alimentos que o paciente disse detestar
- Priorize alimentos que o paciente disse gostar
- Respeite restrições alimentares
- Varie os alimentos ao longo da semana
- Use alimentos acessíveis e comuns no Brasil
- Adapte ao orçamento informado
- Inclua pelo menos 25g de fibra por dia
- Distribua a ingestão proteica ao longo do dia (mínimo 20g por refeição principal)
- Considere o horário do treino e a preferência de treinar em jejum ou após refeição, se informado
- Ao final de cada dia, apresente o **total diário** numa tabela (kcal | P | C | G | Fibra)

---

## ETAPA 3 — Tabela de Substituições

Crie uma tabela de equivalências organizada por grupo alimentar com pelo menos 3-4 substitutos por alimento base, respeitando as restrições do paciente. Use formato de tabela limpo e organizado.

---

## ETAPA 4 — Orientações Gerais

Apresente orientações práticas e personalizadas, organizadas com subtítulos claros:

1. **Hidratação**: Meta diária de água com base no peso (mínimo 35ml/kg) e ajustes para atividade física. Compare com o consumo atual informado.
2. **Orientações para sintomas digestivos**: Se o paciente reportou sintomas GI, inclua orientações específicas.
3. **Orientações para condições clínicas**: Dicas alimentares específicas para cada condição diagnosticada.
4. **Dicas de preparo e organização**: Sugestões de meal prep, organização semanal, como montar marmitas.
5. **Orientações para comer fora**: Se aplicável, como fazer boas escolhas em restaurantes.

---

## ETAPA 5 — Resumo Executivo

Ao final, apresente um resumo visual e conciso com:

- Meta calórica diária e distribuição de macros (em tabela)
- 3-5 principais mudanças recomendadas em relação à alimentação atual
- Alertas importantes (clínicos, interações, deficiências a monitorar)
- Sugestão de reavaliação (quando o paciente deve retornar / ajustar o plano)

---

## Regras de formatação do output:
- Use linguagem acessível e acolhedora — o paciente vai ler diretamente.
- Trate o paciente pelo nome informado.
- Evite jargão técnico sem explicação. Quando usar termos técnicos, explique entre parênteses.
- Use **tabelas** para o cardápio, substituições, cálculos e comparativos — tabelas tornam o documento mais profissional e fácil de ler.
- Use emojis com moderação (apenas em títulos de seção) para tornar o documento mais visual.
- Estruture com títulos e subtítulos claros (markdown com ## e ###).
- Use **negrito** para destacar informações importantes.
- Use linhas horizontais (---) para separar seções.
- O documento deve ter entre 4.000-6.000 palavras para ser completo e detalhado.

## Regras de segurança:
- Este plano é uma ferramenta de apoio e NÃO substitui o acompanhamento profissional presencial.
- Inclua um disclaimer claro e visível no início do documento informando isso.
- Se os dados indicarem condições clínicas graves, reforce a necessidade de acompanhamento médico e nutricional presencial.
- Nunca recomende suplementação específica — limite-se a sugerir que o paciente converse com seu nutricionista ou médico.
- Não prescreva dietas abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)."""

# ============ AUTH ROUTES ============
import bcrypt
import jwt

JWT_SECRET = os.environ.get('JWT_SECRET', 'mealtrack-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

from fastapi import Request

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Não autorizado")
    token = auth_header.split(' ')[1]
    return verify_token(token)

@api_router.post("/auth/signup")
async def signup(user: UserCreate):
    existing = await db.users.find_one({"email": user.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_doc = {
        "name": user.name.strip(),
        "email": user.email.lower().strip(),
        "password_hash": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id, user_doc['email'])
    return {"token": token, "user": {"id": user_id, "name": user_doc['name'], "email": user_doc['email']}}

@api_router.post("/auth/login")
async def login(creds: UserLogin):
    user = await db.users.find_one({"email": creds.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if not bcrypt.checkpw(creds.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    user_id = str(user['_id'])
    token = create_token(user_id, user['email'])
    return {"token": token, "user": {"id": user_id, "name": user['name'], "email": user['email']}}

@api_router.get("/auth/me")
async def get_me(request: Request):
    payload = await get_current_user(request)
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(payload['user_id'])})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"user": {"id": str(user['_id']), "name": user['name'], "email": user['email']}}

# ============ ASSESSMENT ROUTES ============
@api_router.post("/assessments")
async def create_assessment(data: AssessmentCreate, request: Request):
    payload = await get_current_user(request)
    assessment_doc = {
        "user_id": payload['user_id'],
        "patient_data": data.patient_data,
        "lab_file": data.lab_file.model_dump() if data.lab_file else None,
        "bio_file": data.bio_file.model_dump() if data.bio_file else None,
        "created_at": datetime.now(timezone.utc),
        "status": "completed"
    }
    result = await db.assessments.insert_one(assessment_doc)
    assessment_doc['_id'] = result.inserted_id
    return serialize_doc(assessment_doc)

@api_router.get("/assessments")
async def list_assessments(request: Request):
    payload = await get_current_user(request)
    assessments = await db.assessments.find(
        {"user_id": payload['user_id']}
    ).sort("created_at", -1).to_list(100)
    return [serialize_doc(a) for a in assessments]

@api_router.get("/assessments/{assessment_id}")
async def get_assessment(assessment_id: str, request: Request):
    payload = await get_current_user(request)
    from bson import ObjectId
    try:
        assessment = await db.assessments.find_one({"_id": ObjectId(assessment_id), "user_id": payload['user_id']})
    except Exception:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    if not assessment:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    return serialize_doc(assessment)

# ============ PLAN GENERATION ============
@api_router.post("/assessments/{assessment_id}/generate-plan")
async def generate_plan(assessment_id: str, request: Request):
    payload = await get_current_user(request)
    from bson import ObjectId
    try:
        assessment = await db.assessments.find_one({"_id": ObjectId(assessment_id), "user_id": payload['user_id']})
    except Exception:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    if not assessment:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    # Check if plan already exists for this assessment - if error, delete and retry
    existing_plan = await db.plans.find_one({"assessment_id": assessment_id})
    if existing_plan:
        if existing_plan.get('status') == 'error':
            await db.plans.delete_one({"_id": existing_plan['_id']})
            logger.info(f"Deleted failed plan for assessment {assessment_id}, retrying")
        else:
            return serialize_doc(existing_plan)
    
    # Create plan doc with generating status
    plan_doc = {
        "assessment_id": assessment_id,
        "user_id": payload['user_id'],
        "status": "generating",
        "plan_markdown": "",
        "model": "claude-opus-4-6",
        "created_at": datetime.now(timezone.utc),
        "completed_at": None
    }
    result = await db.plans.insert_one(plan_doc)
    plan_id = str(result.inserted_id)
    plan_doc['_id'] = result.inserted_id
    
    # Generate plan synchronously (frontend will show loading)
    try:
        patient_json = json.dumps(assessment['patient_data'], ensure_ascii=False, indent=2)
        system_prompt = PROMPT_TEMPLATE.replace('{PATIENT_JSON}', patient_json)
        
        logger.info(f"Generating nutrition plan for assessment {assessment_id}")
        
        # Supported formats for Claude Vision
        SUPPORTED_IMG = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
        MAX_B64 = 8_000_000  # ~6MB file
        
        def add_file_blocks(blocks, file_data, label):
            if not file_data or not file_data.get('base64') or not file_data.get('media_type'):
                return
            mt = file_data['media_type']
            b64 = file_data['base64']
            if len(b64) > MAX_B64:
                logger.warning(f"Skipping {label}: too large ({len(b64)} b64 chars)")
                blocks.append({"type": "text", "text": f"[{label}: arquivo grande demais para anexar, use dados textuais do JSON]"})
                return
            if mt in SUPPORTED_IMG:
                blocks.append({"type": "image", "source": {"type": "base64", "media_type": mt, "data": b64}})
                blocks.append({"type": "text", "text": f"[{label} anexado acima]"})
            elif mt == 'application/pdf':
                blocks.append({"type": "document", "source": {"type": "base64", "media_type": mt, "data": b64}})
                blocks.append({"type": "text", "text": f"[{label} anexado acima]"})
            else:
                logger.warning(f"Skipping {label}: unsupported type {mt}")
                blocks.append({"type": "text", "text": f"[{label}: formato {mt} não suportado, use dados textuais do JSON]"})
        
        file_blocks = []
        add_file_blocks(file_blocks, assessment.get('lab_file'), 'EXAMES LABORATORIAIS')
        add_file_blocks(file_blocks, assessment.get('bio_file'), 'BIOIMPEDÂNCIA')
        
        instruction = "Gere meu plano nutricional completo com base nos dados informados."
        if file_blocks:
            instruction += " Considere os documentos/imagens anexados na sua análise."
        
        user_content = file_blocks + [{"type": "text", "text": instruction}]
        
        # Try with attachments, fallback to text-only if files fail
        try:
            message = anthropicClient.messages.create(
                model="claude-opus-4-6",
                max_tokens=16000,
                temperature=0.4,
                system=system_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
        except anthropic.BadRequestError as file_err:
            logger.warning(f"Attachment error: {file_err}. Retrying text-only...")
            fallback_text = instruction + " (Os arquivos de exames/bioimpedância não puderam ser processados visualmente. Baseie-se nos dados textuais incluídos no JSON do paciente.)"
            message = anthropicClient.messages.create(
                model="claude-opus-4-6",
                max_tokens=16000,
                temperature=0.4,
                system=system_prompt,
                messages=[{"role": "user", "content": fallback_text}]
            )
        plan_markdown = message.content[0].text
        logger.info(f"Plan generated: {len(plan_markdown)} chars, {message.usage.output_tokens} tokens")
        
        await db.plans.update_one(
            {"_id": result.inserted_id},
            {"$set": {
                "status": "ready",
                "plan_markdown": plan_markdown,
                "completed_at": datetime.now(timezone.utc),
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens
            }}
        )
        plan_doc['status'] = 'ready'
        plan_doc['plan_markdown'] = plan_markdown
        
    except Exception as e:
        logger.error(f"Plan generation failed: {e}")
        await db.plans.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "error", "error_message": str(e)}}
        )
        plan_doc['status'] = 'error'
        plan_doc['error_message'] = str(e)
    
    return serialize_doc(plan_doc)

@api_router.get("/plans")
async def list_plans(request: Request):
    payload = await get_current_user(request)
    plans = await db.plans.find(
        {"user_id": payload['user_id']},
        {"plan_markdown": 0}  # Exclude heavy markdown from list
    ).sort("created_at", -1).to_list(100)
    return [serialize_doc(p) for p in plans]

@api_router.get("/plans/{plan_id}")
async def get_plan(plan_id: str, request: Request):
    payload = await get_current_user(request)
    from bson import ObjectId
    try:
        plan = await db.plans.find_one({"_id": ObjectId(plan_id), "user_id": payload['user_id']})
    except Exception:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado")
    return serialize_doc(plan)

# ============ TRACKER: MODELS ============
class MealLogCreate(BaseModel):
    date: str  # YYYY-MM-DD
    meal_type: str  # meal_breakfast, meal_lunch, etc.
    photo_base64: Optional[str] = None
    photo_media_type: Optional[str] = None
    description: Optional[str] = None

class MealLogUpdate(BaseModel):
    foods: Optional[List[Dict[str, Any]]] = None

# ============ TRACKER: PLAN TARGET EXTRACTION ============
EXTRACT_TARGETS_PROMPT = """Analise o plano nutricional abaixo e extraia as metas diárias de macronutrientes.

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
"""

@api_router.post("/plans/{plan_id}/parse-targets")
async def parse_plan_targets(plan_id: str, request: Request):
    payload = await get_current_user(request)
    from bson import ObjectId
    
    # Check if already parsed
    existing = await db.plan_targets.find_one({"plan_id": plan_id, "user_id": payload['user_id']})
    if existing:
        return serialize_doc(existing)
    
    plan = await db.plans.find_one({"_id": ObjectId(plan_id), "user_id": payload['user_id']})
    if not plan or plan.get('status') != 'ready':
        raise HTTPException(status_code=404, detail="Plano não encontrado ou não está pronto")
    
    try:
        # Use Sonnet for fast extraction
        msg = anthropicClient.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=500,
            temperature=0,
            messages=[{"role": "user", "content": EXTRACT_TARGETS_PROMPT + plan['plan_markdown'][:8000]}]
        )
        raw = msg.content[0].text.strip()
        # Clean potential markdown code block wrapping
        if raw.startswith('```'):
            raw = raw.split('\n', 1)[1] if '\n' in raw else raw[3:]
            if raw.endswith('```'):
                raw = raw[:-3]
        parsed = json.loads(raw)
        
        target_doc = {
            "plan_id": plan_id,
            "user_id": payload['user_id'],
            "daily_targets": parsed.get("daily_targets", {"kcal": 1800, "protein_g": 100, "carbs_g": 200, "fat_g": 60, "fiber_g": 25}),
            "meals": parsed.get("meals", ["meal_breakfast", "meal_lunch", "meal_dinner"]),
            "extracted_at": datetime.now(timezone.utc)
        }
    except Exception as e:
        logger.error(f"Target extraction failed: {e}")
        # Fallback defaults
        target_doc = {
            "plan_id": plan_id,
            "user_id": payload['user_id'],
            "daily_targets": {"kcal": 1800, "protein_g": 100, "carbs_g": 200, "fat_g": 60, "fiber_g": 25},
            "meals": ["meal_breakfast", "meal_lunch", "meal_dinner"],
            "extracted_at": datetime.now(timezone.utc)
        }
    
    result = await db.plan_targets.insert_one(target_doc)
    target_doc['_id'] = result.inserted_id
    return serialize_doc(target_doc)

# ============ TRACKER: ACTIVE PLAN ============
@api_router.get("/active-plan")
async def get_active_plan(request: Request):
    payload = await get_current_user(request)
    plan = await db.plans.find_one(
        {"user_id": payload['user_id'], "status": "ready"},
        {"plan_markdown": 0},
        sort=[("created_at", -1)]
    )
    if not plan:
        return {"plan": None, "targets": None}
    
    plan_id = str(plan['_id'])
    targets = await db.plan_targets.find_one({"plan_id": plan_id, "user_id": payload['user_id']})
    
    return {
        "plan": serialize_doc(plan),
        "targets": serialize_doc(targets) if targets else None
    }

# ============ TRACKER: MEAL ANALYSIS ============
MEAL_ANALYSIS_PROMPT = """Você é um nutricionista analisando uma refeição. Analise a imagem/descrição e identifique TODOS os alimentos visíveis, estimando porções e valores nutricionais.

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
"""

MEAL_TYPE_LABELS = {
    "meal_breakfast": "Café da manhã",
    "meal_morning_snack": "Lanche da manhã",
    "meal_lunch": "Almoço",
    "meal_afternoon_snack": "Lanche da tarde",
    "meal_dinner": "Jantar",
    "meal_supper": "Ceia",
}

@api_router.post("/meal-logs")
async def create_meal_log(data: MealLogCreate, request: Request):
    payload = await get_current_user(request)
    
    if not data.photo_base64 and not data.description:
        raise HTTPException(status_code=400, detail="Envie uma foto ou descrição da refeição")
    
    # Get active plan targets for feedback
    plan = await db.plans.find_one(
        {"user_id": payload['user_id'], "status": "ready"},
        sort=[("created_at", -1)]
    )
    plan_id = str(plan['_id']) if plan else None
    targets = None
    if plan_id:
        targets_doc = await db.plan_targets.find_one({"plan_id": plan_id, "user_id": payload['user_id']})
        if targets_doc:
            targets = targets_doc.get('daily_targets', {})
    
    # Analyze meal with Sonnet
    try:
        user_content = []
        if data.photo_base64 and data.photo_media_type:
            user_content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": data.photo_media_type, "data": data.photo_base64}
            })
        
        text_prompt = MEAL_ANALYSIS_PROMPT
        if data.description:
            text_prompt += f"\n\nDescrição da refeição: {data.description}"
        if not data.photo_base64:
            text_prompt += "\n\nNão há foto. Analise baseado apenas na descrição textual."
        
        meal_label = MEAL_TYPE_LABELS.get(data.meal_type, data.meal_type)
        text_prompt += f"\n\nTipo de refeição: {meal_label}"
        text_prompt += f"\nData: {data.date}"
        
        user_content.append({"type": "text", "text": text_prompt})
        
        msg = anthropicClient.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            temperature=0.2,
            messages=[{"role": "user", "content": user_content}]
        )
        
        raw = msg.content[0].text.strip()
        if raw.startswith('```'):
            raw = raw.split('\n', 1)[1] if '\n' in raw else raw[3:]
            if raw.endswith('```'):
                raw = raw[:-3]
        analysis = json.loads(raw)
        
        # Add feedback based on plan targets
        if targets:
            totals = analysis.get('totals', {})
            # Calculate how many meals in the day, estimate per-meal targets
            meals_count = len(targets.get('meals', ['meal_breakfast', 'meal_lunch', 'meal_dinner'])) if isinstance(targets, dict) else 3
            if meals_count == 0:
                meals_count = 3
            per_meal_kcal = targets.get('kcal', 1800) / meals_count
            per_meal_prot = targets.get('protein_g', 100) / meals_count
            
            kcal_diff = totals.get('kcal', 0) - per_meal_kcal
            prot_diff = totals.get('protein_g', 0) - per_meal_prot
            
            feedback_parts = []
            if abs(kcal_diff) > 50:
                if kcal_diff > 0:
                    feedback_parts.append(f"+{int(kcal_diff)} kcal acima da meta para esta refeição")
                else:
                    feedback_parts.append(f"{int(kcal_diff)} kcal abaixo da meta para esta refeição")
            if abs(prot_diff) > 5:
                if prot_diff > 0:
                    feedback_parts.append(f"+{int(prot_diff)}g de proteína acima")
                else:
                    feedback_parts.append(f"{int(prot_diff)}g de proteína abaixo")
            
            analysis['feedback'] = ". ".join(feedback_parts) if feedback_parts else "Refeição alinhada com o plano!"
            
            suggestions = []
            if prot_diff < -10:
                suggestions.append("Considere adicionar uma fonte de proteína (ovo, frango, iogurte) nas próximas refeições.")
            if kcal_diff > 100:
                suggestions.append("Refeição calórica acima da meta. Compense com refeições mais leves no restante do dia.")
            if kcal_diff < -100:
                suggestions.append("Refeição leve. Se sentir fome, faça um lanche saudável entre refeições.")
            analysis['suggestions'] = " ".join(suggestions) if suggestions else ""
        
        status = "analyzed"
    except Exception as e:
        logger.error(f"Meal analysis failed: {e}")
        analysis = {
            "foods": [],
            "totals": {"kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0},
            "confidence": "baixa",
            "assumptions": "Análise falhou. Tente novamente.",
            "feedback": "Não foi possível analisar esta refeição.",
            "suggestions": ""
        }
        status = "error"
    
    log_doc = {
        "user_id": payload['user_id'],
        "plan_id": plan_id,
        "date": data.date,
        "meal_type": data.meal_type,
        "description": data.description,
        "has_photo": bool(data.photo_base64),
        "ai_analysis": analysis,
        "status": status,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.meal_logs.insert_one(log_doc)
    log_doc['_id'] = result.inserted_id
    return serialize_doc(log_doc)

@api_router.get("/meal-logs")
async def get_meal_logs(request: Request, date: str = None):
    payload = await get_current_user(request)
    query = {"user_id": payload['user_id']}
    if date:
        query["date"] = date
    logs = await db.meal_logs.find(query).sort("created_at", 1).to_list(100)
    return [serialize_doc(l) for l in logs]

@api_router.delete("/meal-logs/{log_id}")
async def delete_meal_log(log_id: str, request: Request):
    payload = await get_current_user(request)
    from bson import ObjectId
    result = await db.meal_logs.delete_one({"_id": ObjectId(log_id), "user_id": payload['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    return {"deleted": True}

@api_router.get("/meal-logs/calendar")
async def get_meal_calendar(request: Request, year: int = None, month: int = None):
    payload = await get_current_user(request)
    now = datetime.now(timezone.utc)
    y = year or now.year
    m = month or now.month
    
    prefix = f"{y}-{str(m).zfill(2)}"
    logs = await db.meal_logs.find(
        {"user_id": payload['user_id'], "date": {"$regex": f"^{prefix}"}},
        {"date": 1, "ai_analysis.totals": 1, "meal_type": 1}
    ).to_list(500)
    
    # Get targets
    targets = None
    plan = await db.plans.find_one({"user_id": payload['user_id'], "status": "ready"}, sort=[("created_at", -1)])
    if plan:
        plan_id = str(plan['_id'])
        t = await db.plan_targets.find_one({"plan_id": plan_id})
        if t:
            targets = t.get('daily_targets', {})
    
    # Aggregate by day
    days = {}
    for log in logs:
        d = log['date']
        if d not in days:
            days[d] = {"kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "meals_logged": 0}
        totals = log.get('ai_analysis', {}).get('totals', {})
        days[d]['kcal'] += totals.get('kcal', 0)
        days[d]['protein_g'] += totals.get('protein_g', 0)
        days[d]['carbs_g'] += totals.get('carbs_g', 0)
        days[d]['fat_g'] += totals.get('fat_g', 0)
        days[d]['meals_logged'] += 1
    
    # Calculate adherence per day
    calendar = {}
    target_kcal = targets.get('kcal', 1800) if targets else 1800
    for d, vals in days.items():
        ratio = vals['kcal'] / target_kcal if target_kcal > 0 else 0
        if ratio >= 0.85 and ratio <= 1.15:
            status = "green"
        elif ratio >= 0.7 and ratio <= 1.3:
            status = "yellow"
        else:
            status = "red"
        calendar[d] = {**vals, "status": status, "target_kcal": target_kcal}
    
    return {"year": y, "month": m, "days": calendar, "targets": targets}

@api_router.get("/meal-logs/weekly-summary")
async def get_weekly_summary(request: Request, end_date: str = None):
    payload = await get_current_user(request)
    from datetime import timedelta
    
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d")
    else:
        end = datetime.now(timezone.utc)
    start = end - timedelta(days=6)
    
    dates = [(start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
    logs = await db.meal_logs.find(
        {"user_id": payload['user_id'], "date": {"$in": dates}},
        {"date": 1, "ai_analysis.totals": 1, "meal_type": 1}
    ).to_list(500)
    
    # Get targets
    targets = None
    plan = await db.plans.find_one({"user_id": payload['user_id'], "status": "ready"}, sort=[("created_at", -1)])
    if plan:
        plan_id = str(plan['_id'])
        t = await db.plan_targets.find_one({"plan_id": plan_id})
        if t:
            targets = t.get('daily_targets', {})
    
    # Aggregate
    daily = {}
    for d in dates:
        daily[d] = {"kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0, "meals": 0}
    
    for log in logs:
        d = log['date']
        if d in daily:
            totals = log.get('ai_analysis', {}).get('totals', {})
            daily[d]['kcal'] += totals.get('kcal', 0)
            daily[d]['protein_g'] += totals.get('protein_g', 0)
            daily[d]['carbs_g'] += totals.get('carbs_g', 0)
            daily[d]['fat_g'] += totals.get('fat_g', 0)
            daily[d]['fiber_g'] += totals.get('fiber_g', 0)
            daily[d]['meals'] += 1
    
    # Calculate averages
    days_with_data = [d for d in dates if daily[d]['meals'] > 0]
    avg = {"kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0}
    if days_with_data:
        for d in days_with_data:
            for k in avg:
                avg[k] += daily[d][k]
        for k in avg:
            avg[k] = round(avg[k] / len(days_with_data), 1)
    
    return {
        "dates": dates,
        "daily": daily,
        "averages": avg,
        "targets": targets,
        "days_tracked": len(days_with_data)
    }

# ============ HEALTH CHECK ============
@api_router.get("/")
async def root():
    return {"message": "MealTrack API v2", "status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
