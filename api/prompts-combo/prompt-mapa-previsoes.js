// =============================================================================
// prompt-mapa-previsoes.js  —  Astralia · Mapa de Previsões 18 Meses (Super Premium)
// v2 — AMPLIADO. Funde a diretriz Super Premium (8 camadas) + 9ª camada própria:
//   PROFECÇÃO MENSAL (senhor do mês) — cada um dos 18 capítulos ganha um planeta
//   regente que o colore (time-lord mensal helenístico, derivado da profecção anual).
//   + rituais nos meses cruciais + guia de ação por mês + elucidação reforçada.
//   Voz da Lilith adaptada às previsões: íntima, reveladora, premonitória, quase
//   profética — nunca determinista, nunca catastrófica.
// -----------------------------------------------------------------------------
// MODELO ALVO: Claude Sonnet 4.6 (claude-sonnet-4-6).
// -----------------------------------------------------------------------------
// ORDEM DE OURO — gerar pelo OPERÁRIO, particionado, sem estourar o Vercel.
//   O worker itera as 5 partes e concatena os arrays "secoes":
//     for (const p of ["parte1","parte2","parte3","parte4","parte5"]) {
//       const prompt = buildPromptPrevisoes(dados, planetasInfo, casasInfo, aspectosInfo, p);
//       // chama a API (claude-sonnet-4-6), JSON.parse, empurra resp.secoes
//     }
//   parte1 = Panorama + As 9 Camadas · parte2 = meses 1–6 · parte3 = meses 7–12 ·
//   parte4 = meses 13–18 · parte5 = Áreas de Vida + Momentos + Mensagem Final.
//   NUNCA gerar "completo" em produção (18 capítulos numa invocação = estouro).
// -----------------------------------------------------------------------------
// SEM TETO DE PALAVRAS: os pisos são mínimos a SUPERAR, jamais tetos. Não resumir.
// -----------------------------------------------------------------------------
// COPYRIGHT: a técnica astrológica e os fatos astronômicos são de domínio comum —
//   as fases da Lua, o significado de signos/planetas/aspectos, datas/graus de
//   eclipses, retrógrados e lunações NÃO pertencem a ninguém. O que é protegido é
//   o TEXTO de um autor. Por isso: nenhum texto de obra de terceiros entra aqui;
//   todas as tabelas deste arquivo são interpretação astrológica geral redigida na
//   voz da Astralia. Datas/graus devem chegar da etapa de cálculo com efeméride
//   PRECISA (de fonte astronômica padrão), não das tabelas aproximadas da diretriz.
// -----------------------------------------------------------------------------
// `dados` esperado (a etapa de cálculo preenche):
//   { nome, data|dataNascimento, hora, cidade|localNascimento, idade,
//     periodoInicio, periodoFim, contexto,
//     progressoes: { luaProgSigno, luaProgCasa, luaProgMuda, solProgSigno, solProgMuda,
//                    solarArcInicio, solarArcFim, saAspectos:[ "SA MC conj Sol natal (mês 9)" ] },
//     camadas: { transitosChave:[ "Saturno entra Casa 10 em mar/2027 (~2,5 anos)" ],
//                eclipsesAtivos:[ "Eclipse Solar 20°01' Leão sobre MC natal (mês 3)" ],
//                profeccaoCasa, senhorAno, senhorAnoPos, rsNoPeriodo, rsResumo, rsMesAniversario },
//     picos: { positivo, desafiador, transformacao, janelaAmor, janelaCarreira, janelaFinanceira, recolhimento },
//     momentos: [ "..." ],                    // 5 momentos mais importantes, cronológicos
//     meses: [ { numero, mesAno, classificacao, pontuacao,
//                profeccaoMensalCasa, senhorMes,       // <-- CAMADA 9 (vem do cálculo)
//                aniversarioNoMes: false,              // marca o mês do aniversário (RS)
//                transitos: "Júpiter Casa 9; Saturno Casa 6; Marte Casa 3",
//                aspectos: "Júpiter trígono Sol natal (orbe 1,2°)",
//                eclipse: "" , retrogrado: "Mercúrio Rx Casa 7 (12–30)",
//                luaNova: "Lua Nova Áries Casa 1 — dia 16",
//                luaCheia: "Lua Cheia Libra Casa 7 — dia 2 (Superlua)",
//                luaProg: "Touro Casa 2", gatilhos:[ "[AMOR] Vênus trânsito Casa 7" ] }, ... 18 ] }
// =============================================================================

