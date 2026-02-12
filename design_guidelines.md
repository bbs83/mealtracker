{
  "app": {
    "name": "MealTrack",
    "language": "pt-BR",
    "brand_attributes": [
      "acolhedor e humano (sem vibe clínica)",
      "confiável (sensação de acompanhamento profissional)",
      "calmo e consistente (reduz ansiedade do formulário longo)",
      "terroso / natural (bem-estar, comida de verdade)",
      "direto ao ponto (microcopy objetivo em PT-BR)"
    ],
    "design_style_fusion": {
      "layout_principle": "Bento grid minimalista (referência: tendência 2026 de grids compartimentados; usa cards com hierarquia clara e bastante respiro)",
      "typography_vibe": "Editorial leve (títulos com serifa orgânica) + UI moderna legível (sans para corpo)",
      "surface_style": "Warm minimal + soft depth: sombras sutis, bordas quentes, background creme com textura/grain discreto",
      "motion_vibe": "micro-interações suaves + transições por etapa (sem exagero), skeletons elegantes durante geração de IA"
    }
  },
  "inspiration_references": {
    "bento_grid_article": {
      "url": "https://mockuuups.studio/blog/post/best-bento-grid-design-examples/",
      "takeaways": [
        "Bento grid = blocos de tamanhos diferentes para hierarquia (cards maiores para ações principais, menores para métricas)",
        "Minimalismo com tipografia forte + paleta muted + whitespace generoso",
        "Interações em hover (realce, leve elevação) para tornar o grid vivo",
        "Responsivo: os blocos refluem para uma coluna no mobile"
      ]
    },
    "ux_multi_step_form_notes": {
      "urls": [
        "https://uxmovement.com/mobile/how-to-display-steppers-on-mobile-forms/",
        "https://designlab.com/blog/design-multi-step-forms-enhance-user-experience"
      ],
      "takeaways": [
        "Mostrar progresso com clareza (ex.: ‘Passo 3 de 8’ + barra segmentada)",
        "Poucos campos por tela; agrupar; reduzir carga cognitiva",
        "Validação inline + autosave + navegação Anterior/Próximo consistente",
        "Mobile-first: botões grandes, thumb-friendly, sem densidade excessiva"
      ]
    }
  },
  "typography": {
    "google_fonts_to_load": [
      {
        "family": "Fraunces",
        "weights": ["400", "600", "700"],
        "usage": "Headings (H1/H2/H3), cards titles, landing hero"
      },
      {
        "family": "DM Sans",
        "weights": ["400", "500", "600", "700"],
        "usage": "Body, labels, helper text, UI controls"
      }
    ],
    "font_pairing": {
      "heading": "Fraunces",
      "body": "DM Sans",
      "fallbacks": {
        "heading": "ui-serif, Georgia, serif",
        "body": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
      }
    },
    "text_size_hierarchy_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-semibold",
      "card_title": "text-base font-semibold",
      "body": "text-sm sm:text-base leading-7",
      "small": "text-xs sm:text-sm text-muted-foreground"
    },
    "ptbr_microcopy_tone": {
      "rules": [
        "Preferir frases curtas: ‘Vamos montar seu plano.’",
        "Evitar jargões médicos; explicar quando necessário.",
        "Usar linguagem positiva: ‘Objetivo’, ‘Preferências’, ‘Rotina’.",
        "Erros sempre com instrução: ‘Informe um e-mail válido’ (não apenas ‘Inválido’)."
      ],
      "common_ctas": {
        "primary": ["Começar agora", "Criar meu plano", "Continuar"],
        "secondary": ["Salvar e sair", "Voltar", "Ver histórico"],
        "auth": ["Entrar", "Criar conta", "Esqueci minha senha"]
      }
    }
  },
  "color_system": {
    "notes": [
      "Manter o ‘earthy warm’ do original, mas com mais nuance (sálvia + argila + creme) e acentos de ‘oceano’ bem claro para links/foco.",
      "Evitar gradientes escuros/saturados. Usar gradiente apenas como fundo decorativo no hero (<=20% viewport).",
      "Cards e áreas de leitura (markdown) SEM gradiente; fundo sólido creme e branco quente."
    ],
    "palette_hex": {
      "olive": "#5A7247",
      "sage": "#7F9A72",
      "clay": "#C97B63",
      "oat": "#E2DDD4",
      "cream": "#FAF9F5",
      "ink": "#1F2A1F",
      "ocean": "#2F6F73",
      "sun": "#D6A14A",
      "danger": "#B42318"
    },
    "design_tokens_css_vars": {
      "instructions": "Substituir tokens neutros atuais em /frontend/src/index.css (:root) por estes HSL. (O app usa shadcn tokens.)",
      "tokens_hsl": {
        "--background": "45 33% 97%",
        "--foreground": "120 16% 14%",
        "--card": "0 0% 100%",
        "--card-foreground": "120 16% 14%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "120 16% 14%",
        "--primary": "97 20% 36%",
        "--primary-foreground": "45 33% 97%",
        "--secondary": "36 25% 90%",
        "--secondary-foreground": "120 16% 14%",
        "--muted": "36 22% 92%",
        "--muted-foreground": "110 9% 36%",
        "--accent": "170 25% 90%",
        "--accent-foreground": "120 16% 14%",
        "--border": "32 18% 86%",
        "--input": "32 18% 86%",
        "--ring": "170 33% 32%",
        "--destructive": "6 69% 43%",
        "--destructive-foreground": "45 33% 97%",
        "--radius": "0.85rem",
        "--chart-1": "97 20% 36%",
        "--chart-2": "170 33% 32%",
        "--chart-3": "18 45% 58%",
        "--chart-4": "40 55% 55%",
        "--chart-5": "110 16% 45%"
      },
      "extra_tokens": {
        "--shadow-soft": "0 18px 40px -20px rgba(31,42,31,0.25)",
        "--shadow-lift": "0 22px 50px -26px rgba(31,42,31,0.35)",
        "--noise-opacity": "0.045",
        "--focus-outline": "0 0 0 4px rgba(47,111,115,0.20)",
        "--container-max": "72rem"
      }
    },
    "allowed_gradients": {
      "hero_background_only": {
        "css": "radial-gradient(1200px 600px at 15% 10%, rgba(201,123,99,0.18), transparent 55%), radial-gradient(900px 520px at 85% 0%, rgba(127,154,114,0.18), transparent 55%), radial-gradient(800px 500px at 50% 110%, rgba(214,161,74,0.12), transparent 55%)",
        "rule": "Aplicar apenas em seção hero do landing e no máximo 20% do viewport (no topo)."
      }
    }
  },
  "layout_and_grid": {
    "container": {
      "max_width": "max-w-6xl (var(--container-max))",
      "padding": "px-4 sm:px-6 lg:px-8",
      "vertical_rhythm": "py-10 sm:py-14 lg:py-16"
    },
    "dashboard_bento_grid": {
      "grid": "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5",
      "cards": [
        {
          "name": "CTA Criar Plano",
          "span": "md:col-span-7",
          "content": "Resumo + botão ‘Novo questionário’ + lembrete de tempo (≈ 8–10 min)"
        },
        {
          "name": "Último plano",
          "span": "md:col-span-5",
          "content": "Status badge, data, botão ‘Ver plano’"
        },
        {
          "name": "Histórico",
          "span": "md:col-span-12",
          "content": "Tabela compacta + filtros"
        }
      ]
    },
    "form_layout": {
      "structure": [
        "Header fixo (mobile): breadcrumb + ‘Passo X de 8’ + progress bar",
        "Área de conteúdo: Card central (não centralizar texto; alinhar à esquerda), com grupos de campos",
        "Footer fixo (mobile): Anterior/Próximo + ‘Salvar e sair’"
      ],
      "recommended_width": "max-w-3xl",
      "grouping": "Usar separadores e títulos curtos por bloco (3–7 campos por bloco quando possível)"
    },
    "plan_viewer_layout": {
      "reading_experience": [
        "Layout em 2 colunas no desktop: sumário (toc) sticky à esquerda + conteúdo markdown à direita",
        "No mobile: sumário em accordion/collapsible no topo",
        "Área de leitura com largura controlada: prose max-w-none e um wrapper max-w-3xl"
      ]
    }
  },
  "components": {
    "component_path": {
      "shadcn_ui": "/app/frontend/src/components/ui/",
      "primary_components_to_use": [
        "button.jsx",
        "card.jsx",
        "input.jsx",
        "textarea.jsx",
        "select.jsx",
        "checkbox.jsx",
        "radio-group.jsx",
        "switch.jsx",
        "progress.jsx",
        "badge.jsx",
        "tabs.jsx",
        "table.jsx",
        "separator.jsx",
        "accordion.jsx",
        "collapsible.jsx",
        "dialog.jsx",
        "sheet.jsx",
        "skeleton.jsx",
        "scroll-area.jsx",
        "tooltip.jsx",
        "calendar.jsx",
        "sonner.jsx"
      ]
    },
    "page_level_components": {
      "landing": {
        "sections": [
          "Hero com CTA (sem foto obrigatória; usar ilustração/shape + microcopy)",
          "Como funciona (3 passos) em bento cards",
          "O que você recebe (5 seções do plano) em tabs",
          "Depoimentos (sem fotos se não houver; usar avatar placeholder)",
          "FAQ (accordion)",
          "Footer minimal"
        ]
      },
      "auth": {
        "layout": "Split-screen no desktop (esquerda: texto/benefícios; direita: card do formulário). No mobile: uma coluna.",
        "components": ["card", "form", "input", "button", "separator"],
        "notes": "Evitar fundo escuro. Usar fundo creme + card branco + sombra soft."
      },
      "dashboard": {
        "widgets": [
          "Card ‘Novo Plano’ (CTA)",
          "Card ‘Último plano’ (status)",
          "Tabela ‘Histórico’ (planos) com badges"
        ]
      },
      "new_assessment": {
        "components": [
          "progress (barra)",
          "tabs (opcional para sub-seções dentro de um passo)",
          "accordion (para campos avançados, ex.: digestão)",
          "sheet (ajuda contextual ‘Por que perguntamos isso?’)",
          "dialog (confirmar sair sem salvar)",
          "calendar (data de nascimento/menstruação se aplicável)"
        ]
      },
      "plan_viewer": {
        "components": [
          "scroll-area (conteúdo longo)",
          "tabs (para alternar seções: Avaliação / Cardápio 7 dias / Substituições / Diretrizes / Resumo)",
          "table (tabelas renderizadas ou fallback)",
          "badge (status e tags)",
          "button (exportar/copiar)"
        ]
      }
    },
    "component_states_and_styles": {
      "buttons": {
        "shape": "Luxury/Elegant: rounded-xl (8–12px) e altura confortável",
        "variants": {
          "primary": "bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:translate-y-[-1px] active:translate-y-0",
          "secondary": "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/70",
          "ghost": "hover:bg-accent/60 text-foreground"
        },
        "sizes": {
          "sm": "h-9 px-3 text-sm",
          "md": "h-11 px-4 text-sm",
          "lg": "h-12 px-5 text-base"
        },
        "no_transition_all": "Usar transition-colors/transition-shadow/transition-transform separadamente. Ex.: 'transition-colors duration-200' + 'transition-shadow duration-200' + 'transition-transform duration-200'"
      },
      "inputs": {
        "style": "bg-white/80 focus-visible:ring-[4px] focus-visible:ring-[rgba(47,111,115,0.20)]",
        "helper_text": "Sempre incluir descrição curta quando o campo for subjetivo (ex.: ‘Ex.: 3x por semana’)"
      },
      "badges": {
        "status_map": {
          "gerando": "bg-[rgba(214,161,74,0.18)] text-[color:rgb(122,82,26)] border border-[rgba(214,161,74,0.35)]",
          "pronto": "bg-[rgba(127,154,114,0.18)] text-[color:rgb(58,84,47)] border border-[rgba(127,154,114,0.35)]",
          "erro": "bg-[rgba(180,35,24,0.10)] text-[color:rgb(180,35,24)] border border-[rgba(180,35,24,0.25)]"
        }
      },
      "cards": {
        "base": "rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]",
        "hover": "hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-shadow duration-200 transition-transform duration-200"
      }
    }
  },
  "multi_step_form_experience": {
    "stepper": {
      "top_bar": {
        "content": "Breadcrumb + título do passo + ‘Passo X de 8’",
        "components": ["breadcrumb", "progress"],
        "tailwind": "sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border"
      },
      "progress_bar": {
        "component": "progress.jsx",
        "pattern": "Mostrar % (value = (stepIndex/totalSteps)*100) e também texto ‘Passo X de 8’ para acessibilidade.",
        "data_testid": "nutrition-form-progress"
      },
      "navigation": {
        "footer": "sticky bottom-0 z-20 bg-background/90 backdrop-blur border-t border-border",
        "buttons": {
          "prev": {"label": "Anterior", "data_testid": "nutrition-form-prev-button"},
          "next": {"label": "Próximo", "data_testid": "nutrition-form-next-button"},
          "save_exit": {"label": "Salvar e sair", "data_testid": "nutrition-form-save-exit-button"}
        }
      }
    },
    "field_patterns": {
      "50_plus_fields_rule": [
        "Sempre agrupar em seções com título + 1 frase de contexto.",
        "Colocar campos mais fáceis primeiro (momentum).",
        "Usar componentes de seleção (radio/checkbox/select) para reduzir digitação.",
        "Quando a pergunta for sensível (condições), usar texto ‘Opcional’ e tooltip ‘Por que perguntamos?’"
      ],
      "conditional_sections": {
        "womens_health": "Mostrar apenas quando sexo=Feminino e/ou ‘Quero incluir saúde menstrual’. Usar collapsible com aviso ‘Apenas se aplicável’."
      },
      "validation": {
        "pattern": "Validação inline (abaixo do input). Em PT-BR. Sem bloquear navegação com toast para erros de campo.",
        "error_style": "text-destructive text-xs mt-1"
      },
      "autosave": {
        "pattern": "Salvar automaticamente ao trocar de passo e exibir estado ‘Salvo agora’ no header (badge leve).",
        "data_testid": "nutrition-form-autosave-status"
      }
    }
  },
  "ai_generation_loading": {
    "duration": "30–60s",
    "experience": {
      "layout": "Tela de geração com card central + skeleton do plano + checklist animado (framer-motion)",
      "copy_ptbr": [
        "‘Estamos montando seu plano personalizado…’",
        "‘Isso pode levar até 1 minuto.’",
        "‘Você pode continuar navegando — avisaremos quando estiver pronto.’ (opcional, se houver background job)"
      ],
      "components": ["skeleton", "progress", "badge"],
      "micro_interactions": [
        "Progresso indeterminado (Progress com value null / shimmer)",
        "Skeleton com shimmer suave (sem brilho agressivo)",
        "Troca de mensagens a cada 6–10s (ex.: ‘Analisando seus objetivos’, ‘Montando cardápio de 7 dias’, ‘Gerando substituições’)"
      ]
    },
    "library": {
      "framer_motion": {
        "install": "npm i framer-motion",
        "usage": "Animar entrada/saída entre passos do formulário e mensagens do loading (fade + slide y pequeno)."
      }
    }
  },
  "markdown_plan_viewer": {
    "rendering": {
      "library_recommendation": {
        "name": "react-markdown + remark-gfm",
        "install": "npm i react-markdown remark-gfm",
        "notes": "Permite tabelas, listas, headings. Usar componentes custom para table/thead/tbody para casar com shadcn Table."
      },
      "styles": {
        "wrapper": "rounded-2xl border border-border bg-white/70 shadow-[var(--shadow-soft)]",
        "content": "prose prose-neutral max-w-none prose-headings:font-[Fraunces] prose-headings:tracking-tight prose-h2:mt-8 prose-p:leading-7 prose-table:my-6",
        "table": "overflow-x-auto rounded-xl border border-border bg-white"
      },
      "toc": {
        "desktop": "sticky top-24",
        "mobile": "collapsible/accordion no topo com ‘Sumário do plano’"
      },
      "actions": {
        "copy": {"label": "Copiar", "data_testid": "plan-copy-button"},
        "download": {"label": "Baixar PDF", "data_testid": "plan-download-button", "note": "Se PDF não estiver pronto no v1, esconder botão ou mostrar ‘Em breve’ desabilitado com tooltip."}
      }
    }
  },
  "images": {
    "image_urls": [
      {
        "category": "landing_hero_background_texture",
        "description": "Textura abstrata orgânica para fundo sutil (usar baixa opacidade como overlay, não como conteúdo principal).",
        "urls": [
          "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG9yZ2FuaWMlMjBzaGFwZXMlMjBtaW5pbWFsJTIwYmFja2dyb3VuZCUyMHRleHR1cmV8ZW58MHx8fHRlYWx8MTc3MDkxODQyOHww&ixlib=rb-4.1.0&q=85",
          "https://images.unsplash.com/photo-1613624193079-bbfce3671d2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMG9yZ2FuaWMlMjBzaGFwZXMlMjBtaW5pbWFsJTIwYmFja2dyb3VuZCUyMHRleHR1cmV8ZW58MHx8fHRlYWx8MTc3MDkxODQyOHww&ixlib=rb-4.1.0&q=85"
        ]
      },
      {
        "category": "landing_supporting_image_optional",
        "description": "Imagem opcional de comida saudável (usar em seção ‘Como funciona’ ou ‘O que você recebe’, nunca como galeria).",
        "urls": [
          "https://images.unsplash.com/photo-1604497198754-a2183225cdc4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGJvd2wlMjBuYXR1cmFsJTIwbGlnaHR8ZW58MHx8fGdyZWVufDE3NzA5MTg0MzJ8MA&ixlib=rb-4.1.0&q=85",
          "https://images.unsplash.com/photo-1577373288412-306dcd07f871?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwyfHxoZWFsdGh5JTIwbWVhbCUyMGJvd2wlMjBuYXR1cmFsJTIwbGlnaHR8ZW58MHx8fGdyZWVufDE3NzA5MTg0MzJ8MA&ixlib=rb-4.1.0&q=85"
        ]
      }
    ]
  },
  "motion_and_microinteractions": {
    "principles": [
      "Transições curtas (180–240ms) e consistentes.",
      "Hover: leve elevação e sombra (cards/CTAs).",
      "Step transitions: fade-in + translateY pequeno (6–10px).",
      "Reduced motion: respeitar prefers-reduced-motion (desativar parallax e animações contínuas)."
    ],
    "landing_micro": {
      "hero": [
        "Parallax muito sutil apenas em shapes/overlays (não no texto)",
        "CTA com hover ‘lift’ e foco visível"
      ]
    },
    "form_micro": [
      "Ao avançar passo, scroll para topo do card automaticamente",
      "Ao salvar autosave, mostrar badge ‘Salvo’ com fade"
    ]
  },
  "accessibility": {
    "requirements": [
      "Labels sempre visíveis (não confiar em placeholder).",
      "Focus ring claro (usar --ring com oceano).",
      "Contraste AA em texto sobre creme/bege.",
      "Campos com erro: aria-invalid + mensagem com role=alert.",
      "Navegação por teclado: ordem lógica, botões fixos acessíveis."
    ]
  },
  "testing_attributes": {
    "rule": "Todos elementos interativos e informativos-chave DEVEM ter data-testid (kebab-case).",
    "examples": [
      "data-testid=\"landing-primary-cta-button\"",
      "data-testid=\"login-form-email-input\"",
      "data-testid=\"dashboard-new-assessment-button\"",
      "data-testid=\"plan-status-badge\"",
      "data-testid=\"plan-markdown-container\""
    ]
  },
  "instructions_to_main_agent": {
    "global_css_cleanup": [
      "Remover/ignorar /frontend/src/App.css (CRA default) ou garantir que não define layout centralizado; não usar .App { text-align:center }.",
      "Atualizar /frontend/src/index.css tokens (:root) para o sistema terroso acima.",
      "Adicionar fonts (Fraunces + DM Sans) via index.html ou @import no CSS (preferir <link rel=preconnect> + <link href=...> para performance)."
    ],
    "tailwind_patterns": [
      "Usar containers com px responsivo e whitespace generoso.",
      "Não aplicar gradient em cards/markdown. Gradiente somente no hero (<=20% viewport).",
      "Não usar transition: all; use transition-colors/shadow/transform específicos."
    ],
    "recommended_new_components_js": [
      {
        "name": "PageShell",
        "purpose": "Layout base (header + container + footer), reutilizado em /app e /app/new",
        "notes": "JS (.jsx), usar shadcn NavigationMenu/Sheet no mobile."
      },
      {
        "name": "FormStepShell",
        "purpose": "Wrapper para cada passo do formulário (título, descrição, grid de campos, navegação sticky)",
        "notes": "Incluir data-testid em progress e botões."
      },
      {
        "name": "PlanMarkdown",
        "purpose": "Renderizar markdown com react-markdown + remark-gfm e mapear para shadcn Table",
        "notes": "Wrapper com ScrollArea e estilos tipo ‘prose’."
      }
    ],
    "libraries": [
      {
        "name": "framer-motion",
        "why": "Transições suaves entre passos e loading de IA",
        "install": "npm i framer-motion"
      },
      {
        "name": "react-markdown + remark-gfm",
        "why": "Renderização de markdown do plano (tabelas, listas) com controle",
        "install": "npm i react-markdown remark-gfm"
      }
    ]
  },
  "general_ui_ux_design_guidelines": [
    "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms",
    "- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text",
    "- NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json",
    "\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc\n",
    "\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead.\n   ",
    "- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n",
    "- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   ",
    "- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n",
    "\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n",
    "\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n",
    "\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n",
    "\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n",
    "\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n",
    "\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals." 
  ]
}
