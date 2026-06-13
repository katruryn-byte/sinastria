// =============================================================================
// prompt-mapa-profissional.js  —  Astralia · Mapa Profissional e Vocacional Premium
// Funde a diretriz operacional (gatilhos/cálculos) com a diretriz completa
// (MC, Quíron, bloqueios, modelo de trabalho, liderança, Nodo).
// -----------------------------------------------------------------------------
// MODELO ALVO: Claude Sonnet 4.6 (claude-sonnet-4-6).
//   (NB: "Sonnet 4.8" não existe; a linha Sonnet atual é a 4.6. Produto de
//    estrutura bem tabelada — Sonnet entrega com folga e a custo baixo.)
// -----------------------------------------------------------------------------
// ORDEM DE OURO — gerar pelo OPERÁRIO, particionado, sem estourar o Vercel:
//   o worker itera as partes e concatena os arrays "secoes":
//     for (const p of ["parte1","parte2","parte3","parte4","parte5","parte6"]) {
//       const prompt = buildPromptProfissional(dados, planetasInfo, casasInfo, aspectosInfo, p);
//       // chama a API (claude-sonnet-4-6), faz JSON.parse, empurra resp.secoes
//     }
//   Cada parte gera 2–5 seções APROFUNDADAS — sem teto de palavras — e cabe no
//   limite de tokens/tempo de uma invocação. NUNCA gerar "completo" em produção.
// -----------------------------------------------------------------------------
// SEM TETO DE PALAVRAS: os níveis são PISOS mínimos a superar, jamais tetos.
// -----------------------------------------------------------------------------
// `dados` esperado (etapa de cálculo preenche; planetasInfo/casasInfo/aspectosInfo
//   são STRINGS já formatadas com os dados reais do mapa, como no Kármico):
//   { nome, data|dataNascimento, hora, cidade|localNascimento,
//     idade, escolaridade, fase,            // fase = Exploração|Construção|Consolidação|Reinvenção|Legado
//     contexto,                              // texto livre do cliente (12 perguntas resumidas)
//     camposAtivos: [ "COMUNICAÇÃO E MÍDIA — indicadores: Mercúrio Casa 3; MC Gêmeos", ... ],
//     multiplasFontes: [ "..." ],            // gatilhos 6.9 ativos (se 3+, indicar pluri-renda)
//     gatilhosMudanca: [ "..." ] }           // gatilhos 6.10 ativos (se contexto indica transição)
// =============================================================================

// --------- TABELAS DE REFERÊNCIA (condensadas; injetadas por parte) ----------

const MC_SIGNO = `MC POR SIGNO — identidade pública, tipo de liderança e campos favorecidos:
Áries: pioneira, decisiva, corajosa; lidera por iniciativa; empreendedorismo, esportes, militar, cirurgia, competição, gestão de crise.
Touro: confiável, de qualidade, sólida; lidera por construção; finanças, gastronomia, beleza, agricultura, imóveis, música, arquitetura.
Gêmeos: comunicadora, versátil, conectora; lidera pela informação; comunicação, jornalismo, educação, tecnologia, vendas, marketing, escrita.
Câncer: cuidadora, intuitiva, acolhedora; lidera pelo cuidado; saúde, psicologia, educação infantil, gastronomia, hotelaria, imóveis, história.
Leão: carismática, criativa, generosa; lidera pelo carisma; artes, cinema, política, educação, liderança, publicidade, moda, joia.
Virgem: precisa, especialista, meticulosa; lidera pela competência; saúde, ciência, análise, tecnologia, produção, logística, editorial, pesquisa.
Libra: diplomática, justa, elegante; lidera pela negociação; direito, diplomacia, design, moda, arte, mediação, relações públicas.
Escorpião: profunda, transformadora, estratégica; lidera pelo poder; psicologia, investigação, medicina, finanças, pesquisa, espiritualidade.
Sagitário: expansiva, filosófica, inspiradora; lidera pela visão; educação, filosofia, viagens, direito, espiritualidade, publicação, esportes.
Capricórnio: estruturada, responsável, autoridade; lidera pela autoridade; administração, política, engenharia, finanças, construção, gestão, governo.
Aquário: inovadora, original, visionária; lidera pela visão de futuro; tecnologia, redes, causas sociais, ciência, astrologia, engenharia.
Peixes: intuitiva, compassiva, artística; lidera pela compaixão; artes, terapia, espiritualidade, cinema, música, saúde holística, cura, caridade.`;