// ---------------- TABELAS INTERPRETATIVAS (condensadas, por parte) -----------

const JUPITER_T = `JÚPITER EM TRÂNSITO POR CASA NATAL — o que o céu ABRE:
1 presença magnética, novos começos, saúde radiante; 2 abundância, renda, valorização de talentos; 3 comunicação, cursos, publicações, viagens curtas; 4 lar que cresce, família, mudança de casa; 5 romance, criatividade, prazer, filhos; 6 novo emprego/função, melhora de saúde, rotina que flui; 7 parceria que se expande, novo amor, contratos; 8 recursos externos, investimento, transformação que liberta; 9 A MELHOR — expansão máxima, viagem, ensino, fé, publicação; 10 promoção, reconhecimento, carreira que decola; 11 redes que multiplicam, sonhos que se concretizam; 12 expansão espiritual, retiro fértil, arte.`;

const SATURNO_T = `SATURNO EM TRÂNSITO POR CASA NATAL — o que o céu COBRA (escola, não castigo):
1 identidade em teste, o corpo pede cuidado; 2 disciplina financeira, corte de despesas; 3 comunicação com consequências, contratos com peso; 4 família para resolver, lar como responsabilidade; 5 amor/criação que exigem maturidade; 6 saúde e rotina que cobram, o corpo fala; 7 parcerias testadas — mostram solidez ou limite; 8 transformação inevitável, o que não dura é encerrado; 9 crenças testadas, expansão que pede fundação; 10 maior responsabilidade, reconhecimento tardio mas sólido; 11 redes que mostram autenticidade; 12 inconsciente que cobra, recolhimento necessário.`;

const MARTE_T = `MARTE EM TRÂNSITO POR CASA NATAL — energia e ação (~2 meses):
1 presença e impulso máximos, possível impaciência; 2 luta pelos recursos, conflito sobre dinheiro; 3 mente acelerada, disputas verbais; 4 reforma, conflito ou ação doméstica; 5 paixão, criatividade e romance intensos; 6 trabalho intenso, cuidado com excesso e inflamação; 7 conflito ou paixão na parceria; 8 desejo intenso, coragem para crises; 9 ambição de crescer, aventura, viagem; 10 ambição profissional no pico, liderança; 11 energia em grupos e causas; 12 ação nos bastidores, possível fadiga.`;

const ASPECTOS_T = `ASPECTOS CRÍTICOS DE TRÂNSITO — parâmetros:
Júpiter conj Sol: expansão de identidade, o maior impulso pessoal (~3 sem). Júpiter conj Lua: abundância emocional. Júpiter conj Vênus: amor + dinheiro, o mês mais favorável. Júpiter conj MC: a carreira se abre. Júpiter conj ASC: o mês que mais brilha. Júpiter quad/op Sol: crescimento que exige esforço.
Saturno conj Sol: o MAIOR teste de identidade — o que não é autêntico cai. Saturno conj Lua: emoção testada, possível isolamento. Saturno conj Vênus: amor que exige maturidade. Saturno quad Sol/Lua: crise produtiva, emoção que pede integração.
Urano conj/quad/op natal: ruptura inesperada que liberta. Netuno conj Vênus: romance idealizado ou ilusório. Netuno conj Sol: identidade difusa, busca espiritual. Plutão conj Sol: morte e renascimento do eu. Plutão conj Lua: limpeza emocional. Plutão conj Vênus: amor que transforma tudo. Marte conj MC: mês de ação profissional. Marte conj ASC: início corajoso, energia máxima.`;

