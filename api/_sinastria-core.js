// ============================================================
// _sinastria-core.js — NÚCLEO MATEMÁTICO DA SINASTRIA
// ------------------------------------------------------------
// A Sinastria é o único produto que lê DUAS pessoas. Este núcleo:
//   1. Abre os dois mapas natais na FreeAstrologyAPI (6 chamadas, espaçadas);
//   2. Calcula os ASPECTOS CRUZADOS entre os planetas de A e de B,
//      com orbes específicos de sinastria, ordenados por orbe crescente;
//   3. Conta harmônicos × tensos e classifica o TOM GERAL da relação;
//   4. Calcula o OVERLAY de casas nos dois sentidos (planetas de A nas
//      casas de B, e de B nas de A);
//   5. Calcula o MAPA COMPOSTO pelo método do ponto médio (com o caso
//      especial de diferença maior que 180°) — a Terceira Entidade;
//   6. Calcula DIGNIDADES de Vênus e Marte e a FORÇA DIRECIONAL 🐱
//      de Vênus, Marte e Lua de cada pessoa;
//   7. Compara Vênus×Vênus e Marte×Marte por signo (elemento/modalidade);
//   8. Formata tudo em blocos de texto prontos para o prompt.
//
// Matemática pura + I/O de API. Sem conteúdo interpretativo: o que
// escrever com estes números é trabalho do prompt-sinastria.js.
// Terminologia: astrologia OCIDENTAL (Força Direcional, nunca o termo védico).
// ============================================================

const {
  API_CONFIG_BASE, API_CONFIG_CASAS, API_CONFIG_ASPECTOS,
  calcularCasaDoPlaneta
} = require('./astro-config');
const { getTimezone } = require('./timezone-config');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ------------------------------------------------------------
// Constantes astrológicas
// ------------------------------------------------------------
const SIGNOS_PT = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem',
  'Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

const ELEMENTO = ['Fogo','Terra','Ar','Água','Fogo','Terra','Ar','Água','Fogo','Terra','Ar','Água'];
const MODALIDADE = ['Cardinal','Fixo','Mutável','Cardinal','Fixo','Mutável','Cardinal','Fixo','Mutável','Cardinal','Fixo','Mutável'];

// Tradução EN → PT dos nomes de planetas/pontos da FreeAstrologyAPI
const PLANETA_PT = {
  'Sun':'Sol','Moon':'Lua','Mercury':'Mercúrio','Venus':'Vênus','Mars':'Marte',
  'Jupiter':'Júpiter','Saturn':'Saturno','Uranus':'Urano','Neptune':'Netuno',
  'Pluto':'Plutão','Chiron':'Quíron','Lilith':'Lilith',
  'Node':'Nodo Norte','True Node':'Nodo Norte','Mean Node':'Nodo Norte',
  'Ascendant':'Ascendente','Asc':'Ascendente','MC':'Meio do Céu','Midheaven':'Meio do Céu'
};

// Pontos que entram no cruzamento, em ordem de prioridade da diretriz
const PRIORITARIOS = ['Sol','Lua','Mercúrio','Vênus','Marte','Júpiter','Saturno',
  'Urano','Netuno','Plutão','Quíron','Nodo Norte','Lilith','Ascendente'];

// Orbes de sinastria por tipo de aspecto (mais apertados que os natais).
// Pares que envolvem Sol ou Lua ganham +1° de tolerância (luminares pesam mais).
const ORBES_SINASTRIA = {
  'Conjunção': 7, 'Oposição': 7, 'Trígono': 6, 'Quadratura': 6, 'Sextil': 4
};
const ASPECTOS_DEF = [
  { nome: 'Conjunção',  angulo: 0,   natureza: 'conjunção' },
  { nome: 'Sextil',     angulo: 60,  natureza: 'harmônico' },
  { nome: 'Quadratura', angulo: 90,  natureza: 'tenso' },
  { nome: 'Trígono',    angulo: 120, natureza: 'harmônico' },
  { nome: 'Oposição',   angulo: 180, natureza: 'tenso' }
];

