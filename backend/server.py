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

class AssessmentCreate(BaseModel):
    patient_data: Dict[str, Any]

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

Antes de montar o plano, faça os cálculos e análises necessários. Apresente-os de forma clara.

### 1.1 Cálculo do Gasto Energético
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

### 1.2 Distribuição de Macronutrientes
Defina a distribuição de macros (proteínas, carboidratos, gorduras) em gramas e percentual, justificando a escolha com base no objetivo, nível de atividade e condições clínicas do paciente.

Diretrizes gerais (ajuste conforme contexto clínico):
- **Proteína**: 1,2-2,0g/kg de peso corporal
- **Gordura**: 0,8-1,2g/kg (nunca abaixo de 0,5g/kg)
- **Carboidrato**: restante das calorias após proteína e gordura

### 1.3 Análise Clínica
- Identifique **alertas nutricionais** relevantes.
- Liste **restrições obrigatórias**.
- Considere interações medicamento-nutriente relevantes.
- Se o paciente for gestante ou lactante, ajuste as necessidades.

### 1.4 Análise dos Hábitos Atuais
- Com base no recordatório alimentar, identifique pontos positivos, gaps nutricionais e padrões problemáticos.
- Considere o orçamento, quem prepara as refeições e a rotina de horários.

---

## ETAPA 2 — Plano Alimentar

Monte um cardápio detalhado para **7 dias (segunda a domingo)**.

### Estrutura de cada dia:
- **Horário sugerido**
- **Alimentos e quantidades** em medidas caseiras E em gramas/ml entre parênteses
- **Calorias e macros da refeição** (kcal | P: Xg | C: Xg | G: Xg)

### Refeições do dia:
Adapte o número de refeições ao que o paciente informou.

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
- Ao final de cada dia, apresente o **total diário** (kcal | P | C | G | Fibra)

---

## ETAPA 3 — Tabela de Substituições

Crie uma tabela de equivalências organizada por grupo alimentar com pelo menos 3-4 substitutos por alimento base.

---

## ETAPA 4 — Orientações Gerais

1. **Hidratação**
2. **Orientações para sintomas digestivos**
3. **Orientações para condições clínicas**
4. **Dicas de preparo e organização**
5. **Orientações para comer fora**

---

## ETAPA 5 — Resumo Executivo

- Meta calórica diária e distribuição de macros
- 3 principais mudanças recomendadas
- Alertas importantes
- Sugestão de reavaliação

---

## Regras de formatação do output:
- Use linguagem acessível e acolhedora
- Trate o paciente pelo nome informado
- Evite jargão técnico sem explicação
- Use tabelas para o cardápio e substituições
- Use emojis com moderação (apenas em títulos de seção)
- Estruture com títulos e subtítulos claros (markdown)
- O documento deve ter entre 3.000-5.000 palavras

## Regras de segurança:
- Inclua um disclaimer claro no início
- Nunca recomende suplementação específica
- Não prescreva dietas abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)"""

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
    
    # Check if plan already exists for this assessment
    existing_plan = await db.plans.find_one({"assessment_id": assessment_id})
    if existing_plan:
        return serialize_doc(existing_plan)
    
    # Create plan doc with generating status
    plan_doc = {
        "assessment_id": assessment_id,
        "user_id": payload['user_id'],
        "status": "generating",
        "plan_markdown": "",
        "model": "claude-sonnet-4-5-20250929",
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
        message = anthropicClient.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=16000,
            temperature=0.4,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": "Gere meu plano nutricional completo com base nos dados informados."
            }]
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

# ============ HEALTH CHECK ============
@api_router.get("/")
async def root():
    return {"message": "MealTrack API v1", "status": "healthy"}

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