const REGENTE_MC_CASA = `REGENTE DO MC POR CASA — onde a carreira se concretiza na prática:
1: pela própria presença e identidade — o corpo é o instrumento.  2: pelos próprios talentos e recursos — autossuficiência.
3: via comunicação, escrita, ensino, conexão de ideias.  4: ligada ao lar, à família, ao passado — trabalho de raízes.
5: na criatividade, no amor, na expressão pessoal.  6: pelo trabalho cotidiano, serviço e excelência na rotina.
7: nas parcerias — o outro é instrumento de realização.  8: pela transformação — recursos externos e profundidade.
9: pelo ensino, pela viagem, pela expansão intelectual.  10: de forma clássica — pela identidade pública direta.
11: via redes, grupos e causas coletivas.  12: nos bastidores, na espiritualidade, na arte.`;

const SOL_CASA = `SOL POR CASA — o propósito que sustenta a carreira (combustível interno):
1: o propósito é a própria presença — identidade e carreira são uma só.  2: criar recursos e demonstrar valor — alimenta a autoestima.
3: comunicar e aprender — cresce pela palavra e pela mente.  4: cuidar e construir base — raízes no privado.
5: criar e amar — floresce com expressão pessoal.  6: servir com excelência — missão de aprimoramento.
7: o encontro com o outro — cresce por parcerias.  8: transformar — profundidade e recursos externos.
9: expandir e inspirar — expansão de horizontes.  10: a realização pública — a carreira É o propósito, muito visível.
11: servir ao coletivo — contribuição para o futuro.  12: servir no invisível — bastidores ou espiritualidade.`;

const QUIRON = `QUÍRON — a ferida que vira vocação (a carreira que cura os outros passa pela própria ferida):
POR SIGNO (natureza da ferida → dom): Áries iniciativa reprimida→empoderar ação; Touro recursos negados→criar abundância; Gêmeos voz silenciada→comunicar o que importa; Câncer cuidado negado→nutrir e curar; Leão brilho reprimido→inspirar criatividade; Virgem perfeição impossível→servir com excelência; Libra injustiça vivida→criar equilíbrio; Escorpião poder violado→transformar poder; Sagitário fé negada→transmitir sabedoria; Capricórnio autoridade abusiva→liderar com integridade; Aquário exclusão→criar comunidade e inovar; Peixes perda de sentido→curar espiritualmente.
POR CASA (onde opera na carreira): 1 identidade→ajudar outros a se encontrarem; 2 valor próprio→ensinar valor e prosperidade; 3 comunicação→comunicar o que outros não conseguem; 4 família→criar pertencimento; 5 expressão→inspirar criatividade; 6 saúde→curar corpo e rotina; 7 relacional→mediação e orientação em parcerias; 8 transformação→acompanhar crises profundas; 9 fé→orientação espiritual e ensino; 10 reconhecimento→liderança autêntica e orientação vocacional; 11 pertencimento→construir comunidade; 12 espiritual→cura profunda e espiritualidade aplicada.`;

