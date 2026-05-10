// ============================================================
// ASTRO CONFIG — Configurações da FreeAstrology API
// Repositório central de configurações astrológicas
// ============================================================

// Planetas principais para Mapa Astral Natal
const PLANETAS_PRINCIPAIS = [
  'Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'MC'
];

// Planetas estendidos (para Leitura Personalizada e Mapa Kármico)
const PLANETAS_ESTENDIDOS = [
  'Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'MC',
  'Lilith', 'Chiron', 'True Node', 'Mean Node', 'IC', 'Descendant'
];

// Nodos e pontos kármicos
const PLANETAS_KARMICOS = [
  'Ascendant', 'Sun', 'Moon', 'Saturn', 'Pluto',
  'True Node', 'Mean Node', 'Chiron', 'Lilith', 'IC', 'MC'
];

// Configuração base da API
const API_CONFIG_BASE = {
  observation_point: 'topocentric',
  ayanamsha: 'tropical',
  language: 'pt'
};

// Configuração para casas
const API_CONFIG_CASAS = {
  ...API_CONFIG_BASE,
  house_system: 'Placidus'
};

// Configuração para aspectos
const API_CONFIG_ASPECTOS = {
  ...API_CONFIG_BASE,
  allowed_aspects: ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile', 'Quincunx'],
  orb_values: {
    Conjunction: 8, Opposition: 8, Trine: 8,
    Square: 8, Sextile: 6, Quincunx: 5
  }
};

// Configuração para mandala (natal-wheel-chart)
const API_CONFIG_MANDALA = {
  ...API_CONFIG_BASE,
  house_system: 'Placidus',
  exclude_planets: [],
  allowed_aspects: ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile', 'Quincunx'],
  aspect_line_colors: {
    Conjunction: '#c9a84c',
    Opposition: '#a07fff',
    Trine: '#90c0e0',
    Square: '#e07060',
    Sextile: '#90d0a0',
    Quincunx: '#f0c080'
  },
  wheel_chart_colors: {
    zodiac_sign_background_color: '#1c0e40',
    chart_background_color: '#06030e',
    zodiac_signs_text_color: '#f0d080',
    dotted_line_color: '#c9a84c',
    planets_icon_color: '#e5d0ff'
  },
  orb_values: {
    Conjunction: 8, Opposition: 8, Trine: 8,
    Square: 8, Sextile: 6, Quincunx: 5
  }
};

// Traduções
const PLANETA_PT = {
  'Sun': 'Sol', 'Moon': 'Lua', 'Mercury': 'Mercúrio', 'Venus': 'Vênus',
  'Mars': 'Marte', 'Jupiter': 'Júpiter', 'Saturn': 'Saturno',
  'Uranus': 'Urano', 'Neptune': 'Netuno', 'Pluto': 'Plutão',
  'Ascendant': 'Ascendente', 'MC': 'Meio do Céu', 'IC': 'Fundo do Céu',
  'Descendant': 'Descendente', 'Chiron': 'Quíron', 'Lilith': 'Lilith',
  'True Node': 'Nodo Norte (Verdadeiro)', 'Mean Node': 'Nodo Norte (Médio)',
  'Ceres': 'Ceres', 'Vesta': 'Vesta', 'Juno': 'Juno', 'Pallas': 'Palas'
};

const SIGNO_PT = {
  'Aries': 'Áries', 'Taurus': 'Touro', 'Gemini': 'Gêmeos',
  'Cancer': 'Câncer', 'Leo': 'Leão', 'Virgo': 'Virgem',
  'Libra': 'Libra', 'Scorpio': 'Escorpião', 'Sagittarius': 'Sagitário',
  'Capricorn': 'Capricórnio', 'Aquarius': 'Aquário', 'Pisces': 'Peixes'
};

const CASA_TEMAS = {
  1: 'Identidade, aparência e começos',
  2: 'Recursos, finanças e valores pessoais',
  3: 'Comunicação, mente e irmãos',
  4: 'Lar, família e raízes',
  5: 'Criatividade, amor e filhos',
  6: 'Saúde, trabalho e rotina',
  7: 'Relacionamentos, parcerias e casamento',
  8: 'Transformação, sexualidade e heranças',
  9: 'Filosofia, espiritualidade e viagens longas',
  10: 'Carreira, reputação e propósito público',
  11: 'Amizades, grupos e sonhos coletivos',
  12: 'Espiritualidade profunda, karma e isolamento'
};

