// Constants for the nutrition form
export const STEPS = [
  { id: 'personal', label: 'Sobre Voce', icon: 'User' },
  { id: 'goals', label: 'Seu Objetivo', icon: 'Target' },
  { id: 'health', label: 'Saude', icon: 'Heart' },
  { id: 'lifestyle', label: 'Rotina', icon: 'Clock' },
  { id: 'eating', label: 'Alimentacao', icon: 'UtensilsCrossed' },
  { id: 'digestion', label: 'Digestao', icon: 'Droplets' },
  { id: 'women', label: 'Saude Feminina', icon: 'Flower2' },
  { id: 'review', label: 'Resumo', icon: 'ClipboardCheck' },
];

export const GOALS = [
  { value: 'lose_weight', label: 'Emagrecer', desc: 'Perder peso com saude' },
  { value: 'gain_muscle', label: 'Ganhar massa', desc: 'Hipertrofia muscular' },
  { value: 'maintain', label: 'Manter peso', desc: 'Equilibrio e saude' },
  { value: 'performance', label: 'Performance', desc: 'Rendimento esportivo' },
  { value: 'health', label: 'Saude geral', desc: 'Comer melhor' },
  { value: 'clinical', label: 'Controle clinico', desc: 'Condicao especifica' },
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentario', desc: 'Sem exercicio regular' },
  { value: 'light', label: 'Levemente ativo', desc: '1-3x por semana' },
  { value: 'moderate', label: 'Moderado', desc: '3-5x por semana' },
  { value: 'very_active', label: 'Muito ativo', desc: '6-7x por semana' },
  { value: 'athlete', label: 'Atleta', desc: 'Treino intenso diario' },
];

export const STRESS_LEVELS = [
  { value: 'low', label: 'Baixo', desc: 'Tranquilo no dia a dia' },
  { value: 'moderate', label: 'Moderado', desc: 'Estresse normal' },
  { value: 'high', label: 'Alto', desc: 'Bastante estressado' },
  { value: 'very_high', label: 'Muito alto', desc: 'Estresse constante' },
];

export const COMMON_CONDITIONS = [
  'Diabetes tipo 1', 'Diabetes tipo 2', 'Pre-diabetes',
  'Hipertensao', 'Colesterol alto', 'Triglicerideos alto',
  'Hipotireoidismo', 'Hipertireoidismo', 'SOP',
  'Gastrite', 'Refluxo', 'Sindrome do intestino irritavel',
  'Doenca celiaca', 'Doenca de Crohn', 'Anemia',
  'Depressao', 'Ansiedade', 'Insonia',
];

export const COMMON_ALLERGIES = [
  'Lactose', 'Gluten', 'Ovo', 'Amendoim',
  'Castanhas', 'Soja', 'Frutos do mar', 'Peixe',
  'Trigo', 'Milho',
];

export const MEAL_LOCATIONS = [
  { value: 'home_mostly', label: 'Em casa (maioria)', desc: 'Cozinho ou alguem cozinha' },
  { value: 'restaurant', label: 'Restaurante/por quilo', desc: 'Como fora no dia a dia' },
  { value: 'mixed', label: 'Misto', desc: 'Varia bastante' },
  { value: 'delivery', label: 'Delivery/marmita', desc: 'Peco ou recebo pronto' },
];

export const BOWEL_FREQUENCY = [
  { value: 'daily', label: 'Todo dia', desc: '1-2x ao dia' },
  { value: 'alternate', label: 'Dia sim, dia nao', desc: 'A cada 2 dias' },
  { value: 'infrequent', label: 'Menos de 3x/semana', desc: 'Constipacao' },
  { value: 'frequent', label: 'Mais de 3x/dia', desc: 'Frequente' },
];

export const BOWEL_CONSISTENCY = [
  { value: 'normal', label: 'Normal', desc: 'Formada e macia' },
  { value: 'hard', label: 'Ressecada', desc: 'Dura, dificil' },
  { value: 'loose', label: 'Amolecida', desc: 'Pastosa/solta' },
  { value: 'variable', label: 'Variavel', desc: 'Muda muito' },
];

