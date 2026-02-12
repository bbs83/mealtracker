import { useState, useEffect, useRef } from "react";

const STEPS = [
  { id: "personal", label: "Sobre Você", icon: "👤" },
  { id: "goals", label: "Seu Objetivo", icon: "🎯" },
  { id: "health", label: "Saúde", icon: "🩺" },
  { id: "lifestyle", label: "Rotina", icon: "⏰" },
  { id: "eating", label: "Alimentação", icon: "🍽️" },
  { id: "digestion", label: "Digestão", icon: "💧" },
  { id: "women", label: "Saúde Feminina", icon: "♀️" },
  { id: "review", label: "Resumo", icon: "✅" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
  { value: "light", label: "Levemente ativo", desc: "Exercício 1-2x por semana" },
  { value: "moderate", label: "Moderadamente ativo", desc: "Exercício 3-4x por semana" },
  { value: "active", label: "Muito ativo", desc: "Exercício 5-6x por semana" },
  { value: "athlete", label: "Atleta", desc: "Treino intenso diário ou 2x ao dia" },
];

const GOALS = [
  { value: "lose_weight", label: "Emagrecer", icon: "⬇️" },
  { value: "gain_muscle", label: "Ganhar massa muscular", icon: "💪" },
  { value: "maintain", label: "Manter peso saudável", icon: "⚖️" },
  { value: "performance", label: "Melhorar performance esportiva", icon: "🏃" },
  { value: "health", label: "Melhorar saúde geral", icon: "❤️" },
  { value: "clinical", label: "Controlar condição clínica", icon: "🩺" },
];

const COMMON_CONDITIONS = [
  "Diabetes tipo 1", "Diabetes tipo 2", "Pré-diabetes",
  "Hipertensão", "Colesterol alto", "Triglicerídeos alto",
  "Hipotireoidismo", "Hipertireoidismo", "SOP (Síndrome dos Ovários Policísticos)",
  "Gastrite / Refluxo", "Síndrome do Intestino Irritável", "Doença celíaca",
  "Anemia", "Esteatose hepática (gordura no fígado)", "Resistência à insulina",
  "Ansiedade / Depressão",
];

const COMMON_ALLERGIES = [
  "Leite e derivados (lactose)", "Leite e derivados (proteína)",
  "Glúten / Trigo", "Ovo", "Amendoim", "Castanhas / Nozes",
  "Frutos do mar / Camarão", "Soja", "Peixe",
];

const MEAL_LOCATIONS = [
  { value: "home_self", label: "Em casa — eu mesmo preparo" },
  { value: "home_other", label: "Em casa — outra pessoa prepara" },
  { value: "restaurant", label: "Restaurantes / delivery na maioria dos dias" },
  { value: "mixed", label: "Mistura de casa e fora" },
];

const STRESS_LEVELS = [
  { value: "low", label: "Baixo", desc: "Rotina tranquila" },
  { value: "moderate", label: "Moderado", desc: "Estresse normal do dia a dia" },
  { value: "high", label: "Alto", desc: "Bastante estressado(a)" },
  { value: "very_high", label: "Muito alto", desc: "Estresse constante e intenso" },
];

const BOWEL_FREQUENCY = [
  { value: "multiple_daily", label: "Mais de 1x por dia" },
  { value: "daily", label: "1x por dia" },
  { value: "alternate", label: "Dia sim, dia não" },
  { value: "irregular", label: "Irregular / menos de 3x por semana" },
];

const BOWEL_CONSISTENCY = [
  { value: "hard", label: "Ressecadas / duras" },
  { value: "normal", label: "Normais / bem formadas" },
  { value: "soft", label: "Amolecidas" },
  { value: "liquid", label: "Líquidas / diarréia frequente" },
  { value: "varies", label: "Varia bastante" },
];

const GI_SYMPTOMS = [
  "Gases frequentes", "Distensão abdominal (barriga inchada)",
  "Refluxo / azia", "Náusea", "Cólicas intestinais",
  "Constipação (prisão de ventre)", "Diarréia frequente",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// --- Reusable Components ---

function TextInput({ label, sublabel, value, onChange, placeholder, type = "text", unit, required, min, max, step }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: "#e07c5a" }}>*</span>}
      </label>
      {sublabel && <p style={styles.sublabel}>{sublabel}</p>}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "100%" }}>
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          style={{ ...styles.input, paddingRight: unit ? 48 : 12 }}
        />
        {unit && (
          <span style={{ position: "absolute", right: 14, color: "#8a9a7e", fontSize: 14, fontWeight: 500, pointerEvents: "none" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function TextArea({ label, sublabel, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {sublabel && <p style={styles.sublabel}>{sublabel}</p>}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...styles.input, minHeight: rows * 24 + 24, resize: "vertical", fontFamily: "inherit" }}
      />
    </div>
  );
}

function RadioCards({ label, sublabel, options, value, onChange, columns = 2 }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>{label}</label>
      {sublabel && <p style={styles.sublabel}>{sublabel}</p>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              ...styles.card,
              borderColor: value === opt.value ? "#5a7247" : "#e2ddd4",
              backgroundColor: value === opt.value ? "#f0efe8" : "#faf9f5",
              boxShadow: value === opt.value ? "0 0 0 2px #5a7247" : "none",
            }}
          >
            {opt.icon && <span style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</span>}
            <span style={{ fontWeight: 600, color: "#2d2a26", fontSize: 14 }}>{opt.label}</span>
            {opt.desc && <span style={{ fontSize: 12, color: "#7a756d", marginTop: 2 }}>{opt.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, sublabel, options, selected = [], onChange }) {
  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>{label}</label>
      {sublabel && <p style={styles.sublabel}>{sublabel}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lab = typeof opt === "string" ? opt : opt.label;
          const isSelected = selected.includes(val);
          return (
            <button
              key={val}
              onClick={() => toggle(val)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `1.5px solid ${isSelected ? "#5a7247" : "#ddd8cf"}`,
                backgroundColor: isSelected ? "#eef0e8" : "#faf9f5",
                color: isSelected ? "#3d5230" : "#5c574f",
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
            >
              {isSelected ? "✓ " : ""}{lab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectInput({ label, sublabel, options, value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: "#e07c5a" }}>*</span>}
      </label>
      {sublabel && <p style={styles.sublabel}>{sublabel}</p>}
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={styles.input}>
        <option value="" disabled>{placeholder || "Selecione..."}</option>
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lab = typeof opt === "string" ? opt : opt.label;
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
    </div>
  );
}

function ToggleSwitch({ label, sublabel, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "12px 0" }}>
      <div>
        <label style={{ ...styles.label, marginBottom: 0 }}>{label}</label>
        {sublabel && <p style={{ ...styles.sublabel, marginBottom: 0 }}>{sublabel}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 52, height: 28, borderRadius: 14, border: "none",
          backgroundColor: value ? "#5a7247" : "#d4d0c8",
          position: "relative", cursor: "pointer", transition: "background 0.2s ease", flexShrink: 0,
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: "#fff", position: "absolute", top: 3,
          left: value ? 27 : 3, transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: "#2d2a26", marginBottom: 6, fontFamily: "'Fraunces', serif" }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 15, color: "#7a756d", lineHeight: 1.5, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// --- Step Components ---

function StepPersonal({ data, update }) {
  return (
    <div>
      <SectionTitle title="Sobre Você" subtitle="Informações básicas para calcularmos suas necessidades nutricionais." />
      <TextInput label="Nome completo" value={data.name} onChange={(v) => update("name", v)} placeholder="Seu nome" required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TextInput label="Idade" value={data.age} onChange={(v) => update("age", v)} type="number" placeholder="30" unit="anos" required min={1} max={120} />
        <SelectInput label="Sexo biológico" value={data.sex} onChange={(v) => update("sex", v)} options={[
          { value: "male", label: "Masculino" }, { value: "female", label: "Feminino" },
        ]} required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TextInput label="Peso atual" value={data.weight} onChange={(v) => update("weight", v)} type="number" placeholder="70" unit="kg" required step="0.1" />
        <TextInput label="Altura" value={data.height} onChange={(v) => update("height", v)} type="number" placeholder="170" unit="cm" required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TextInput label="Circunferência da cintura" sublabel="Opcional — medida na altura do umbigo" value={data.waist} onChange={(v) => update("waist", v)} type="number" placeholder="80" unit="cm" />
        <TextInput label="Circunferência do quadril" sublabel="Opcional — na parte mais larga" value={data.hip} onChange={(v) => update("hip", v)} type="number" placeholder="95" unit="cm" />
      </div>
      <TextArea label="Histórico de peso" sublabel="Seu peso mudou bastante nos últimos anos? Já fez dietas antes?" value={data.weight_history} onChange={(v) => update("weight_history", v)} placeholder="Ex: Já pesei 90kg, fiz low carb e emagreci 10kg mas recuperei..." />
    </div>
  );
}

function StepGoals({ data, update }) {
  return (
    <div>
      <SectionTitle title="Seu Objetivo" subtitle="O que você gostaria de alcançar com o acompanhamento nutricional?" />
      <RadioCards label="Objetivo principal" options={GOALS} value={data.primary_goal} onChange={(v) => update("primary_goal", v)} columns={2} />
      {data.primary_goal === "lose_weight" && (
        <TextInput label="Peso desejado (meta)" value={data.target_weight} onChange={(v) => update("target_weight", v)} type="number" placeholder="65" unit="kg" />
      )}
      {data.primary_goal === "clinical" && (
        <TextArea label="Qual condição você quer controlar?" value={data.clinical_goal_detail} onChange={(v) => update("clinical_goal_detail", v)} placeholder="Descreva a condição clínica..." />
      )}
      <TextArea label="Algo mais sobre seu objetivo?" sublabel="Tem algum prazo em mente? Algum evento específico?" value={data.goal_notes} onChange={(v) => update("goal_notes", v)} placeholder="Ex: Quero emagrecer para o casamento em outubro..." />
    </div>
  );
}

function StepHealth({ data, update }) {
  return (
    <div>
      <SectionTitle title="Sua Saúde" subtitle="Informações importantes para criarmos um plano seguro e adequado." />
      <CheckboxGroup
        label="Condições de saúde diagnosticadas"
        sublabel="Selecione todas que se aplicam. Se nenhuma, pule."
        options={COMMON_CONDITIONS}
        selected={data.conditions || []}
        onChange={(v) => update("conditions", v)}
      />
      <TextArea label="Outras condições não listadas acima" value={data.other_conditions} onChange={(v) => update("other_conditions", v)} placeholder="Descreva outras condições..." />
      <CheckboxGroup
        label="Alergias e intolerâncias alimentares"
        sublabel="Selecione todas que se aplicam."
        options={COMMON_ALLERGIES}
        selected={data.allergies || []}
        onChange={(v) => update("allergies", v)}
      />
      <TextInput label="Outras alergias" value={data.other_allergies} onChange={(v) => update("other_allergies", v)} placeholder="Ex: kiwi, corante vermelho..." />
      <TextArea label="Medicamentos em uso" sublabel="Liste todos os medicamentos e suplementos que toma atualmente." value={data.medications} onChange={(v) => update("medications", v)} placeholder="Ex: Levotiroxina 50mcg, Vitamina D 2000UI..." />
      <TextArea label="Exames recentes" sublabel="Se tiver resultados de exames de sangue recentes, compartilhe aqui os valores mais relevantes." value={data.lab_results} onChange={(v) => update("lab_results", v)} placeholder="Ex: Glicemia 98, Colesterol total 220, TSH 3.5, Vitamina D 18..." rows={4} />
      <TextArea label="Histórico familiar" sublabel="Doenças comuns na família (pais, avós, irmãos)." value={data.family_history} onChange={(v) => update("family_history", v)} placeholder="Ex: Pai diabético, mãe com pressão alta..." />
    </div>
  );
}

function StepLifestyle({ data, update }) {
  return (
    <div>
      <SectionTitle title="Sua Rotina" subtitle="Entender seu dia a dia ajuda a criar um plano que funcione na prática." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TextInput label="Acorda que horas?" value={data.wake_time} onChange={(v) => update("wake_time", v)} type="time" />
        <TextInput label="Dorme que horas?" value={data.sleep_time} onChange={(v) => update("sleep_time", v)} type="time" />
      </div>
      <TextInput label="Horas de sono por noite" value={data.sleep_hours} onChange={(v) => update("sleep_hours", v)} type="number" placeholder="7" unit="horas" min={1} max={16} />
      <RadioCards label="Nível de atividade física" options={ACTIVITY_LEVELS} value={data.activity_level} onChange={(v) => update("activity_level", v)} columns={1} />
      {data.activity_level && data.activity_level !== "sedentary" && (
        <TextArea label="Quais exercícios você pratica?" sublabel="Tipo, frequência e duração de cada um." value={data.exercise_detail} onChange={(v) => update("exercise_detail", v)} placeholder="Ex: Musculação 4x/semana 1h, corrida 2x/semana 30min..." />
      )}
      <RadioCards label="Nível de estresse no dia a dia" options={STRESS_LEVELS} value={data.stress_level} onChange={(v) => update("stress_level", v)} columns={2} />
      <TextArea label="Profissão / rotina de trabalho" sublabel="Trabalha sentado? Em pé? Viaja muito?" value={data.occupation} onChange={(v) => update("occupation", v)} placeholder="Ex: Trabalho em escritório sentado 8h por dia..." />
      <ToggleSwitch label="Consome bebida alcoólica?" value={data.alcohol} onChange={(v) => update("alcohol", v)} />
      {data.alcohol && (
        <TextInput label="Com que frequência?" value={data.alcohol_frequency} onChange={(v) => update("alcohol_frequency", v)} placeholder="Ex: 2-3 cervejas nos finais de semana" />
      )}
      <ToggleSwitch label="Fuma?" value={data.smoking} onChange={(v) => update("smoking", v)} />
    </div>
  );
}

function StepEating({ data, update }) {
  return (
    <div>
      <SectionTitle title="Seus Hábitos Alimentares" subtitle="Como é sua alimentação hoje — sem julgamento, queremos entender sua realidade." />
      <RadioCards label="Onde você costuma fazer suas refeições?" options={MEAL_LOCATIONS} value={data.meal_location} onChange={(v) => update("meal_location", v)} columns={1} />
      <SelectInput label="Quantas refeições faz por dia?" value={data.meals_per_day} onChange={(v) => update("meals_per_day", v)} options={[
        { value: "1-2", label: "1 a 2 refeições" },
        { value: "3", label: "3 refeições" },
        { value: "4-5", label: "4 a 5 refeições (com lanches)" },
        { value: "6+", label: "6 ou mais" },
      ]} />
      <TextArea
        label="Recordatório alimentar — dia típico"
        sublabel="Descreva tudo que você come e bebe num dia normal, com horários aproximados."
        value={data.food_diary}
        onChange={(v) => update("food_diary", v)}
        placeholder={"Ex:\n7h - Café com leite e pão com manteiga\n10h - Fruta\n12h - Arroz, feijão, frango grelhado, salada\n15h - Biscoito cream cracker\n19h - Lanche ou jantar leve\n22h - Sorvete ou chocolate"}
        rows={8}
      />
      <TextArea label="Alimentos que você adora" sublabel="O que não pode faltar na sua alimentação?" value={data.food_loves} onChange={(v) => update("food_loves", v)} placeholder="Ex: arroz e feijão, chocolate, frutas..." />
      <TextArea label="Alimentos que você detesta" sublabel="O que você não come de jeito nenhum?" value={data.food_hates} onChange={(v) => update("food_hates", v)} placeholder="Ex: berinjela, quiabo, fígado..." />
      <CheckboxGroup label="Restrições alimentares" sublabel="Segue alguma dieta específica?" options={[
        "Vegetariano(a)", "Vegano(a)", "Sem glúten", "Sem lactose", "Low carb", "Jejum intermitente", "Kosher", "Halal",
      ]} selected={data.dietary_restrictions || []} onChange={(v) => update("dietary_restrictions", v)} />
      <SelectInput label="Orçamento mensal para alimentação" sublabel="Para adequarmos as sugestões à sua realidade." value={data.budget} onChange={(v) => update("budget", v)} options={[
        { value: "tight", label: "Econômico — preciso otimizar bem" },
        { value: "moderate", label: "Moderado — posso investir razoavelmente" },
        { value: "flexible", label: "Flexível — orçamento não é limitação" },
      ]} />
    </div>
  );
}

function StepDigestion({ data, update }) {
  return (
    <div>
      <SectionTitle title="Digestão e Hidratação" subtitle="Informações sobre seu funcionamento intestinal e consumo de líquidos." />
      <RadioCards label="Frequência intestinal" sublabel="Com que frequência você vai ao banheiro?" options={BOWEL_FREQUENCY} value={data.bowel_frequency} onChange={(v) => update("bowel_frequency", v)} columns={2} />
      <RadioCards label="Consistência das fezes" options={BOWEL_CONSISTENCY} value={data.bowel_consistency} onChange={(v) => update("bowel_consistency", v)} columns={1} />
      <CheckboxGroup label="Sintomas digestivos frequentes" sublabel="Selecione os que ocorrem com frequência." options={GI_SYMPTOMS} selected={data.gi_symptoms || []} onChange={(v) => update("gi_symptoms", v)} />
      <TextInput label="Consumo de água por dia" value={data.water_intake} onChange={(v) => update("water_intake", v)} type="number" placeholder="2" unit="litros" step="0.5" />
      <TextArea label="Outros líquidos" sublabel="Café, chá, sucos, refrigerante — o que você bebe além de água?" value={data.other_drinks} onChange={(v) => update("other_drinks", v)} placeholder="Ex: 3 cafés por dia, 1 suco no almoço, refrigerante nos finais de semana..." />
    </div>
  );
}

function StepWomen({ data, update }) {
  if (data.sex !== "female") {
    return (
      <div>
        <SectionTitle title="Saúde Feminina" subtitle="Esta seção é específica para mulheres." />
        <div style={{ ...styles.infoCard, textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 16, color: "#7a756d" }}>
            Com base nas informações anteriores, esta seção não se aplica a você. Pode avançar para o resumo.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle title="Saúde Feminina" subtitle="Informações hormonais que impactam diretamente o metabolismo e o plano alimentar." />
      <SelectInput label="Ciclo menstrual" value={data.menstrual_cycle} onChange={(v) => update("menstrual_cycle", v)} options={[
        { value: "regular", label: "Regular (a cada 24-35 dias)" },
        { value: "irregular", label: "Irregular" },
        { value: "absent", label: "Ausente" },
        { value: "menopause", label: "Menopausa" },
        { value: "perimenopause", label: "Perimenopausa" },
      ]} />
      <ToggleSwitch label="Está grávida?" value={data.pregnant} onChange={(v) => update("pregnant", v)} />
      {data.pregnant && (
        <TextInput label="Semanas de gestação" value={data.pregnancy_weeks} onChange={(v) => update("pregnancy_weeks", v)} type="number" placeholder="12" unit="semanas" />
      )}
      <ToggleSwitch label="Está amamentando?" value={data.breastfeeding} onChange={(v) => update("breastfeeding", v)} />
      <ToggleSwitch label="Usa anticoncepcional?" value={data.contraceptive} onChange={(v) => update("contraceptive", v)} />
      {data.contraceptive && (
        <TextInput label="Qual?" value={data.contraceptive_type} onChange={(v) => update("contraceptive_type", v)} placeholder="Ex: pílula, DIU hormonal, implante..." />
      )}
      <TextArea label="Sintomas hormonais relevantes" sublabel="TPM intensa, retenção de líquido, compulsão alimentar em alguma fase do ciclo..." value={data.hormonal_symptoms} onChange={(v) => update("hormonal_symptoms", v)} placeholder="Descreva se tiver..." />
    </div>
  );
}

function ReviewField({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value === true ? "Sim" : value === false ? "Não" : value;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ede9e2" }}>
      <span style={{ color: "#7a756d", fontSize: 13, flex: "0 0 40%" }}>{label}</span>
      <span style={{ color: "#2d2a26", fontSize: 13, fontWeight: 500, textAlign: "right", flex: "0 0 58%" }}>{String(display)}</span>
    </div>
  );
}

function StepReview({ data }) {
  const sections = [
    {
      title: "Dados Pessoais",
      fields: [
        ["Nome", data.name], ["Idade", data.age ? `${data.age} anos` : null],
        ["Sexo", data.sex === "male" ? "Masculino" : data.sex === "female" ? "Feminino" : null],
        ["Peso", data.weight ? `${data.weight} kg` : null], ["Altura", data.height ? `${data.height} cm` : null],
        ["Cintura", data.waist ? `${data.waist} cm` : null], ["Quadril", data.hip ? `${data.hip} cm` : null],
        ["Histórico de peso", data.weight_history],
      ],
    },
    {
      title: "Objetivo",
      fields: [
        ["Objetivo principal", GOALS.find((g) => g.value === data.primary_goal)?.label],
        ["Meta de peso", data.target_weight ? `${data.target_weight} kg` : null],
        ["Detalhes clínicos", data.clinical_goal_detail],
        ["Observações", data.goal_notes],
      ],
    },
    {
      title: "Saúde",
      fields: [
        ["Condições", data.conditions], ["Outras condições", data.other_conditions],
        ["Alergias", data.allergies], ["Outras alergias", data.other_allergies],
        ["Medicamentos", data.medications], ["Exames", data.lab_results],
        ["Histórico familiar", data.family_history],
      ],
    },
    {
      title: "Rotina",
      fields: [
        ["Acorda", data.wake_time], ["Dorme", data.sleep_time],
        ["Horas de sono", data.sleep_hours ? `${data.sleep_hours}h` : null],
        ["Atividade física", ACTIVITY_LEVELS.find((a) => a.value === data.activity_level)?.label],
        ["Exercícios", data.exercise_detail],
        ["Estresse", STRESS_LEVELS.find((s) => s.value === data.stress_level)?.label],
        ["Profissão", data.occupation],
        ["Álcool", data.alcohol ? `Sim — ${data.alcohol_frequency || "sem detalhe"}` : data.alcohol === false ? "Não" : null],
        ["Tabagismo", data.smoking === true ? "Sim" : data.smoking === false ? "Não" : null],
      ],
    },
    {
      title: "Alimentação",
      fields: [
        ["Refeições", MEAL_LOCATIONS.find((m) => m.value === data.meal_location)?.label],
        ["Refeições/dia", data.meals_per_day],
        ["Recordatório", data.food_diary],
        ["Alimentos favoritos", data.food_loves], ["Alimentos que detesta", data.food_hates],
        ["Restrições", data.dietary_restrictions],
        ["Orçamento", data.budget === "tight" ? "Econômico" : data.budget === "moderate" ? "Moderado" : data.budget === "flexible" ? "Flexível" : null],
      ],
    },
    {
      title: "Digestão",
      fields: [
        ["Frequência intestinal", BOWEL_FREQUENCY.find((b) => b.value === data.bowel_frequency)?.label],
        ["Consistência", BOWEL_CONSISTENCY.find((b) => b.value === data.bowel_consistency)?.label],
        ["Sintomas GI", data.gi_symptoms],
        ["Água", data.water_intake ? `${data.water_intake}L/dia` : null],
        ["Outros líquidos", data.other_drinks],
      ],
    },
  ];

  if (data.sex === "female") {
    sections.push({
      title: "Saúde Feminina",
      fields: [
        ["Ciclo menstrual", data.menstrual_cycle],
        ["Grávida", data.pregnant], ["Semanas gestação", data.pregnancy_weeks ? `${data.pregnancy_weeks} semanas` : null],
        ["Amamentando", data.breastfeeding], ["Anticoncepcional", data.contraceptive ? `Sim — ${data.contraceptive_type || ""}` : data.contraceptive === false ? "Não" : null],
        ["Sintomas hormonais", data.hormonal_symptoms],
      ],
    });
  }

  return (
    <div>
      <SectionTitle title="Revisão dos Dados" subtitle="Confira se está tudo certo antes de gerar seu plano nutricional." />
      {sections.map((sec) => {
        const validFields = sec.fields.filter(([, v]) => v && (!Array.isArray(v) || v.length > 0));
        if (validFields.length === 0) return null;
        return (
          <div key={sec.title} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#5a7247", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>{sec.title}</h3>
            <div style={styles.infoCard}>
              {validFields.map(([label, value], i) => (
                <ReviewField key={i} label={label} value={value} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- JSON Output Modal ---
function JsonModal({ data, onClose }) {
  const [copied, setCopied] = useState(false);
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
  );
  const json = JSON.stringify(cleanData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: "#faf9f5", borderRadius: 16, maxWidth: 640, width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #ede9e2" }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18, color: "#2d2a26" }}>JSON Estruturado</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCopy} style={{ ...styles.btnSecondary, fontSize: 13, padding: "6px 14px" }}>
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#7a756d" }}>✕</button>
          </div>
        </div>
        <pre style={{
          padding: 24, margin: 0, overflow: "auto", fontSize: 12, lineHeight: 1.6, color: "#3d5230",
          fontFamily: "'SF Mono', 'Fira Code', monospace", backgroundColor: "#f5f4ee",
        }}>
          {json}
        </pre>
      </div>
    </div>
  );
}

// --- Progress Bar ---
function ProgressBar({ currentStep, totalSteps, steps }) {
  const pct = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "#5a7247", fontWeight: 600 }}>
          {steps[currentStep].icon} {steps[currentStep].label}
        </span>
        <span style={{ fontSize: 12, color: "#a09a90" }}>{currentStep + 1} de {totalSteps}</span>
      </div>
      <div style={{ height: 6, backgroundColor: "#e8e4dc", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, backgroundColor: "#5a7247",
          borderRadius: 3, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      </div>
    </div>
  );
}

// --- Main App ---
export default function NutritionForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [showJson, setShowJson] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef(null);

  const visibleSteps = data.sex === "female"
    ? STEPS
    : STEPS.filter((s) => s.id !== "women");

  const totalSteps = visibleSteps.length;
  const currentStepId = visibleSteps[step]?.id;

  const update = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const next = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prev = () => {
    if (step > 0) {
      setStep(step - 1);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowJson(true);
  };

  const renderStep = () => {
    switch (currentStepId) {
      case "personal": return <StepPersonal data={data} update={update} />;
      case "goals": return <StepGoals data={data} update={update} />;
      case "health": return <StepHealth data={data} update={update} />;
      case "lifestyle": return <StepLifestyle data={data} update={update} />;
      case "eating": return <StepEating data={data} update={update} />;
      case "digestion": return <StepDigestion data={data} update={update} />;
      case "women": return <StepWomen data={data} update={update} />;
      case "review": return <StepReview data={data} />;
      default: return null;
    }
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <div style={styles.wrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #5a7247 0%, #7a9a5e 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              🥗
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#2d2a26", fontFamily: "'Fraunces', serif" }}>
                Anamnese Nutricional
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: "#a09a90" }}>Formulário completo para seu plano alimentar</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: "0 28px" }}>
          <ProgressBar currentStep={step} totalSteps={totalSteps} steps={visibleSteps} />
        </div>

        {/* Content */}
        <div ref={contentRef} style={styles.content}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div style={styles.nav}>
          <button onClick={prev} disabled={step === 0} style={{
            ...styles.btnSecondary,
            opacity: step === 0 ? 0.4 : 1,
            cursor: step === 0 ? "default" : "pointer",
          }}>
            ← Voltar
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {isLastStep && (
              <button onClick={() => setShowJson(true)} style={styles.btnSecondary}>
                Ver JSON
              </button>
            )}
            {isLastStep ? (
              <button onClick={handleSubmit} style={styles.btnPrimary}>
                Gerar Plano Nutricional ✨
              </button>
            ) : (
              <button onClick={next} style={styles.btnPrimary}>
                Próximo →
              </button>
            )}
          </div>
        </div>
      </div>

      {showJson && <JsonModal data={data} onClose={() => setShowJson(false)} />}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0efe8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 640,
    backgroundColor: "#faf9f5",
    borderRadius: 20,
    boxShadow: "0 8px 40px rgba(45,42,38,0.08), 0 1px 3px rgba(45,42,38,0.04)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "92vh",
    overflow: "hidden",
  },
  header: {
    padding: "20px 28px 16px",
    borderBottom: "1px solid #ede9e2",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 28px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px",
    borderTop: "1px solid #ede9e2",
    backgroundColor: "#faf9f5",
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#2d2a26",
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 12,
    color: "#a09a90",
    margin: "0 0 8px 0",
    lineHeight: 1.4,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1.5px solid #ddd8cf",
    backgroundColor: "#faf9f5",
    fontSize: 14,
    color: "#2d2a26",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 10px",
    borderRadius: 12,
    border: "1.5px solid #e2ddd4",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "center",
    background: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  infoCard: {
    backgroundColor: "#f8f7f2",
    borderRadius: 12,
    padding: "4px 16px",
    border: "1px solid #ede9e2",
  },
  btnPrimary: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#5a7247",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s ease",
  },
  btnSecondary: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1.5px solid #ddd8cf",
    backgroundColor: "transparent",
    color: "#5c574f",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s ease",
  },
};