// Dignidades essenciais de Vênus e Marte (signo 0 = Áries … 11 = Peixes)
const DIGNIDADES = {
  'Vênus': { domicilio: [1, 6], exaltacao: [11], detrimento: [7, 0], queda: [5] },
  'Marte': { domicilio: [0, 7], exaltacao: [9],  detrimento: [6, 1], queda: [3] }
};

// Força Direcional 🐱 — casa angular em que cada planeta expressa força máxima.
// (Esquema clássico de força por direção, em terminologia ocidental da marca.)
const FORCA_DIRECIONAL_CASA = {
  'Mercúrio': 1, 'Júpiter': 1,
  'Lua': 4, 'Vênus': 4,
  'Saturno': 7,
  'Sol': 10, 'Marte': 10
};

// ------------------------------------------------------------
// Utilitários de grau
// ------------------------------------------------------------
function norm360(g) { let r = g % 360; if (r < 0) r += 360; return r; }

function signoDoGrau(grauAbsoluto) {
  const idx = Math.floor(norm360(grauAbsoluto) / 30);
  return { idx, nome: SIGNOS_PT[idx], grauNoSigno: norm360(grauAbsoluto) - idx * 30 };
}

function grauParaGM(g) {
  let gi = Math.floor(g);
  let m = Math.round((g - gi) * 60);
  if (m === 60) { gi += 1; m = 0; }
  return gi + '\u00b0' + (m < 10 ? '0' + m : m) + '\u2032';
}

// Diferença angular mínima entre dois graus absolutos (0–180)
function separacao(a, b) {
  let d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
}

// ------------------------------------------------------------
// Normalização de um mapa vindo da API
// ------------------------------------------------------------
function nomePt(p) {
  const en = p && p.planet && p.planet.en;
  return PLANETA_PT[en] || en || '';
}

// Reduz o array da API a pontos prioritários com { nome, grau, signoIdx, signo, casaNum, retro }
function normalizarMapa(planetas, casas) {
  const pontos = [];
  for (const p of (planetas || [])) {
    const nome = nomePt(p);
    if (!PRIORITARIOS.includes(nome)) continue;
    if (typeof p.fullDegree !== 'number') continue;
    const s = signoDoGrau(p.fullDegree);
    pontos.push({
      nome,
      grau: p.fullDegree,
      signoIdx: s.idx,
      signo: s.nome,
      grauNoSigno: s.grauNoSigno,
      casaNum: casas && casas.length ? calcularCasaDoPlaneta(p.fullDegree, casas) : null,
      retro: p.isRetro === 'true' || p.isRetro === true
    });
  }
  return pontos;
}

function ponto(mapa, nome) { return mapa.find(p => p.nome === nome) || null; }