const ASPECTO_PT = {
  'Conjunction': 'Conjunção', 'Opposition': 'Oposição',
  'Trine': 'Trígono', 'Square': 'Quadratura',
  'Sextile': 'Sextil', 'Quincunx': 'Quincúncio'
};

const ASPECTO_DESC = {
  'Conjunction': 'fusão e intensificação de energias',
  'Opposition': 'polaridade criativa que pede integração',
  'Trine': 'fluxo harmonioso e dons naturais',
  'Square': 'tensão transformadora que impulsiona crescimento',
  'Sextile': 'oportunidade suave que favorece expansão',
  'Quincunx': 'ajuste necessário entre energias distintas'
};

// ============================================================
// PROMPTS POR PRODUTO
// ============================================================

function buildPromptMapaAstral(dados, planetasInfo, casasInfo, aspectosInfo) {
  return `Você é uma astróloga brasileira profissional com 30 anos de experiência. 
Use linguagem eloquente, poética, inspiradora e profunda em PORTUGUÊS DO BRASIL.
Personalize cada interpretação usando o nome ${dados.nome}.
NUNCA invente dados — use APENAS as posições reais fornecidas abaixo.

=== DADOS REAIS DO MAPA DE ${dados.nome.toUpperCase()} ===
Data de nascimento: ${dados.data}${dados.hora ? ' às ' + dados.hora : ''}
Cidade: ${dados.cidade}

${planetasInfo}

${casasInfo}

${aspectosInfo}

=== INSTRUÇÕES ===
Gere uma leitura COMPLETA do Mapa Astral Natal com MÍNIMO 10 seções ricas.
Para cada planeta, mencione OBRIGATORIAMENTE: o signo E a casa em que está.
Interprete os aspectos principais como dinâmicas reais da personalidade.
Use os temas das casas para contextualizar cada interpretação.

Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON:
{
  "secoes": [
    {"titulo": "☉ Essência Solar — Sol em [SIGNO] na Casa [N]", "texto": "6 frases profundas e personalizadas"},
    {"titulo": "☽ Universo Emocional — Lua em [SIGNO] na Casa [N]", "texto": "5 frases sobre emoções e necessidades"},
    {"titulo": "↑ Ascendente em [SIGNO] — A Máscara e o Caminho", "texto": "5 frases sobre a jornada de vida"},
    {"titulo": "☿ Mente e Comunicação — Mercúrio em [SIGNO] na Casa [N]", "texto": "4 frases sobre pensamento e expressão"},
    {"titulo": "♀ Amor e Valores — Vênus em [SIGNO] na Casa [N]", "texto": "5 frases sobre vida afetiva"},
    {"titulo": "♂ Força e Ação — Marte em [SIGNO] na Casa [N]", "texto": "4 frases sobre energia e motivação"},
    {"titulo": "♃ Expansão e Abundância — Júpiter em [SIGNO] na Casa [N]", "texto": "4 frases sobre crescimento e sorte"},
    {"titulo": "♄ Lições e Estrutura — Saturno em [SIGNO] na Casa [N]", "texto": "4 frases sobre desafios e maturidade"},
    {"titulo": "⚡ Aspectos Centrais do Mapa", "texto": "5 frases sobre as principais dinâmicas planetárias"},
    {"titulo": "🏠 As Casas que Definem Sua Jornada", "texto": "5 frases sobre as áreas de vida mais ativadas"},
    {"titulo": "✦ Mensagem dos Astros para ${dados.nome}", "texto": "5 frases profundamente inspiradoras e personalizadas"}
  ]
}`;
}

function buildPromptRevolucaoSolar(dados, planetasInfo, casasInfo, ano) {
  return `Astróloga profissional com 30 anos de experiência. PORTUGUÊS DO BRASIL.
Use linguagem poética e inspiradora. Personalize com o nome ${dados.nome}.
NUNCA invente dados — use APENAS as posições reais abaixo.

=== REVOLUÇÃO SOLAR ${ano} DE ${dados.nome.toUpperCase()} ===
Data natal: ${dados.data}
Cidade da RS: ${dados.cidadeRS || dados.cidade}

${planetasInfo}
${casasInfo}

Responda APENAS com JSON válido:
{
  "secoes": [
    {"titulo": "☉ O Tom Cósmico de ${ano}", "texto": "6 frases sobre a energia central do ano"},
    {"titulo": "🏠 O Ascendente da RS — O Palco do Ano", "texto": "5 frases sobre o foco principal"},
    {"titulo": "☽ Paisagem Emocional do Ano", "texto": "4 frases sobre o mundo interior"},
    {"titulo": "♀ Amor e Relacionamentos em ${ano}", "texto": "5 frases sobre vida afetiva"},
    {"titulo": "♃ Expansão e Oportunidades", "texto": "4 frases sobre crescimento"},
    {"titulo": "♄ Desafios e Aprendizados", "texto": "4 frases sobre lições do ano"},
    {"titulo": "◷ Previsão Mês a Mês", "texto": "Previsão detalhada dos 12 meses com os principais temas e acontecimentos de cada mês"},
    {"titulo": "✦ Mensagem para ${dados.nome} em ${ano}", "texto": "5 frases inspiradoras"}
  ]
}`;
}