export const GI_SYMPTOMS = [
  'Inchaco abdominal', 'Gases', 'Azia/queimacao',
  'Refluxo', 'Nausea', 'Dor abdominal',
  'Diarreia frequente', 'Constipacao', 'Cólicas',
];

export const DIETARY_RESTRICTIONS = [
  'Vegetariano(a)', 'Vegano(a)', 'Sem gluten',
  'Sem lactose', 'Low carb', 'Jejum intermitente',
  'Kosher', 'Halal',
];

export const REVIEW_SECTIONS = [
  { id: 'personal', label: 'Dados Pessoais', fields: ['name', 'age', 'sex', 'weight', 'height', 'waist', 'hip', 'weight_history'] },
  { id: 'goals', label: 'Objetivo', fields: ['primary_goal', 'target_weight', 'clinical_goal_detail', 'goal_notes'] },
  { id: 'health', label: 'Saude', fields: ['conditions', 'other_conditions', 'allergies', 'other_allergies', 'medications', 'lab_results', 'family_history'] },
  { id: 'lifestyle', label: 'Rotina', fields: ['wake_time', 'sleep_time', 'sleep_hours', 'activity_level', 'exercise_detail', 'stress_level', 'occupation', 'alcohol', 'alcohol_frequency', 'smoking'] },
  { id: 'eating', label: 'Alimentacao', fields: ['meal_location', 'meals_per_day', 'food_diary', 'food_loves', 'food_hates', 'dietary_restrictions', 'budget'] },
  { id: 'digestion', label: 'Digestao', fields: ['bowel_frequency', 'bowel_consistency', 'gi_symptoms', 'water_intake', 'other_drinks'] },
  { id: 'women', label: 'Saude Feminina', fields: ['menstrual_cycle', 'pregnant', 'pregnancy_weeks', 'breastfeeding', 'contraceptive', 'contraceptive_type', 'hormonal_symptoms'] },
];

export const FIELD_LABELS = {
  name: 'Nome', age: 'Idade', sex: 'Sexo', weight: 'Peso (kg)', height: 'Altura (cm)',
  waist: 'Cintura (cm)', hip: 'Quadril (cm)', weight_history: 'Historico de peso',
  primary_goal: 'Objetivo principal', target_weight: 'Peso desejado (kg)',
  clinical_goal_detail: 'Condicao clinica', goal_notes: 'Notas sobre objetivo',
  conditions: 'Condicoes de saude', other_conditions: 'Outras condicoes',
  allergies: 'Alergias', other_allergies: 'Outras alergias',
  medications: 'Medicamentos', lab_results: 'Exames recentes',
  family_history: 'Historico familiar',
  wake_time: 'Hora de acordar', sleep_time: 'Hora de dormir',
  sleep_hours: 'Horas de sono', activity_level: 'Nivel de atividade',
  exercise_detail: 'Exercicios', stress_level: 'Nivel de estresse',
  occupation: 'Profissao', alcohol: 'Consome alcool', alcohol_frequency: 'Frequencia de alcool',
  smoking: 'Fuma',
  meal_location: 'Onde come', meals_per_day: 'Refeicoes por dia',
  food_diary: 'Recordatorio alimentar', food_loves: 'Alimentos que adora',
  food_hates: 'Alimentos que detesta', dietary_restrictions: 'Restricoes alimentares',
  budget: 'Orcamento',
  bowel_frequency: 'Frequencia intestinal', bowel_consistency: 'Consistencia',
  gi_symptoms: 'Sintomas digestivos', water_intake: 'Agua (litros/dia)',
  other_drinks: 'Outros liquidos',
  menstrual_cycle: 'Ciclo menstrual', pregnant: 'Gravida', pregnancy_weeks: 'Semanas de gestacao',
  breastfeeding: 'Amamentando', contraceptive: 'Anticoncepcional',
  contraceptive_type: 'Tipo de anticoncepcional', hormonal_symptoms: 'Sintomas hormonais',
};