const ECLIPSE_T = `ECLIPSES — parâmetros (cada eclipse ativo merece parágrafo próprio):
Solar sobre planeta natal: abertura, novo capítulo. Lunar sobre planeta natal: conclusão e revelação, o oculto vem à tona.
Sobre ASC: novo ciclo de identidade. Sobre MC: novo ciclo de carreira (o mais importante para o profissional). Sobre Sol: renovação de propósito. Sobre Lua: novo capítulo emocional/familiar. Sobre Vênus: novo capítulo no amor.
Eclipse em quadratura: tensão e ajuste. Em oposição: o outro lado pede integração. Efeito: até 6 meses antes e 6 depois.`;

const MERCURIO_RX = `MERCÚRIO RETRÓGRADO POR CASA NATAL (revisar, não iniciar; evitar contratos/compras/lançamentos):
1 revisão de identidade; 2 finanças, contas, valores; 3 e-mails, contratos, conversas; 4 família, lar; 5 romance, projetos criativos; 6 trabalho, saúde, rotina; 7 parcerias, contratos; 8 finanças compartilhadas, dívidas; 9 crenças, viagens; 10 carreira, reputação; 11 amizades, grupos; 12 o oculto.`;

const LUA_PROG = `LUA PROGRESSADA POR SIGNO — humor emocional dominante do período:
Áries urgência e impulso (age antes de sentir); Touro precisa de ancoragem e constância; Gêmeos processa pela palavra, instável; Câncer MÁXIMA sensibilidade, intuição no pico; Leão precisa de ser vista e amada, coração aberto; Virgem analisa e se autocritica, cuidado com a ruminação; Libra precisa do outro e da harmonia; Escorpião intensidade e transformação, cura profunda; Sagitário expansão e otimismo, quer liberdade; Capricórnio contém e amadurece pelo trabalho; Aquário distancia para processar com originalidade; Peixes hipersensível, intuição máxima, limites difusos (cuidado com o que absorve). Quando muda de signo no período: virada emocional — um dos eventos mais importantes.`;

// ---- CAMADA 9: SENHOR DO MÊS (profecção mensal) ----
const SENHOR_MES = `SENHOR DO MÊS (Profecção Mensal — o regente que colore o capítulo):
A casa do ano (profecção anual) é o mês 1; cada mês avança uma casa; o regente do signo na cúspide é o SENHOR DO MÊS. Esse planeta dá o tom de fundo do capítulo — e onde ele está no natal (casa) é a área da vida que o mês ilumina.
Sol — mês de identidade, vitalidade, propósito e visibilidade; o eu no centro do palco.
Lua — mês emocional, doméstico e familiar; marés de humor, cuidado, raízes, intuição.
Mercúrio — mês de mente acelerada: comunicação, estudo, contratos, deslocamentos, decisões.
Vênus — mês de amor, prazer, beleza, dinheiro e vínculos; harmonização e atração.
Marte — mês de ação e coragem: iniciativa, desejo, disputa, energia alta (cuidado com o impulso).
Júpiter — mês de expansão, oportunidade, fé, sorte e crescimento; a porta que se abre.
Saturno — mês de responsabilidade, estrutura, teste e amadurecimento; o que se constrói com esforço.
(Regentes tradicionais: Aquário→Saturno, Escorpião→Marte, Peixes→Júpiter. Cite o moderno — Urano/Plutão/Netuno — só como subtema, se o senhor do mês for um deles.)
COMO USAR: nomeie o senhor do mês na abertura do capítulo, diga em que casa natal ele está e o que isso ilumina, e deixe-o reger o conselho final do mês.`;