function buildPromptSinastria(dados, planetasInfo1, planetasInfo2) {
  return `Astróloga especialista em relacionamentos. PORTUGUÊS DO BRASIL.
Linguagem poética e profunda. Use os nomes ${dados.nome} e ${dados.nome2 || 'parceiro(a)'}.

=== SINASTRIA: ${dados.nome.toUpperCase()} E ${(dados.nome2 || 'PARCEIRO(A)').toUpperCase()} ===
${dados.nome}: nascido(a) em ${dados.data}${dados.hora ? ' às ' + dados.hora : ''} em ${dados.cidade}
${dados.nome2 || 'Parceiro(a)'}: nascido(a) em ${dados.data2}${dados.hora2 ? ' às ' + dados.hora2 : ''}

${planetasInfo1}
${planetasInfo2}

Responda APENAS com JSON válido:
{
  "secoes": [
    {"titulo": "💕 A Tapeçaria do Encontro", "texto": "6 frases sobre a natureza da conexão"},
    {"titulo": "☉ A Dança dos Sóis", "texto": "5 frases sobre como as essências se relacionam"},
    {"titulo": "☽ Ressonância Emocional", "texto": "5 frases sobre compatibilidade emocional"},
    {"titulo": "♀ Linguagens do Amor", "texto": "5 frases sobre como cada um ama e recebe amor"},
    {"titulo": "♂ Magnetismo e Tensão", "texto": "4 frases sobre atração e conflitos"},
    {"titulo": "♃♄ Crescimento Conjunto", "texto": "4 frases sobre expansão e lições mútuas"},
    {"titulo": "⚡ Aspectos Centrais da Sinastria", "texto": "5 frases sobre as dinâmicas mais importantes"},
    {"titulo": "✦ Mensagem para o Casal", "texto": "5 frases inspiradoras sobre o potencial da união"}
  ]
}`;
}

function buildPromptProfissional(dados, planetasInfo, casasInfo) {
  return `Astróloga especialista em vocação e carreira. PORTUGUÊS DO BRASIL.
Linguagem inspiradora e prática. Use o nome ${dados.nome}.
NUNCA invente dados — use APENAS as posições reais abaixo.

=== MAPA PROFISSIONAL DE ${dados.nome.toUpperCase()} ===
Data: ${dados.data}${dados.hora ? ' às ' + dados.hora : ''} em ${dados.cidade}

${planetasInfo}
${casasInfo}

Responda APENAS com JSON válido:
{
  "secoes": [
    {"titulo": "💼 Os Dons que o Cosmos Concedeu a ${dados.nome}", "texto": "6 frases sobre talentos naturais"},
    {"titulo": "☉ Identidade Profissional — Sol na Casa [N]", "texto": "5 frases sobre expressão no trabalho"},
    {"titulo": "🏠 Casa 10 — O Palco da Carreira", "texto": "5 frases sobre missão pública e reputação"},
    {"titulo": "☿ Mente e Habilidades", "texto": "4 frases sobre competências comunicativas"},
    {"titulo": "♃ Expansão e Abundância Profissional", "texto": "5 frases sobre oportunidades e crescimento"},
    {"titulo": "♄ Estrutura e Legado", "texto": "4 frases sobre construção de longo prazo"},
    {"titulo": "🎯 Áreas Profissionais Mais Alinhadas", "texto": "Descreva as carreiras e áreas mais alinhadas com este mapa, sendo específico e prático"},
    {"titulo": "✦ Mensagem de Propósito para ${dados.nome}", "texto": "5 frases transformadoras sobre vocação"}
  ]
}`;
}