const CASA6_SIGNO = `CASA 6 POR SIGNO — estilo de trabalho cotidiano (o que restaura e o que drena):
Áries: rápida e direta, precisa de desafio — odeia rotina parada.  Touro: lenta e consistente, qualidade — precisa de estabilidade e conforto.
Gêmeos: múltiplas frentes, aprende sempre — odeia monotonia.  Câncer: melhor em ambiente acolhedor — emoção no trabalho.
Leão: precisa de reconhecimento e expressão.  Virgem: metódica, precisa, excelente no detalhe — ambiente organizado.
Libra: melhor com parceiros, ambiente harmonioso.  Escorpião: profunda e focada, trabalha bem sozinha em temas intensos.
Sagitário: precisa de liberdade e propósito — odeia trabalho sem sentido.  Capricórnio: disciplinada, foco em resultado, estruturas claras.
Aquário: inovadora e independente, tecnologia, sem hierarquia rígida.  Peixes: intuitiva e adaptável, precisa de espaço criativo.`;

const CASA2_SIGNO = `CASA 2 POR SIGNO — como o dinheiro chega naturalmente:
Áries: pela iniciativa e ação direta.  Touro: pela qualidade e paciência.  Gêmeos: pela comunicação e multiplicidade (múltiplas fontes).
Câncer: pelo cuidado e pela intuição.  Leão: pela expressão e pelo brilho.  Virgem: pelo serviço e pela excelência.
Libra: pelas parcerias e pela estética.  Escorpião: pela profundidade e transformação (recursos externos, heranças).  Sagitário: pela expansão e pelo ensino.
Capricórnio: pela estrutura e pelo legado (longo prazo).  Aquário: pela inovação e pelas redes.  Peixes: pela intuição e pela arte (serviço espiritual/criativo).`;

const MARTE = `MARTE — estilo de ação e onde a ambição se direciona:
POR SIGNO: Áries direta e impulsiva; Touro lenta e determinada; Gêmeos mental e versátil; Câncer intuitiva e protetora; Leão dramática e generosa; Virgem precisa e metódica; Libra diplomática e colaborativa; Escorpião estratégica e profunda; Sagitário expansiva e entusiasmada; Capricórnio estruturada e disciplinada; Aquário original e independente; Peixes intuitiva e adaptável.
POR CASA: 1 na presença; 2 nos recursos; 3 na comunicação; 4 no lar; 5 na criatividade e no amor; 6 no trabalho e na saúde; 7 nas parcerias; 8 na transformação e na crise; 9 na expansão; 10 na carreira (ambição máxima, liderança); 11 nos grupos; 12 nos bastidores.`;

const JUPITER_CASA = `JÚPITER POR CASA — onde a sorte e a expansão profissional fluem:
1 pela própria presença; 2 financeira; 3 pela comunicação/aprendizado; 4 pelo lar/família; 5 pelo prazer/criatividade; 6 pelo trabalho/saúde; 7 pelas parcerias; 8 pela transformação (investimentos, heranças); 9 A MAIOR SORTE (expansão, ensino, publicação, viagem); 10 profissional (reconhecimento, promoção); 11 pelas redes; 12 no invisível (arte, espiritualidade).`;

const SATURNO_CASA = `SATURNO POR CASA — a lição e o amadurecimento vocacional (escola, não castigo):
1 identidade profissional (demora, mas vai fundo); 2 financeira (dinheiro que exige construção); 3 comunicação (voz com esforço tem mais poder); 4 família×carreira; 5 talento que amadurece com o tempo; 6 trabalho/saúde (o corpo cobra); 7 parcerias que testam e constroem; 8 crises que criam competência; 9 fé testada vira sabedoria; 10 reconhecimento tardio mas sólido; 11 redes que exigem autenticidade; 12 o invisível como escola.`;

const NODO_NORTE = `NODO NORTE — direção evolutiva vocacional (caminho menos familiar, mais significativo):
1 liderança autônoma; 2 construção material e valor; 3 comunicação e aprendizado; 4 cuidado e raízes; 5 criatividade e expressão; 6 serviço e excelência; 7 parcerias e equilíbrio; 8 transformação e profundidade; 9 filosofia, ensino, expansão; 10 autoridade e legado; 11 inovação e comunidade; 12 espiritualidade e compaixão. (O Nodo Sul é o já-pronto: tem dons reais, mas usar SÓ ele é a armadilha.)`;