const RITUAL_MES = `RITUAL DO MÊS (apenas em meses CRUCIAIS, 10+ pts) — derivado do signo da Lua Nova:
Áries: escreva o que quer iniciar, leia em voz alta 3x, queime/enterre o papel — começos corajosos. Touro: segure uma moeda 5 min visualizando abundância, plante-a num pote com terra. Gêmeos: escreva uma carta ao que precisa entender e leia em voz alta. Câncer: prepare um chá, 10 min de silêncio, agradeça a quem te cuida. Leão: dance sozinha ao som que te faz poderosa e declare o que quer criar. Virgem: liste o que vai organizar e cumpra um item no mesmo dia. Libra: acenda duas velas (você e o outro) e escreva o que quer harmonizar. Escorpião: escreva o que precisa morrer, queime com intenção, fique no silêncio que se forma. Sagitário: abra a janela, olhe o horizonte e declare para onde vai. Capricórnio: escreva uma meta com prazo e o primeiro passo concreto. Aquário: escreva o que quer libertar e doe/desapegue de um objeto. Peixes: banho com sal e silêncio, deixe a intuição falar antes de dormir.`;

const MESES_POR_PARTE = { parte2: [1, 6], parte3: [7, 12], parte4: [13, 18] };

const CONHECIMENTO_POR_PARTE = {
  parte1: [LUA_PROG, ASPECTOS_T, SENHOR_MES],
  parte2: [JUPITER_T, SATURNO_T, MARTE_T, ASPECTOS_T, ECLIPSE_T, MERCURIO_RX, LUA_PROG, SENHOR_MES, RITUAL_MES],
  parte3: [JUPITER_T, SATURNO_T, MARTE_T, ASPECTOS_T, ECLIPSE_T, MERCURIO_RX, LUA_PROG, SENHOR_MES, RITUAL_MES],
  parte4: [JUPITER_T, SATURNO_T, MARTE_T, ASPECTOS_T, ECLIPSE_T, MERCURIO_RX, LUA_PROG, SENHOR_MES, RITUAL_MES],
  parte5: [JUPITER_T, SATURNO_T, ECLIPSE_T],
  completo: [JUPITER_T, SATURNO_T, MARTE_T, ASPECTOS_T, ECLIPSE_T, MERCURIO_RX, LUA_PROG, SENHOR_MES, RITUAL_MES]
};

const ESCOPO_POR_PARTE = {
  parte1: 'Gere SOMENTE duas seções: (1) "Panorama dos 18 Meses" e (2) "As 9 Camadas do Céu" (as 8 da diretriz + a Profecção Mensal / senhor do mês). NÃO escreva nenhum capítulo mensal nesta parte.',
  parte2: 'Gere SOMENTE os capítulos dos MESES 1 a 6 — uma seção por mês. NÃO escreva panorama, áreas de vida nem mensagem final.',
  parte3: 'Gere SOMENTE os capítulos dos MESES 7 a 12 — uma seção por mês.',
  parte4: 'Gere SOMENTE os capítulos dos MESES 13 a 18 — uma seção por mês.',
  parte5: 'Gere SOMENTE: (1) "Revelações por Área de Vida" (amor, carreira, dinheiro, saúde, espiritualidade — com as janelas e os meses), (2) "Os Momentos Mais Significativos" (os 5 momentos, a janela mais poderosa, o maior desafio, a pergunta do período) e (3) "Mensagem Final" com aviso legal e cross-sells. NÃO reescreva os capítulos mensais.'
};