// ------------------------------------------------------------
// 1–2. Buscar os dois mapas na API
// ------------------------------------------------------------
async function chamarAstroAPI(endpoint, body, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    const res = await fetch(`https://json.freeastrologyapi.com/western/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FREEASTROLOGY_API_KEY },
      body: JSON.stringify(body)
    });
    if (res.status === 429) { await sleep(1200 * (i + 1)); continue; }
    try { return await res.json(); } catch (e) { return null; }
  }
  return null;
}

async function buscarMapa(dados) {
  let planetas = [], casas = null, aspectos = [];
  if (!(dados && dados.lat && dados.lon && dados.data)) return { planetas, casas, aspectos };

  const timezone = getTimezone(dados.data, dados.hora, dados.cidade);
  const dt = new Date(dados.data + 'T' + (dados.hora || '12:00') + ':00');
  const bodyBase = {
    year: dt.getFullYear(), month: dt.getMonth() + 1, date: dt.getDate(),
    hours: dt.getHours(), minutes: dt.getMinutes(), seconds: 0,
    latitude: parseFloat(dados.lat), longitude: parseFloat(dados.lon),
    timezone
  };

  try {
    const d = await chamarAstroAPI('planets', { ...bodyBase, config: { ...API_CONFIG_BASE } });
    if (d?.output && Array.isArray(d.output)) planetas = d.output;
  } catch (e) { console.log('[sinastria] planetas erro:', e.message); }
  await sleep(1100);
  try {
    const d = await chamarAstroAPI('houses', { ...bodyBase, config: { ...API_CONFIG_CASAS } });
    if (d?.output?.Houses) casas = d.output.Houses;
  } catch (e) { console.log('[sinastria] casas erro:', e.message); }
  await sleep(1100);
  try {
    const d = await chamarAstroAPI('aspects', { ...bodyBase, config: { ...API_CONFIG_ASPECTOS } });
    if (d?.output && Array.isArray(d.output)) aspectos = d.output;
  } catch (e) { console.log('[sinastria] aspectos erro:', e.message); }

  return { planetas, casas, aspectos };
}

// Abre os dois mapas em sequência (espaçados pelo rate limit da API).
async function buscarMapasDuplos(dadosA, dadosB) {
  const mapaA = await buscarMapa(dadosA);
  await sleep(1100);
  const mapaB = await buscarMapa(dadosB);
  return { mapaA, mapaB };
}

// ------------------------------------------------------------
// 3. Aspectos cruzados A × B (com orbe de sinastria)
// ------------------------------------------------------------
function aspectosCruzados(pontosA, pontosB) {
  const lista = [];
  for (const pa of pontosA) {
    for (const pb of pontosB) {
      const sep = separacao(pa.grau, pb.grau);
      for (const asp of ASPECTOS_DEF) {
        let orbeMax = ORBES_SINASTRIA[asp.nome];
        if (pa.nome === 'Sol' || pa.nome === 'Lua' || pb.nome === 'Sol' || pb.nome === 'Lua') orbeMax += 1;
        const orbe = Math.abs(sep - asp.angulo);
        if (orbe <= orbeMax) {
          lista.push({
            de: pa.nome, signoDe: pa.signo,
            para: pb.nome, signoPara: pb.signo,
            aspecto: asp.nome, natureza: asp.natureza,
            orbe: Math.round(orbe * 100) / 100
          });
        }
      }
    }
  }
  // Ordenados por orbe crescente — os mais exatos são os que mais pesam
  lista.sort((x, y) => x.orbe - y.orbe);
  return lista;
}

// ------------------------------------------------------------
// 4. Contagem harmônicos × tensos e o tom geral da relação
// ------------------------------------------------------------
function tomGeral(cruzados) {
  const harm = cruzados.filter(a => a.natureza === 'harmônico').length;
  const tens = cruzados.filter(a => a.natureza === 'tenso').length;
  const conj = cruzados.filter(a => a.natureza === 'conjunção').length;
  let tom;
  if (tens === 0 && harm > 0) tom = 'leve';
  else if (harm >= tens * 2) tom = 'leve';
  else if (tens >= harm * 2 && tens >= 6) tom = 'muito intenso';
  else if (tens > harm) tom = 'intenso';
  else tom = 'misto';
  return { harmonicos: harm, tensos: tens, conjuncoes: conj, total: cruzados.length, tom };
}

// ------------------------------------------------------------
// 5. Overlay de casas (nos dois sentidos)
// ------------------------------------------------------------
function overlay(pontosDe, casasDe) {
  if (!casasDe || !casasDe.length) return [];
  return pontosDe
    .filter(p => p.nome !== 'Ascendente')
    .map(p => ({ planeta: p.nome, signo: p.signo, casaNoOutro: calcularCasaDoPlaneta(p.grau, casasDe) }));
}

// ------------------------------------------------------------
// 6. Mapa Composto — a Terceira Entidade (método do ponto médio)
// ------------------------------------------------------------
// Ponto médio entre dois graus absolutos. Caso especial: se a diferença
// for maior que 180°, o ponto médio "curto" fica do outro lado do círculo.
function pontoMedio(gA, gB) {
  const a = norm360(gA), b = norm360(gB);
  let medio = (a + b) / 2;
  if (Math.abs(a - b) > 180) medio = norm360(medio + 180);
  return norm360(medio);
}

function mapaComposto(pontosA, pontosB, casasA, casasB) {
  const planetasCompostos = [];
  for (const pa of pontosA) {
    if (pa.nome === 'Ascendente') continue;
    const pb = ponto(pontosB, pa.nome);
    if (!pb) continue;
    const grau = pontoMedio(pa.grau, pb.grau);
    const s = signoDoGrau(grau);
    planetasCompostos.push({ nome: pa.nome, grau, signo: s.nome, signoIdx: s.idx, grauNoSigno: s.grauNoSigno });
  }

  // Ascendente composto = ponto médio dos dois Ascendentes (cúspide da casa 1)
  let ascComposto = null, casaDe = null;
  const ascA = casasA && casasA.length ? casasA.find(c => c.House === 1) : null;
  const ascB = casasB && casasB.length ? casasB.find(c => c.House === 1) : null;
  if (ascA && ascB && typeof ascA.degree === 'number' && typeof ascB.degree === 'number') {
    ascComposto = pontoMedio(ascA.degree, ascB.degree);
    // Casas iguais (30°) a partir do Ascendente composto — escolha documentada:
    // simples, estável e suficiente para leitura relacional.
    casaDe = g => (Math.floor(norm360(g - ascComposto) / 30) + 1);
    for (const p of planetasCompostos) p.casa = casaDe(p.grau);
  }

  // Aspectos internos do composto (orbes de sinastria, sem o bônus de luminar)
  const internos = [];
  for (let i = 0; i < planetasCompostos.length; i++) {
    for (let j = i + 1; j < planetasCompostos.length; j++) {
      const sep = separacao(planetasCompostos[i].grau, planetasCompostos[j].grau);
      for (const asp of ASPECTOS_DEF) {
        const orbe = Math.abs(sep - asp.angulo);
        if (orbe <= ORBES_SINASTRIA[asp.nome]) {
          internos.push({
            de: planetasCompostos[i].nome, para: planetasCompostos[j].nome,
            aspecto: asp.nome, natureza: asp.natureza,
            orbe: Math.round(orbe * 100) / 100
          });
        }
      }
    }
  }
  internos.sort((x, y) => x.orbe - y.orbe);

  return {
    planetas: planetasCompostos,
    ascendente: ascComposto != null ? { grau: ascComposto, ...signoDoGrau(ascComposto) } : null,
    aspectosInternos: internos
  };
}

// ------------------------------------------------------------
// 7. Dignidades de Vênus e Marte + Força Direcional 🐱
// ------------------------------------------------------------
function dignidade(nomePlaneta, signoIdx) {
  const d = DIGNIDADES[nomePlaneta];
  if (!d) return 'neutro';
  if (d.domicilio.includes(signoIdx)) return 'domicílio';
  if (d.exaltacao.includes(signoIdx)) return 'exaltação';
  if (d.detrimento.includes(signoIdx)) return 'detrimento';
  if (d.queda.includes(signoIdx)) return 'queda';
  return 'neutro';
}

function forcaDirecional(nomePlaneta, casaNum) {
  const casaForte = FORCA_DIRECIONAL_CASA[nomePlaneta];
  if (!casaForte || !casaNum) return { nivel: 'neutra', gatinhos: '\ud83d\udc31\ud83d\udc31' };
  if (casaNum === casaForte) return { nivel: 'forte', gatinhos: '\ud83d\udc31\ud83d\udc31\ud83d\udc31' };
  const oposta = ((casaForte + 5) % 12) + 1;
  if (casaNum === oposta) return { nivel: 'fraca', gatinhos: '\ud83d\udc31' };
  return { nivel: 'neutra', gatinhos: '\ud83d\udc31\ud83d\udc31' };
}

function perfilAfetivo(pontos) {
  const out = {};
  for (const nome of ['Vênus', 'Marte', 'Lua']) {
    const p = ponto(pontos, nome);
    if (!p) continue;
    out[nome] = {
      signo: p.signo, casa: p.casaNum, retro: p.retro,
      dignidade: dignidade(nome, p.signoIdx),
      forcaDirecional: forcaDirecional(nome, p.casaNum)
    };
  }
  return out;
}

// ------------------------------------------------------------
// 8. Vênus×Vênus e Marte×Marte por signo (elemento/modalidade)
// ------------------------------------------------------------
function relacaoSignos(idxA, idxB) {
  const eA = ELEMENTO[idxA], eB = ELEMENTO[idxB];
  const mA = MODALIDADE[idxA], mB = MODALIDADE[idxB];
  let elemento;
  if (eA === eB) elemento = 'mesmo elemento — entendimento natural';
  else if ((eA === 'Fogo' && eB === 'Ar') || (eA === 'Ar' && eB === 'Fogo') ||
           (eA === 'Terra' && eB === 'Água') || (eA === 'Água' && eB === 'Terra'))
    elemento = 'elementos complementares — alimentam um ao outro';
  else elemento = 'elementos em fricção — exigem tradução';
  const modalidade = (mA === mB)
    ? `mesma modalidade (${mA}) — ritmo igual, risco de disputa pelo mesmo papel`
    : `modalidades diferentes (${mA} × ${mB}) — ritmos distintos que podem se completar`;
  return { elemento, modalidade };
}

function compararPorSigno(pontosA, pontosB, nomePlaneta) {
  const pa = ponto(pontosA, nomePlaneta), pb = ponto(pontosB, nomePlaneta);
  if (!pa || !pb) return null;
  return { signoA: pa.signo, signoB: pb.signo, ...relacaoSignos(pa.signoIdx, pb.signoIdx) };
}

// ------------------------------------------------------------
// 9. O CÁLCULO COMPLETO — uma chamada, todos os números
// ------------------------------------------------------------
async function calcularSinastria(dadosA, dadosB) {
  const { mapaA, mapaB } = await buscarMapasDuplos(dadosA, dadosB);
  return calcularSinastriaDeMapas(mapaA, mapaB);
}

// Versão pura (testável offline): recebe os mapas já abertos.
function calcularSinastriaDeMapas(mapaA, mapaB) {
  const pontosA = normalizarMapa(mapaA.planetas, mapaA.casas);
  const pontosB = normalizarMapa(mapaB.planetas, mapaB.casas);

  const cruzados = aspectosCruzados(pontosA, pontosB);
  const contagem = tomGeral(cruzados);

  return {
    pontosA, pontosB,
    cruzados, contagem,
    overlayAemB: overlay(pontosA, mapaB.casas),
    overlayBemA: overlay(pontosB, mapaA.casas),
    composto: mapaComposto(pontosA, pontosB, mapaA.casas, mapaB.casas),
    perfilA: perfilAfetivo(pontosA),
    perfilB: perfilAfetivo(pontosB),
    venusXvenus: compararPorSigno(pontosA, pontosB, 'Vênus'),
    marteXmarte: compararPorSigno(pontosA, pontosB, 'Marte')
  };
}

// ------------------------------------------------------------
// 10. Formatação em blocos de texto para o prompt
// ------------------------------------------------------------
function fmtPontos(pontos, rotulo) {
  const linhas = pontos.map(p =>
    `${p.nome}: ${p.signo} ${grauParaGM(p.grauNoSigno)}${p.casaNum ? ' (Casa ' + p.casaNum + ')' : ''}${p.retro ? ' \u211e' : ''}`);
  return `MAPA DE ${rotulo}:\n` + linhas.join('\n');
}

function fmtCruzados(cruzados, nomeA, nomeB, limite) {
  const top = limite ? cruzados.slice(0, limite) : cruzados;
  const linhas = top.map(a =>
    `${a.de} de ${nomeA} (${a.signoDe}) ${a.aspecto} ${a.para} de ${nomeB} (${a.signoPara}) — orbe ${a.orbe}\u00b0 [${a.natureza}]`);
  return 'ASPECTOS CRUZADOS (ordenados por orbe — os mais exatos pesam mais):\n' + (linhas.join('\n') || 'nenhum aspecto dentro dos orbes');
}

function fmtContagem(c) {
  return `CONTAGEM: ${c.harmonicos} harm\u00f4nicos \u00d7 ${c.tensos} tensos \u00d7 ${c.conjuncoes} conjun\u00e7\u00f5es (total ${c.total}).\nTOM GERAL DA RELA\u00c7\u00c3O: ${c.tom}.`;
}

function fmtOverlay(lista, nomeDe, nomeEm) {
  const linhas = lista.map(o => `${o.planeta} de ${nomeDe} (${o.signo}) cai na Casa ${o.casaNoOutro} de ${nomeEm}`);
  return `OVERLAY — onde ${nomeDe} toca a vida de ${nomeEm}:\n` + (linhas.join('\n') || 'indisponível (sem casas)');
}

function fmtComposto(comp) {
  if (!comp || !comp.planetas.length) return 'MAPA COMPOSTO: indisponível.';
  const linhas = comp.planetas.map(p =>
    `${p.nome} composto: ${p.signo} ${grauParaGM(p.grauNoSigno)}${p.casa ? ' (Casa ' + p.casa + ')' : ''}`);
  const asc = comp.ascendente ? `Ascendente composto: ${comp.ascendente.nome} ${grauParaGM(comp.ascendente.grauNoSigno)}` : '';
  const internos = comp.aspectosInternos.slice(0, 12).map(a =>
    `${a.de} ${a.aspecto} ${a.para} — orbe ${a.orbe}\u00b0 [${a.natureza}]`);
  return 'MAPA COMPOSTO — A TERCEIRA ENTIDADE (ponto m\u00e9dio):\n' + asc + '\n' + linhas.join('\n') +
    '\nAspectos internos do composto:\n' + (internos.join('\n') || 'nenhum');
}

function fmtPerfil(perfil, nome) {
  const linhas = Object.entries(perfil).map(([planeta, p]) =>
    `${planeta} de ${nome}: ${p.signo}${p.casa ? ', Casa ' + p.casa : ''} — dignidade: ${p.dignidade} — For\u00e7a Direcional: ${p.forcaDirecional.nivel} ${p.forcaDirecional.gatinhos}${p.retro ? ' — retr\u00f3grado \u211e' : ''}`);
  return `PERFIL AFETIVO DE ${nome}:\n` + linhas.join('\n');
}

function fmtComparacaoSignos(comp, planeta, nomeA, nomeB) {
  if (!comp) return '';
  return `${planeta} de ${nomeA} (${comp.signoA}) \u00d7 ${planeta} de ${nomeB} (${comp.signoB}): ${comp.elemento}; ${comp.modalidade}.`;
}

module.exports = {
  // I/O
  buscarMapa, buscarMapasDuplos, calcularSinastria,
  // lógica pura (testável)
  calcularSinastriaDeMapas, normalizarMapa, aspectosCruzados, tomGeral,
  overlay, mapaComposto, pontoMedio, dignidade, forcaDirecional,
  perfilAfetivo, compararPorSigno, separacao, signoDoGrau,
  // formatação para o prompt
  fmtPontos, fmtCruzados, fmtContagem, fmtOverlay, fmtComposto, fmtPerfil, fmtComparacaoSignos,
  // constantes
  PRIORITARIOS, ORBES_SINASTRIA
};