const ELEMENTO = `PERFIL POR ELEMENTO DOMINANTE (contagem dos 7 planetas pessoais):
Fogo: liderança, iniciativa, inspiração, empreendedorismo, velocidade; monetiza por visibilidade e liderança; risco: projetos sem conclusão.
Terra: construção, qualidade, execução, finanças, praticidade; monetiza por especialização técnica e qualidade premium; risco: resistência à inovação.
Ar: comunicação, conexão, ideias, redes, estratégia, mediação; monetiza por comunicação, ensino e conexão; risco: dispersão, dificuldade de execução.
Água: cuidado, intuição, empatia, profundidade, arte; monetiza por cuidado, criatividade e profundidade; risco: hipersensibilidade ao ambiente, fronteiras difíceis.
Elemento ausente: área de desenvolvimento consciente. Modalidade: Cardinal=iniciar/liderar; Fixo=sustentar/especializar; Mutável=adaptar/transitar.`;

const MODELO_TRABALHO = `MODELO DE TRABALHO IDEAL — indicadores (cruzar com o mapa real):
Autonomia/empreendedorismo: Sol casa 1/10 ou aspecto ao ASC; Marte forte e em liderança; metade superior carregada; Urano/Saturno fortes na 10; MC Áries/Leão/Capricórnio; hemisfério Leste + Cardinal.
Colaboração/equipe: Sol casa 7/11; muito Ar; Vênus forte na 10 ou aspecto MC; Libra/Aquário na 10.
Bastidores/especialização: Sol casa 6/12; Mercúrio/Virgem fortes; muitos planetas em casas cadentes (3,6,9,12).
Liderança pública: Sol casa 10; Leão na 10; Júpiter/Sol forte aspecto MC; muitos planetas angulares (1,4,7,10).`;

const BLOQUEIOS = `BLOQUEIOS DE CARREIRA — citar APENAS os com evidência real no mapa, sempre com origem e quebra:
1 Sabotagem no sucesso — Saturno na 10 tenso, Plutão na 10, Nodo Sul em casa de carreira → medo de ser vista/inveja temida → terapia + estrutura de suporte consciente.
2 Escolha que agrada os outros — Nodo Sul na 10, Saturno na 4 em aspecto ao MC, Lua na 10 → lealdade familiar reprime a vocação → identificar o que escolheria se ninguém assistisse.
3 Medo de visibilidade — planetas na 12 ativando o MC, Netuno na 10, Saturno×Sol tenso → rejeição/humilhação pública → exposição gradual.
4 Subestimação de talentos — Saturno na 10 ou tenso com o Sol, Virgem/Escorpião no MC → inadequação herdada → lista de evidências reais + mentor externo.
5 Dispersão vocacional — MC Gêmeos/Sagitário, Júpiter com muitos planetas, Urano forte → medo de escolher → priorizar o que serve ao Nodo Norte, uma coisa primeiro.
6 Ambiente errado — signo da Casa 6 vs ambiente atual → não reconhecer o ambiente de que precisa → identificar o que ativa o MC vs onde está hoje.`;

const LIDERANCA = `TIPOS DE LIDERANÇA — por indicadores:
Inspiração: Leão na 10/MC, Sol forte, Júpiter na 1/10 → lidera pelo exemplo, entusiasmo e brilho.
Expertise: Capricórnio na 10, Saturno forte, Virgem em liderança → lidera pelo conhecimento e autoridade construída.
Relacionamento: Libra na 10, Vênus forte em posição pública → lidera pela conexão e por unir pessoas.
Transformação: Escorpião na 10, Plutão forte em aspecto ao MC → lidera nas crises.
Visão: Aquário na 10, Urano forte, Sagitário no MC → lidera pelo futuro que enxerga antes.`;