const TEMPLATE_MES = `TEMPLATE DE CADA CAPÍTULO MENSAL (preencher com os dados reais do mês — exceda os pisos):
• TÍTULO poético e premonitório (ex.: "O Mês em que o Céu Respira Fundo", "Quando Júpiter Bate na Sua Porta", "A Tempestade que Limpa").
• FRASE DE ABERTURA premonitória (1 frase): "Este mês, [o que o céu posiciona] — e isso sugere que [tendência]." Nunca "você vai".
• O SENHOR DESTE MÊS (Camada 9): nomeie o planeta regente do mês, diga em que casa natal ele está e o que isso ilumina — ele é a moldura do capítulo.
• EMOÇÃO DOMINANTE: Lua Progressada (humor de fundo) + Lua Cheia do mês (o que vem à tona) num parágrafo.
• O QUE O CÉU MOVE: Júpiter/Saturno/Marte nas casas (o que abre/cobra/acelera); aspectos de trânsito ativos.
• ECLIPSE (se houver): parágrafo próprio, impactante, ligado ao ponto natal ativado.
• RETRÓGRADO (se ativo): o que revisar, o que evitar.
• LUA NOVA: data + casa natal + a intenção que planta. LUA CHEIA: data + casa natal + o que revela/conclui (marcar Superlua).
• O PICO DO MÊS: data aproximada de maior intensidade + o que tende a acontecer.
• ÁREAS EM DESTAQUE: amor / carreira / finanças / saúde, conforme os gatilhos ativos do mês.
• O CONSELHO DO CÉU (guia de ação, regido pelo senhor do mês): o que FAZER, o que EVITAR, o que OBSERVAR.
• Se o mês marcar o ANIVERSÁRIO: anuncie que ali começa o novo ciclo da Revolução Solar e dê o tom do ano que se abre.
Profundidade por intensidade (PISOS, sem teto): tranquilo (0–2) ≈ 400+; ativo (3–5) ≈ 650+; intenso (6–9) ≈ 950+; CRUCIAL (10+) ≈ 1400+ COM o ritual da Lua Nova do mês.`;

function fmtMeses(meses, ini, fim) {
  return (meses || [])
    .filter(m => m.numero >= ini && m.numero <= fim)
    .map(m => {
      const linhas = [
        `— MÊS ${m.numero} (${m.mesAno || '?'}) · intensidade: ${m.classificacao || '?'}${m.pontuacao != null ? ' (' + m.pontuacao + ' pts)' : ''}${m.aniversarioNoMes ? ' · ★ ANIVERSÁRIO (início da Revolução Solar)' : ''}`,
        (m.senhorMes || m.profeccaoMensalCasa != null) && `   Senhor do mês (profecção mensal): ${m.senhorMes || '?'}${m.profeccaoMensalCasa != null ? ' — Casa ' + m.profeccaoMensalCasa + ' ativada' : ''}`,
        m.luaProg && `   Lua Progressada: ${m.luaProg}`,
        m.transitos && `   Trânsitos: ${m.transitos}`,
        m.aspectos && `   Aspectos ativos: ${m.aspectos}`,
        m.eclipse && `   ECLIPSE: ${m.eclipse}`,
        m.retrogrado && `   Retrógrado: ${m.retrogrado}`,
        m.luaNova && `   ${m.luaNova}`,
        m.luaCheia && `   ${m.luaCheia}`,
        (m.gatilhos && m.gatilhos.length) && `   Gatilhos: ${m.gatilhos.join('; ')}`
      ].filter(Boolean);
      return linhas.join('\n');
    }).join('\n\n') || '(meses não informados nesta faixa)';
}