function buildPromptKarmico(dados, planetasInfo, casasInfo) {
  return `Astróloga especialista em astrologia kármica e espiritualidade. PORTUGUÊS DO BRASIL.
Linguagem mística, profunda e inspiradora. Use o nome ${dados.nome}.
NUNCA invente dados — use APENAS as posições reais abaixo.

=== MAPA KÁRMICO DE ${dados.nome.toUpperCase()} ===
Data: ${dados.data}${dados.hora ? ' às ' + dados.hora : ''} em ${dados.cidade}

${planetasInfo}
${casasInfo}

Responda APENAS com JSON válido:
{
  "secoes": [
    {"titulo": "🔮 A Missão da Alma de ${dados.nome}", "texto": "6 frases sobre propósito kármico"},
    {"titulo": "☊ Nodo Norte — O Caminho a Percorrer", "texto": "5 frases sobre o que veio aprender nesta vida"},
    {"titulo": "☋ Nodo Sul — Memórias da Alma", "texto": "5 frases sobre heranças de outras existências"},
    {"titulo": "♄ Saturno — As Lições Sagradas", "texto": "5 frases sobre desafios kármicos a superar"},
    {"titulo": "⚷ Quíron — A Ferida que Cura", "texto": "4 frases sobre a ferida e o dom da cura"},
    {"titulo": "⚸ Lilith — O Poder Sombrio", "texto": "4 frases sobre poder reprimido e autenticidade"},
    {"titulo": "⟳ Padrões a Transmutar", "texto": "5 frases sobre padrões kármicos e transformações"},
    {"titulo": "🌟 Dons Espirituais Trazidos", "texto": "4 frases sobre talentos da alma"},
    {"titulo": "✦ Mensagem da Alma para ${dados.nome}", "texto": "5 frases profundamente espirituais e inspiradoras"}
  ]
}`;
}

function buildPromptPersonalizada(dados, planetasInfo, casasInfo, aspectosInfo) {
  return `Você é a mais experiente astróloga do Brasil, com 30 anos de prática clínica em astrologia.
Use linguagem profundamente poética, mística e transformadora em PORTUGUÊS DO BRASIL.
Esta é a leitura mais completa e profunda que você já fez — cada seção deve ser rica, detalhada e personalizada para ${dados.nome}.
NUNCA invente dados — use APENAS as posições reais fornecidas abaixo.

=== LEITURA PERSONALIZADA PREMIUM DE ${dados.nome.toUpperCase()} ===
Data de nascimento: ${dados.data}${dados.hora ? ' às ' + dados.hora : ''}
Cidade: ${dados.cidade}

${planetasInfo}
${casasInfo}
${aspectosInfo}

INSTRUÇÕES ESPECIAIS:
- Mínimo de 12 seções com pelo menos 7 frases cada
- Mencione SEMPRE o signo E a casa de cada planeta
- Inclua previsão detalhada de 18 meses (mês a mês)
- Seja extremamente específico e personalizado

Responda APENAS com JSON válido:
{
  "secoes": [
    {"titulo": "✨ O Céu no Momento do Seu Nascimento", "texto": "8 frases sobre o panorama geral do mapa"},
    {"titulo": "☉ Identidade Solar — Sol em [SIGNO] na Casa [N]", "texto": "8 frases profundas sobre essência e propósito"},
    {"titulo": "☽ Universo Emocional — Lua em [SIGNO] na Casa [N]", "texto": "7 frases sobre mundo interior e necessidades"},
    {"titulo": "↑ Ascendente em [SIGNO] — A Jornada do Ser", "texto": "7 frases sobre caminho de vida e aparência"},
    {"titulo": "♀ Amor Profundo — Vênus em [SIGNO] na Casa [N]", "texto": "7 frases sobre vida afetiva e valores"},
    {"titulo": "♂ Força e Desejo — Marte em [SIGNO] na Casa [N]", "texto": "6 frases sobre energia, ação e sexualidade"},
    {"titulo": "☿ Mente Criativa — Mercúrio em [SIGNO] na Casa [N]", "texto": "6 frases sobre pensamento e comunicação"},
    {"titulo": "♃♄ Expansão e Karma — Júpiter e Saturno", "texto": "7 frases sobre crescimento e lições de vida"},
    {"titulo": "⚷☋ Quíron e Nodos — A Alma em Jornada", "texto": "6 frases sobre feridas, missão e karma"},
    {"titulo": "⚡ Aspectos que Definem Sua Personalidade", "texto": "7 frases sobre as dinâmicas mais poderosas do mapa"},
    {"titulo": "🏠 As 12 Casas — Todas as Áreas da Sua Vida", "texto": "Interpretação de cada área de vida ativada pelas posições planetárias"},
    {"titulo": "💫 Previsão dos Próximos 18 Meses", "texto": "Previsão detalhada mês a mês dos próximos 18 meses com os principais temas, oportunidades e desafios de cada período"},
    {"titulo": "🌟 Síntese do Mapa — Quem Você Veio Ser", "texto": "8 frases sintetizando os temas mais importantes"},
    {"titulo": "✦ Mensagem Estelar para ${dados.nome}", "texto": "8 frases profundamente inspiradoras e transformadoras"}
  ]
}`;
}

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