// --------- ESTRUTURA (22 seções fundidas) ----------
const ESTRUTURA_PROFISSIONAL = `ESTRUTURA — 22 seções, nesta ordem (níveis = PISOS mínimos a superar, SEM teto):
1 · Carta inicial — vocação no seu mapa [N1]: vocação × trabalho × carreira × talentos; onde a pessoa está nessa escala; a fase de vida; a questão mais importante do contexto.
2 · Perfil vocacional geral [N2]: síntese de MC + Sol + elemento dominante — o retrato profissional em uma visão integrada.
3 · Identidade pública — o MC [N3]: signo (reputação, como o mundo vê, tipo de liderança, campos), decanato, regente (signo+casa: onde se concretiza), planetas conjuntos ao MC, dignidade e Força Direcional 🐱 do regente, grau especial.
4 · Propósito central — o Sol [N3]: signo+casa; Sol×MC (alinhados/tensos?), Sol×Saturno, Sol×Júpiter; dignidade e Força Direcional 🐱 do Sol; o trabalho atual serve ao propósito?
5 · A ferida que vira vocação — Quíron [N2]: casa (o dom) + signo (a natureza da ferida); Quíron×Nodo Norte; como aparece na carreira atual e o que muda quando integrada.
6 · Talentos naturais [N2]: por elemento dominante e modalidade; o que monetiza melhor; o risco profissional do perfil.
7 · Como você trabalha [N2]: Marte (signo+casa), Casa 6 (estilo cotidiano), hemisférios (público×bastidores | autônomo×relacional) — qual ambiente é o ideal.
8 · Os campos vocacionais de afinidade [N4 — SEÇÃO CENTRAL]: liste TODOS os campos com gatilhos ativos, SEM hierarquia falsa; para cada um, os indicadores reais do mapa e o que essa pessoa faria nele com mais fluência. ESPECIFICIDADE é obrigatória: não "comunicação", mas "podcast de psicologia + escrita terapêutica". Se houver pluri-renda indicada, nomeie as fontes.
9 · Como você ganha dinheiro [N3]: Casa 2 (signo+regente: como o dinheiro chega), Júpiter (onde a sorte flui), Saturno (onde exige disciplina), Casa 8 (recursos externos); múltiplas fontes se indicado.
10 · Habilidades mentais — Mercúrio [N2]: como pensa e comunica; onde a mente gera impacto.
11 · Valores no trabalho — Vênus [N1]: o que valoriza, talentos relacionais/criativos, o que atrai recursos.
12 · Sua sorte profissional — Júpiter [N2]: a casa onde as portas abrem; Força Direcional 🐱; como usar.
13 · Sua lição de carreira — Saturno [N2]: a casa da lição; retrógrado (o crítico interno); Retorno de Saturno (~29/58 anos) se aplicável; o que constrói quando aceita.
14 · Sua reputação profissional [N2]: como chefes, clientes e colegas te percebem; o que pedem naturalmente; o que pode ser subestimado.
15 · Modelo de trabalho ideal [N2]: autônomo / equipe / liderança / bastidores — com os indicadores reais que sustentam.
16 · Bloqueios de carreira [N3]: apenas os com evidência no mapa — origem e quebra de cada um.
17 · Potencial de liderança [N2]: o tipo (inspiração/expertise/relação/transformação/visão) e o que impede de exercê-lo plenamente agora.
18 · Direção evolutiva — Nodo Norte [N2]: o que a alma veio construir profissionalmente; os dons já prontos do Nodo Sul e a armadilha de usar só eles.
19 · Correlação com o momento de vida [N3]: nomeie a fase pela idade; para 15–24 anos, áreas acadêmicas/ENEM indicadas; gatilhos de mudança de carreira, se ativos.
20 · Carreiras e ambientes — o que ativa × o que drena [N3]: 3–5 carreiras CONCRETAS que o mapa favorece + os ambientes onde floresce e onde murcha.
21 · Próximos passos práticos [N2]: 3–5 ações concretas baseadas NESTE mapa (cada uma com o indicador que a sustenta + como implementar + timing).
22 · Mensagem final + aviso legal [N1]: carta pessoal com 2 dados concretos deste mapa; o mapa aponta afinidades, a ação é sempre dela; aviso legal padrão Astralia; cross-sell condicionado — mudança de área→Previsão 18 Meses · teto invisível/karma vocacional→Mapa Kármico · prosperidade no centro→Mapa da Sorte · retrato completo→Mapa Astral · timing do ano→Revolução Solar.`;

