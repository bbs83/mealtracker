"""
POC Test: Claude Nutrition Plan Generation
Tests that the Emergent LLM Key + Claude can generate a complete nutrition plan
from patient JSON data using the provided prompt template.
"""
import asyncio
import os
import json
import time
import sys

sys.path.insert(0, '/app/backend')
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Sample patient JSON covering many fields including women's health
SAMPLE_PATIENT = {
    "name": "Maria Silva",
    "age": 32,
    "sex": "female",
    "weight": 72,
    "height": 165,
    "waist": 82,
    "hip": 98,
    "weight_history": "Engordei 10kg nos últimos 2 anos após mudança de emprego. Já fiz dieta low carb por 3 meses mas não mantive.",
    "primary_goal": "lose_weight",
    "target_weight": 62,
    "goal_notes": "Quero emagrecer para o casamento em 6 meses.",
    "conditions": ["Hipotireoidismo"],
    "other_conditions": "",
    "allergies": ["Lactose"],
    "other_allergies": "Camarão",
    "medications": "Levotiroxina 75mcg (manhã em jejum)",
    "lab_results": "TSH: 3.2 mUI/L, Glicemia jejum: 92 mg/dL, Colesterol total: 210 mg/dL, HDL: 45, LDL: 140, Triglicerídeos: 125",
    "family_history": "Mãe com diabetes tipo 2, pai com hipertensão.",
    "wake_time": "06:30",
    "sleep_time": "23:00",
    "sleep_hours": 7,
    "activity_level": "light",
    "exercise_detail": "Caminhada 3x por semana, 40 minutos.",
    "stress_level": "moderate",
    "occupation": "Trabalho em escritório, sentada o dia todo. Home office 3x por semana.",
    "alcohol": True,
    "alcohol_frequency": "Fins de semana, 2-3 taças de vinho",
    "smoking": False,
    "meal_location": "home_mostly",
    "meals_per_day": "3",
    "food_diary": "Café 7h: café com leite (sem lactose) + pão integral com queijo branco. Almoço 12h30: arroz, feijão, frango grelhado, salada. Lanche 16h: fruta ou biscoito. Jantar 20h: sopa ou lanche (pão + presunto + queijo).",
    "food_loves": "Frutas, arroz, frango, chocolate, pão",
    "food_hates": "Berinjela, jiló, fígado",
    "dietary_restrictions": ["Sem lactose"],
    "budget": "moderate",
    "bowel_frequency": "daily",
    "bowel_consistency": "normal",
    "gi_symptoms": ["Inchaço abdominal", "Gases"],
    "water_intake": 1.5,
    "other_drinks": "3 cafés por dia, 1 suco de laranja no almoço",
    "menstrual_cycle": "regular",
    "pregnant": False,
    "breastfeeding": False,
    "contraceptive": True,
    "contraceptive_type": "Pílula anticoncepcional",
    "hormonal_symptoms": "TPM com compulsão por doces e retenção de líquido na semana anterior à menstruação."
}

# Prompt template (from the artifact)
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
- **Proteína**: 1,2-2,0g/kg de peso corporal (priorize o limite superior para ganho de massa ou emagrecimento com preservação muscular)
- **Gordura**: 0,8-1,2g/kg (nunca abaixo de 0,5g/kg)
- **Carboidrato**: restante das calorias após proteína e gordura

### 1.3 Análise Clínica
- Identifique **alertas nutricionais** relevantes com base nas condições de saúde, medicamentos, exames laboratoriais e sintomas digestivos informados.
- Liste **restrições obrigatórias** (alergias, intolerâncias, condições clínicas que exigem exclusão de alimentos).
- Considere interações medicamento-nutriente relevantes.
- Se o paciente for gestante ou lactante, ajuste as necessidades calóricas e de micronutrientes.

### 1.4 Análise dos Hábitos Atuais
- Com base no recordatório alimentar, identifique:
  - Pontos positivos a manter
  - Principais gaps nutricionais
  - Padrões problemáticos (pular refeições, excesso de ultraprocessados, baixa ingestão de fibras/proteínas, etc.)
- Considere o orçamento, quem prepara as refeições e a rotina de horários ao planejar.

---

## ETAPA 2 — Plano Alimentar