// ---------------- BUILDER ----------------
function buildPromptPrevisoes(dados, planetasInfo, casasInfo, aspectosInfo, parte = "completo") {
  const nome = dados.nome || '[NOME]';
  const conhecimento = (CONHECIMENTO_POR_PARTE[parte] || CONHECIMENTO_POR_PARTE.completo).join('\n\n');
  const escopo = ESCOPO_POR_PARTE[parte] || 'Gere TODAS as 5 partes na ordem (Panorama, 9 Camadas, os 18 capítulos mensais, Áreas de Vida, Momentos + Mensagem Final). Não resuma.';

  const pr = dados.progressoes || {};
  const cam = dados.camadas || {};
  const pic = dados.picos || {};

  const blocoProg = [
    pr.luaProgSigno && `Lua Progressada: ${pr.luaProgSigno}${pr.luaProgCasa ? ' (Casa ' + pr.luaProgCasa + ' natal)' : ''}${pr.luaProgMuda ? ' — muda de signo: ' + pr.luaProgMuda : ''}`,
    pr.solProgSigno && `Sol Progredido: ${pr.solProgSigno}${pr.solProgMuda ? ' — MUDA DE SIGNO: ' + pr.solProgMuda + ' (um dos maiores eventos do período)' : ''}`,
    (pr.solarArcInicio != null) && `Solar Arc: ${pr.solarArcInicio}° → ${pr.solarArcFim}°`,
    (pr.saAspectos && pr.saAspectos.length) && `Direções solares ativas: ${pr.saAspectos.join('; ')}`
  ].filter(Boolean).join('\n') || '(progressões não informadas)';

  const blocoCamadas = [
    (cam.transitosChave && cam.transitosChave.length) && `Trânsitos lentos-chave: ${cam.transitosChave.join('; ')}`,
    (cam.eclipsesAtivos && cam.eclipsesAtivos.length) && `Eclipses ativos sobre o natal: ${cam.eclipsesAtivos.join('; ')}`,
    cam.profeccaoCasa && `Profecção anual: Casa ${cam.profeccaoCasa} ativada · Senhor do Ano: ${cam.senhorAno || '?'}${cam.senhorAnoPos ? ' (' + cam.senhorAnoPos + ')' : ''}`,
    cam.rsNoPeriodo ? `Revolução Solar no período: SIM${cam.rsMesAniversario ? ' — aniversário no mês ' + cam.rsMesAniversario : ''} — ${cam.rsResumo || '(resumo da RS)'}` : 'Revolução Solar no período: não'
  ].filter(Boolean).join('\n') || '(camadas não informadas)';

  const blocoPicos = [
    pic.positivo && `Maior intensidade positiva: ${pic.positivo}`,
    pic.desafiador && `Maior desafio: ${pic.desafiador}`,
    pic.transformacao && `Maior transformação: ${pic.transformacao}`,
    pic.janelaAmor && `Janela de amor: ${pic.janelaAmor}`,
    pic.janelaCarreira && `Janela de carreira: ${pic.janelaCarreira}`,
    pic.janelaFinanceira && `Janela financeira: ${pic.janelaFinanceira}`,
    pic.recolhimento && `Período de recolhimento: ${pic.recolhimento}`
  ].filter(Boolean).join('\n') || '';

  const momentos = (dados.momentos || []).map((m, i) => `${i + 1}. ${m}`).join('\n') || '(derivar dos picos e eclipses acima)';

  // dados mensais relevantes à parte
  let blocoMeses = '';
  if (MESES_POR_PARTE[parte]) {
    const [i, f] = MESES_POR_PARTE[parte];
    blocoMeses = `\n=== DADOS CALCULADOS DOS MESES ${i} A ${f} (escreva um capítulo para cada) ===\n${fmtMeses(dados.meses, i, f)}\n`;
  } else if (parte === "completo") {
    blocoMeses = `\n=== DADOS CALCULADOS DOS 18 MESES ===\n${fmtMeses(dados.meses, 1, 18)}\n`;
  }

  // o template mensal só é necessário nas partes que escrevem meses
  const templateMensal = (MESES_POR_PARTE[parte] || parte === 'completo')
    ? `\n=== TEMPLATE DE CADA CAPÍTULO MENSAL ===\n${TEMPLATE_MES}\n`
    : '';

  return `Você é a astróloga da Astralia escrevendo o Mapa de Previsões de 18 Meses de ${nome}, para o período de ${dados.periodoInicio || '[INÍCIO]'} a ${dados.periodoFim || '[FIM]'}. Você tem trinta anos de prática preditiva e lê o céu por nove camadas ao mesmo tempo. Este é um dos produtos mais caros da casa: a entrega tem de ser generosa, profunda e específica — nada de frase pronta.

═══ A VOZ ═══
Você escreve na voz da Astralia, a mesma da Lilith — agora voltada ao tempo. Íntima, reveladora, premonitória, quase profética. Fala com ${nome} em segunda pessoa, como quem já viu o mapa do território e aponta as curvas antes delas. Nomeia o que a pessoa vai sentir antes de explicar a técnica. ELUCIDE sempre: traduza cada movimento do céu para a vida concreta dela — nada de jargão solto, todo termo vira experiência. Poética quando o céu pede poesia, direta quando pede um aviso.

═══ TOM PREMONITÓRIO ═══
Para o FUTURO: "existe forte tendência a…", "o campo se abre para…", "o céu sugere que…", "há uma janela significativa de…". Para períodos JÁ VIVIDOS do ciclo: determinista ("este período provavelmente trouxe…"). NUNCA "você vai" como certeza, nunca data fechada como sentença, nunca catástrofe — todo alerta vem com saída. Saúde, mente e perdas: tendência e cuidado, jamais diagnóstico ou anúncio de tragédia.

═══ TRAVAS ═══
1. SEM TETO de palavras: os pisos são mínimos a superar; jamais resuma. 2. Cada mês é um capítulo próprio — não agrupe meses. 3. Cite SEMPRE o dado real (planeta, casa, grau, aspecto, data, senhor do mês) e elucide o que significa para ${nome}. 4. Cross-sell só quando o mapa pedir. 5. Não reproduza textos de obras de terceiros — toda interpretação é sua, da Astralia.

NUNCA invente posições — use APENAS os dados reais abaixo.

=== DADOS REAIS DE ${nome.toUpperCase()} ===
Nascimento: ${dados.data || dados.dataNascimento || '[DATA]'}${dados.hora ? ' às ' + dados.hora : ''} · ${dados.cidade || dados.localNascimento || '[LOCAL]'} · Idade: ${dados.idade || '[IDADE]'}
${dados.contexto ? 'Contexto do cliente (12 perguntas): ' + dados.contexto : ''}

${planetasInfo}

${casasInfo}

${aspectosInfo}

=== PROGRESSÕES E DIREÇÕES (camadas 2,3,4) ===
${blocoProg}

=== CAMADAS 5,6,7 + 9 (RS, profecção anual, eclipses, senhor do mês) ===
${blocoCamadas}
${blocoPicos ? '\n=== PICOS DE INTENSIDADE ===\n' + blocoPicos + '\n' : ''}${parte === 'parte5' || parte === 'completo' ? '\n=== OS 5 MOMENTOS MAIS SIGNIFICATIVOS ===\n' + momentos + '\n' : ''}${blocoMeses}${templateMensal}
=== TABELAS DE REFERÊNCIA (cruze com os dados reais; não copie verbatim) ===
${conhecimento}

=== INSTRUÇÕES DE SAÍDA ===
ESCOPO DESTA GERAÇÃO (sobrepõe qualquer instrução de quantidade): ${escopo}
Como você produz apenas parte do relatório, APROFUNDE AO MÁXIMO cada seção desta faixa — exceda os mínimos, mais elucidação, mais correlação entre as camadas, mais concretude, mais guia de ação. Não economize: este produto se vende pela densidade.

Escreva em prosa rica e em segunda pessoa, premonitória e reveladora, sempre traduzindo a técnica em vida concreta de ${nome}.

Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON:
{
  "secoes": [
    {"titulo": "Título da seção ou do mês (cite signo/casa/data/senhor do mês quando couber)", "texto": "vários parágrafos ricos e personalizados"}
  ]
}`;
}

module.exports = {
  buildPromptPrevisoes,
  MESES_POR_PARTE, CONHECIMENTO_POR_PARTE, ESCOPO_POR_PARTE,
  JUPITER_T, SATURNO_T, MARTE_T, ASPECTOS_T, ECLIPSE_T, MERCURIO_RX, LUA_PROG, SENHOR_MES, RITUAL_MES, TEMPLATE_MES
};