const SECOES_POR_PARTE_PROF = {
  completo: [1, 22],
  parte1: [1, 3],    // carta, perfil geral, MC
  parte2: [4, 7],    // Sol, Quíron, talentos, como trabalha
  parte3: [8, 9],    // campos vocacionais (N4) + dinheiro — os mais densos
  parte4: [10, 14],  // Mercúrio, Vênus, Júpiter, Saturno, reputação
  parte5: [15, 18],  // modelo de trabalho, bloqueios, liderança, Nodo
  parte6: [19, 22]   // momento de vida, ambientes, próximos passos, final
};

const CONHECIMENTO_POR_PARTE = {
  parte1: [MC_SIGNO, REGENTE_MC_CASA, ELEMENTO],
  parte2: [SOL_CASA, QUIRON, ELEMENTO, MARTE, CASA6_SIGNO],
  parte3: [CASA2_SIGNO, JUPITER_CASA, SATURNO_CASA],
  parte4: [JUPITER_CASA, SATURNO_CASA, MC_SIGNO],
  parte5: [MODELO_TRABALHO, BLOQUEIOS, LIDERANCA, NODO_NORTE],
  parte6: [],
  completo: [MC_SIGNO, REGENTE_MC_CASA, SOL_CASA, QUIRON, CASA6_SIGNO, CASA2_SIGNO, MARTE, JUPITER_CASA, SATURNO_CASA, NODO_NORTE, ELEMENTO, MODELO_TRABALHO, BLOQUEIOS, LIDERANCA]
};