function formatarPlanetasParaPrompt(planetas, casas, listaPlanetas) {
  if (!planetas || !planetas.length) return '';
  
  let texto = '🪐 POSIÇÕES PLANETÁRIAS REAIS:\n';
  
  planetas
    .filter(p => listaPlanetas.includes(p.planet?.en))
    .forEach(item => {
      const nome = PLANETA_PT[item.planet?.en] || item.planet?.en || '';
      const signo = SIGNO_PT[item.zodiac_sign?.name?.en] || item.zodiac_sign?.name?.en || '';
      const grau = item.normDegree ? item.normDegree.toFixed(1) + '°' : '';
      const retro = (item.isRetro === 'True' || item.isRetro === true) ? ' (Retrógrado)' : '';
      const casa = item.casaNum ? ` | Casa ${item.casaNum} (${CASA_TEMAS[item.casaNum] || ''})` : '';
      texto += `• ${nome}: ${signo} ${grau}${retro}${casa}\n`;
    });
  
  return texto;
}

function formatarCasasParaPrompt(casas) {
  if (!casas || !casas.Houses) return '';
  
  let texto = '\n🏠 CASAS ASTROLÓGICAS (Sistema Placidus):\n';
  casas.Houses.forEach(casa => {
    const signo = SIGNO_PT[casa.zodiac_sign?.name?.en] || casa.zodiac_sign?.name?.en || '';
    const grau = casa.normDegree ? casa.normDegree.toFixed(1) + '°' : '';
    const tema = CASA_TEMAS[casa.House] || '';
    texto += `• Casa ${casa.House} (${tema}): ${signo} ${grau}\n`;
  });
  
  return texto;
}

function formatarAspectosParaPrompt(aspectos) {
  if (!aspectos || !aspectos.length) return '';
  
  let texto = '\n⚡ ASPECTOS PRINCIPAIS:\n';
  aspectos.slice(0, 15).forEach(item => {
    const p1 = PLANETA_PT[item.planet_1?.en] || item.planet_1?.en || '';
    const p2 = PLANETA_PT[item.planet_2?.en] || item.planet_2?.en || '';
    const asp = ASPECTO_PT[item.aspect?.en] || item.aspect?.en || '';
    const desc = ASPECTO_DESC[item.aspect?.en] || '';
    texto += `• ${p1} ${asp} ${p2} — ${desc}\n`;
  });
  
  return texto;
}

function calcularCasaDoPlaneta(fullDegree, houses) {
  if (!houses || !houses.length) return 1;
  for (let i = 0; i < houses.length; i++) {
    const proxIdx = (i + 1) % 12;
    const inicio = houses[i].degree;
    const fim = houses[proxIdx].degree;
    if (fim > inicio) {
      if (fullDegree >= inicio && fullDegree < fim) return houses[i].House;
    } else {
      if (fullDegree >= inicio || fullDegree < fim) return houses[i].House;
    }
  }
  return 1;
}

module.exports = {
  PLANETAS_PRINCIPAIS,
  PLANETAS_ESTENDIDOS,
  PLANETAS_KARMICOS,
  API_CONFIG_BASE,
  API_CONFIG_CASAS,
  API_CONFIG_ASPECTOS,
  API_CONFIG_MANDALA,
  PLANETA_PT,
  SIGNO_PT,
  CASA_TEMAS,
  ASPECTO_PT,
  ASPECTO_DESC,
  buildPromptMapaAstral,
  buildPromptRevolucaoSolar,
  buildPromptSinastria,
  buildPromptProfissional,
  buildPromptKarmico,
  buildPromptPersonalizada,
  formatarPlanetasParaPrompt,
  formatarCasasParaPrompt,
  formatarAspectosParaPrompt,
  calcularCasaDoPlaneta
};
