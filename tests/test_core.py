"""
POC Test: Claude Nutrition Plan Generation (Direct Anthropic SDK)
Tests that Claude can generate a complete nutrition plan from patient JSON data.
"""
import os
import json
import time
import sys

from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

import anthropic

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
- Identifique **alertas nutricionais** relevantes com base nas condições de saúde, medicamentos, exames laboratoriais e sintomas digestivos informados.
- Liste **restrições obrigatórias** (alergias, intolerâncias, condições clínicas que exigem exclusão de alimentos).
- Considere interações medicamento-nutriente relevantes.
- Se o paciente for gestante ou lactante, ajuste as necessidades calóricas e de micronutrientes.

### 1.4 Análise dos Hábitos Atuais
- Com base no recordatório alimentar, identifique:
  - Pontos positivos a manter
  - Principais gaps nutricionais
  - Padrões problemáticos
- Considere o orçamento, quem prepara as refeições e a rotina de horários ao planejar.

---

## ETAPA 2 — Plano Alimentar

Monte um cardápio detalhado para **7 dias (segunda a domingo)**, com as seguintes características:

### Estrutura de cada dia:
Para cada refeição, informe:
- **Horário sugerido**
- **Alimentos e quantidades** em medidas caseiras E em gramas/ml entre parênteses
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
- **Respeite todas as alergias e intolerâncias**
- **Exclua alimentos que o paciente disse detestar**
- **Priorize alimentos que o paciente disse gostar**
- **Respeite restrições alimentares**
- **Varie os alimentos ao longo da semana**
- **Use alimentos acessíveis e comuns no Brasil**
- **Adapte ao orçamento informado**
- **Considere praticidade**
- **Inclua pelo menos 25g de fibra por dia**
- **Distribua a ingestão proteica ao longo do dia** (mínimo 20g por refeição principal)
- Ao final de cada dia, apresente o **total diário** (kcal | P | C | G | Fibra)

---

## ETAPA 3 — Tabela de Substituições

Crie uma tabela de equivalências para dar flexibilidade ao paciente, organizada por grupo alimentar.
Inclua pelo menos 3-4 substitutos por alimento base, respeitando as restrições do paciente.

---

## ETAPA 4 — Orientações Gerais

Apresente orientações práticas e personalizadas:
1. **Hidratação**
2. **Orientações para sintomas digestivos**
3. **Orientações para condições clínicas**
4. **Dicas de preparo e organização**
5. **Orientações para comer fora**

---

## ETAPA 5 — Resumo Executivo

Ao final, apresente um resumo conciso com:
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
- Este plano é uma ferramenta de apoio e NÃO substitui o acompanhamento profissional presencial
- Inclua um disclaimer claro no início do documento
- Nunca recomende suplementação específica
- Não prescreva dietas abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)"""


def test_claude_nutrition_plan():
    """Test Claude nutrition plan generation with sample patient data."""
    print("=" * 60)
    print("TEST: Claude Nutrition Plan Generation (Direct Anthropic)")
    print("=" * 60)
    
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print("FAIL: ANTHROPIC_API_KEY not found in environment")
        return False
    
    print(f"API Key found: {api_key[:20]}...")
    
    # Build the system prompt with patient data
    system_prompt = PROMPT_TEMPLATE.replace('{PATIENT_JSON}', json.dumps(SAMPLE_PATIENT, ensure_ascii=False, indent=2))
    
    print(f"\nSystem prompt length: {len(system_prompt)} chars")
    print(f"Patient JSON fields: {len(SAMPLE_PATIENT)} fields")
    
    # Initialize Anthropic client
    client = anthropic.Anthropic(api_key=api_key)
    
    print("\nSending request to Claude Sonnet 4.5...")
    start_time = time.time()
    
    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=16000,
            temperature=0.4,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": "Gere meu plano nutricional completo com base nos dados informados."
                }
            ]
        )
        
        response = message.content[0].text
        elapsed = time.time() - start_time
        
        print(f"Response received in {elapsed:.1f}s")
        print(f"Response length: {len(response)} chars")
        print(f"Approximate word count: {len(response.split())} words")
        print(f"Input tokens: {message.usage.input_tokens}")
        print(f"Output tokens: {message.usage.output_tokens}")
        print(f"Stop reason: {message.stop_reason}")
        
        # Validation checks
        checks = {
            "ETAPA 1 present": "ETAPA 1" in response or "Avaliação Inicial" in response,
            "ETAPA 2 present": "ETAPA 2" in response or "Plano Alimentar" in response,
            "ETAPA 3 present": "ETAPA 3" in response or "Substituiç" in response,
            "ETAPA 4 present": "ETAPA 4" in response or "Orientaç" in response,
            "ETAPA 5 present": "ETAPA 5" in response or "Resumo" in response,
            "Disclaimer present": "disclaimer" in response.lower() or "substitui" in response.lower() or "acompanhamento" in response.lower(),
            "Patient name 'Maria' used": "Maria" in response,
            "Has markdown headings": "##" in response,
            "Minimum length (2000+ chars)": len(response) > 2000,
            "Has calorie info": "kcal" in response.lower() or "calor" in response.lower(),
            "Has macros info": "proteín" in response.lower() or "protein" in response.lower(),
            "Mentions lactose restriction": "lactose" in response.lower(),
            "Not truncated (stop_reason=end_turn)": message.stop_reason == "end_turn",
        }
        
        print("\n" + "=" * 60)
        print("VALIDATION RESULTS:")
        print("=" * 60)
        
        all_passed = True
        for check_name, result in checks.items():
            status = "PASS" if result else "FAIL"
            print(f"  {status}: {check_name}")
            if not result:
                all_passed = False
        
        # Print first 500 chars
        print("\n" + "=" * 60)
        print("RESPONSE PREVIEW (first 500 chars):")
        print("=" * 60)
        print(response[:500])
        print("...")
        
        # Print last 300 chars
        print("\n" + "=" * 60)
        print("RESPONSE END (last 300 chars):")
        print("=" * 60)
        print(response[-300:])
        
        if all_passed:
            print("\n✅ ALL CHECKS PASSED - Core POC successful!")
        else:
            print("\n⚠️ SOME CHECKS FAILED - Review output above")
        
        # Save response for inspection
        with open('/app/tests/poc_response.md', 'w') as f:
            f.write(response)
        print("\nFull response saved to /app/tests/poc_response.md")
        
        return all_passed
        
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"\n❌ ERROR after {elapsed:.1f}s: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    result = test_claude_nutrition_plan()
    sys.exit(0 if result else 1)