// --------- BUILDER ----------
function buildPromptProfissional(dados, planetasInfo, casasInfo, aspectosInfo, parte = "completo") {
  const nome = dados.nome || '[NOME]';
  const f = SECOES_POR_PARTE_PROF[parte] || SECOES_POR_PARTE_PROF.completo;
  const ini = f[0], fim = f[1];
  const conhecimento = (CONHECIMENTO_POR_PARTE[parte] || CONHECIMENTO_POR_PARTE.completo).join('\n\n');

  const campos = (dados.camposAtivos || []).map(c => '• ' + c).join('\n') || '(derivar dos dados do mapa abaixo — não inventar)';
  const fontes = (dados.multiplasFontes || []).length
    ? 'INDICADORES DE MÚLTIPLAS FONTES DE RENDA ativos (' + dados.multiplasFontes.length + '): ' + dados.multiplasFontes.join('; ') + (dados.multiplasFontes.length >= 3 ? ' → o mapa INDICA pluri-renda como característica.' : '')
    : '';
  const mudanca = (dados.gatilhosMudanca || []).length
    ? 'INDICADORES DE MUDANÇA DE CARREIRA ativos: ' + dados.gatilhosMudanca.join('; ')
    : '';

  const escopo = parte === "completo"
    ? "Gere TODAS as 22 seções, na ordem, sem agrupar nem resumir."
    : `ESCOPO DESTA GERAÇÃO (sobrepõe qualquer instrução de quantidade): esta é a ${parte}. Gere SOMENTE as seções ${ini} a ${fim} — NÃO gere as demais e NÃO tente cobrir as 22 de uma vez. Como você produz apenas parte do relatório, APROFUNDE AO MÁXIMO cada seção desta faixa: exceda os mínimos, traga mais exemplos concretos, mais correlações entre os indicadores reais e mais nuance. Não economize, não resuma.`;

  return `Você é um astrólogo brasileiro especializado em vocação e psicologia do trabalho, com 30 anos de experiência em como o mapa natal revela talentos, vocação, bloqueios de carreira e o caminho para a realização profissional. Escreve em PORTUGUÊS DO BRASIL, em segunda pessoa, com a calidez da Astralia: íntimo, revelador, prático — nunca vago.

TOM OBRIGATÓRIO — NÃO DETERMINISTA: nunca "você é jornalista" ou "sua profissão é X". Sempre "o mapa aponta forte afinidade com…", "há indicadores de fluência para…", "o campo que mais ressoa com esta configuração é…". Se há múltiplas afinidades, indique TODAS — sem hierarquia falsa, sem escolher pela pessoa. A concretização é sempre escolha e ação dela.

ESPECIFICIDADE É RESPEITO: "vocação para comunicação" é fraco; "coach de liderança, podcast educativo, professora de [área]" é premium. Sempre que indicar um campo, aterrisse em carreiras concretas. Seja honesto sobre bloqueios SEM desmotivar — todo bloqueio vem com origem e caminho de quebra. Em saúde (Casa 6), fale de tendência e cuidado, nunca diagnóstico. Use "Força Direcional 🐱" (jamais o termo técnico sânscrito). Cruze SEMPRE com a idade e a fase de vida.

NUNCA invente posições — use APENAS os dados reais abaixo.

=== DADOS REAIS DE ${nome.toUpperCase()} ===
Nascimento: ${dados.data || dados.dataNascimento || '[DATA]'}${dados.hora ? ' às ' + dados.hora : ''} · ${dados.cidade || dados.localNascimento || '[LOCAL]'}
Idade: ${dados.idade || '[IDADE]'}${dados.fase ? ' · Fase de vida: ' + dados.fase : ''}${dados.escolaridade ? ' · Escolaridade: ' + dados.escolaridade : ''}
${dados.contexto ? 'Contexto profissional do cliente: ' + dados.contexto : ''}

${planetasInfo}

${casasInfo}

${aspectosInfo}

CAMPOS VOCACIONAIS COM GATILHOS ATIVOS (desenvolva todos na seção 8, sem hierarquia):
${campos}
${fontes ? '\n' + fontes : ''}${mudanca ? '\n' + mudanca : ''}

=== TABELAS DE REFERÊNCIA (cruze com os dados reais; não copie verbatim) ===
${conhecimento}

${ESTRUTURA_PROFISSIONAL}

=== INSTRUÇÕES DE SAÍDA ===
${escopo}

Escreva uma leitura profundamente personalizada do Mapa Profissional e Vocacional de ${nome}, em prosa rica e em segunda pessoa, citando SEMPRE o signo, a casa e o grau reais de cada indicador (MC, regente, Sol, Marte, Mercúrio, Júpiter, Saturno, Quíron, Nodo), as dignidades e a Força Direcional 🐱 quando couber, e os aspectos reais com o orbe — correlacionando os posicionamentos entre si. Conecte tudo ao contexto e à fase de vida da pessoa. Para clientes de 15–24 anos, inclua orientação de área acadêmica/ENEM na seção 19; caso contrário, omita esse tema. Nunca determinista, nunca genérico: afinidade, indicadores, fluência.

Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON:
{
  "secoes": [
    {"titulo": "Título da seção (cite signo/casa/grau quando couber)", "texto": "vários parágrafos ricos e personalizados"}
  ]
}`;
}

module.exports = {
  buildPromptProfissional,
  SECOES_POR_PARTE_PROF,
  CONHECIMENTO_POR_PARTE,
  ESTRUTURA_PROFISSIONAL,
  MC_SIGNO, REGENTE_MC_CASA, SOL_CASA, QUIRON, CASA6_SIGNO, CASA2_SIGNO,
  MARTE, JUPITER_CASA, SATURNO_CASA, NODO_NORTE, ELEMENTO,
  MODELO_TRABALHO, BLOQUEIOS, LIDERANCA
};