Monte um cardápio detalhado para **7 dias (segunda a domingo)**, com as seguintes características:

### Estrutura de cada dia:
Para cada refeição, informe:
- **Horário sugerido** (baseado nos horários de acordar/dormir do paciente)
- **Alimentos e quantidades** em medidas caseiras (xícara, colher de sopa, unidade, fatia, etc.) E em gramas/ml entre parênteses
- **Calorias e macros da refeição** (kcal | P: Xg | C: Xg | G: Xg)

### Refeições do dia:
Adapte o número de refeições ao que o paciente informou. Estrutura típica:
1. Café da manhã
2. Lanche da manhã (se aplicável)
3. Almoço
4. Lanche da tarde
5. Jantar
6. Ceia (se aplicável)

### Regras do cardápio:
- **Respeite todas as alergias e intolerâncias** — nunca inclua alimentos que o paciente é alérgico ou intolerante.
- **Exclua alimentos que o paciente disse detestar** — não force nenhum alimento rejeitado.
- **Priorize alimentos que o paciente disse gostar** — inclua-os frequentemente.
- **Respeite restrições alimentares** (vegetariano, vegano, sem glúten, etc.).
- **Varie os alimentos ao longo da semana** — evite repetir o mesmo prato em dias consecutivos.
- **Use alimentos acessíveis e comuns no Brasil** — priorize ingredientes encontrados em qualquer supermercado.
- **Adapte ao orçamento informado** — se econômico, priorize proteínas mais baratas (ovos, frango, sardinha, leguminosas), frutas da estação, etc.
- **Considere praticidade** — se o paciente come fora frequentemente, inclua orientações para restaurantes por quilo e delivery.
- **Inclua pelo menos 25g de fibra por dia**.
- **Distribua a ingestão proteica ao longo do dia** (mínimo 20g por refeição principal).
- Ao final de cada dia, apresente o **total diário** (kcal | P | C | G | Fibra).

---

## ETAPA 3 — Tabela de Substituições

Crie uma tabela de equivalências para dar flexibilidade ao paciente, organizada por grupo alimentar:

| Grupo | Alimento Base | Substitutos Equivalentes (mesma porção calórica) |
|-------|--------------|--------------------------------------------------|
| Carboidratos | Arroz branco (4 col. sopa) | Arroz integral, batata doce, mandioca, macarrão integral... |
| Proteínas | Frango grelhado (120g) | Peixe, carne bovina magra, ovos, tofu... |
| ... | ... | ... |

Inclua pelo menos 3-4 substitutos por alimento base, respeitando as restrições do paciente.

---

## ETAPA 4 — Orientações Gerais

Apresente orientações práticas e personalizadas:

1. **Hidratação**: Meta diária de água com base no peso (mínimo 35ml/kg) e ajustes para atividade física. Compare com o consumo atual informado.
2. **Orientações para sintomas digestivos**: Se o paciente reportou sintomas GI, inclua orientações específicas (ex: alimentos que ajudam na constipação, como reduzir gases, etc.).
3. **Orientações para condições clínicas**: Dicas alimentares específicas para cada condição diagnosticada.
4. **Dicas de preparo e organização**: Sugestões de meal prep, organização semanal, como montar marmitas.
5. **Orientações para comer fora**: Se aplicável, como fazer boas escolhas em restaurantes.

---

## ETAPA 5 — Resumo Executivo

Ao final, apresente um resumo conciso com:

- Meta calórica diária e distribuição de macros
- 3 principais mudanças recomendadas em relação à alimentação atual
- Alertas importantes (clínicos, interações, deficiências a monitorar)
- Sugestão de reavaliação (quando o paciente deve retornar / ajustar o plano)

---

## Regras de formatação do output:

- Use linguagem acessível e acolhedora — o paciente vai ler diretamente.
- Trate o paciente pelo nome informado.
- Evite jargão técnico sem explicação. Quando usar termos técnicos, explique entre parênteses.
- Use tabelas para o cardápio e substituições.
- Use emojis com moderação (apenas em títulos de seção) para tornar o documento mais visual.
- Estruture com títulos e subtítulos claros (markdown).
- O documento deve ter entre 3.000-5.000 palavras.

## Regras de segurança:

- Este plano é uma ferramenta de apoio e NÃO substitui o acompanhamento profissional presencial.
- Inclua um disclaimer claro no início do documento informando isso.
- Se os dados indicarem condições clínicas graves (diabetes tipo 1, gestação de risco, transtornos alimentares, IMC < 18.5), reforce a necessidade de acompanhamento médico e nutricional presencial antes de seguir qualquer plano.
- Nunca recomende suplementação específica — limite-se a sugerir que o paciente converse com seu nutricionista ou médico sobre possível necessidade de suplementação com base nos exames.
- Não prescreva dietas abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)."""


async def test_claude_nutrition_plan():
    """Test Claude nutrition plan generation with sample patient data."""
    print("=" * 60)
    print("TEST: Claude Nutrition Plan Generation")
    print("=" * 60)
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        print("FAIL: EMERGENT_LLM_KEY not found in environment")
        return False
    
    print(f"API Key found: {api_key[:12]}...")
    
    # Build the system prompt with patient data
    system_prompt = PROMPT_TEMPLATE.replace('{PATIENT_JSON}', json.dumps(SAMPLE_PATIENT, ensure_ascii=False, indent=2))
    
    print(f"\nSystem prompt length: {len(system_prompt)} chars")
    print(f"Patient JSON fields: {len(SAMPLE_PATIENT)} fields")
    
    # Initialize Claude chat
    chat = LlmChat(
        api_key=api_key,
        session_id="poc-nutrition-test-001",
        system_message=system_prompt
    )
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    # Send the generation request
    user_message = UserMessage(
        text="Gere meu plano nutricional completo com base nos dados informados."
    )
    
    print("\nSending request to Claude...")
    start_time = time.time()
    
    try:
        response = await chat.send_message(user_message)
        elapsed = time.time() - start_time
        print(f"Response received in {elapsed:.1f}s")
        print(f"Response length: {len(response)} chars")
        print(f"Approximate word count: {len(response.split())} words")
        
        # Validation checks
        checks = {
            "ETAPA 1": "ETAPA 1" in response or "Avaliação Inicial" in response or "avaliação inicial" in response.lower(),
            "ETAPA 2": "ETAPA 2" in response or "Plano Alimentar" in response or "plano alimentar" in response.lower(),
            "ETAPA 3": "ETAPA 3" in response or "Substituiç" in response or "substituiç" in response.lower(),
            "ETAPA 4": "ETAPA 4" in response or "Orientaç" in response or "orientaç" in response.lower(),
            "ETAPA 5": "ETAPA 5" in response or "Resumo" in response or "resumo" in response.lower(),
            "Disclaimer": "disclaimer" in response.lower() or "substitui" in response.lower() or "acompanhamento" in response.lower(),
            "Patient name used": "Maria" in response,
            "Has markdown headings": "##" in response or "**" in response,
            "Minimum length (2000+ chars)": len(response) > 2000,
            "Has calorie info": "kcal" in response.lower() or "calor" in response.lower(),
            "Has macros": "proteín" in response.lower() or "protein" in response.lower(),
            "Respects lactose restriction": "sem lactose" in response.lower() or "intolerância" in response.lower() or "lactose" in response.lower(),
        }
        
        print("\n" + "=" * 60)
        print("VALIDATION RESULTS:")
        print("=" * 60)
        
        all_passed = True
        for check_name, result in checks.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status}: {check_name}")
            if not result:
                all_passed = False
        
        # Print first 500 chars of the response for inspection
        print("\n" + "=" * 60)
        print("RESPONSE PREVIEW (first 500 chars):")
        print("=" * 60)
        print(response[:500])
        print("...")
        
        # Print last 500 chars
        print("\n" + "=" * 60)
        print("RESPONSE END (last 500 chars):")
        print("=" * 60)
        print(response[-500:])
        
        if all_passed:
            print("\n✅ ALL CHECKS PASSED - Core POC successful!")
        else:
            print("\n⚠️ SOME CHECKS FAILED - Review output above")
        
        return all_passed
        
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"\n❌ ERROR after {elapsed:.1f}s: {type(e).__name__}: {e}")
        return False


if __name__ == "__main__":
    result = asyncio.run(test_claude_nutrition_plan())
    sys.exit(0 if result else 1)
