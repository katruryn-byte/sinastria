// ═══════════════════════════════════════════════════════════════════════════════
// ☋ PROMPT — MAPA KÁRMICO — Astralia
// ═══════════════════════════════════════════════════════════════════════════════
// Produto Premium — Padrões, ciclos, libertação da alma
// Modelo recomendado: claude-sonnet-4-6 (Opus — profundidade filosófica e síntese)
// Comprimento alvo: 10.000-15.000 palavras
// Tom: Profundo, transformador, esperançoso — NUNCA culpabilizante
// Palavra-chave: LIBERTAÇÃO ATRAVÉS DO AUTOCONHECIMENTO
// ═══════════════════════════════════════════════════════════════════════════════
// Compila INTEGRALMENTE o "Guia Técnico — Mapa Kármico".
// Calcula Nodo Sul (oposto ao Norte), ocupantes/regentes das Casas IV/VIII/XII,
// detecta sinais da Serpente Kármica e dos 7 padrões transgeracionais.
// Saída em JSON estruturado por seções (renderização de PDF é camada separada).
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNOS_ORDEM = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

const SIGNO_OPOSTO = {
  "Áries":"Libra","Libra":"Áries","Touro":"Escorpião","Escorpião":"Touro",
  "Gêmeos":"Sagitário","Sagitário":"Gêmeos","Câncer":"Capricórnio","Capricórnio":"Câncer",
  "Leão":"Aquário","Aquário":"Leão","Virgem":"Peixes","Peixes":"Virgem"
};

const REGENTE_SIGNO = {
  "Áries":"Marte","Touro":"Vênus","Gêmeos":"Mercúrio","Câncer":"Lua","Leão":"Sol",
  "Virgem":"Mercúrio","Libra":"Vênus","Escorpião":"Marte","Sagitário":"Júpiter",
  "Capricórnio":"Saturno","Aquário":"Saturno","Peixes":"Júpiter"
};
const REGENTE_MODERNO = { "Escorpião":"Plutão","Aquário":"Urano","Peixes":"Netuno" };

const ELEMENTO_SIGNO = {
  "Áries":"Fogo","Leão":"Fogo","Sagitário":"Fogo","Touro":"Terra","Virgem":"Terra",
  "Capricórnio":"Terra","Gêmeos":"Ar","Libra":"Ar","Aquário":"Ar",
  "Câncer":"Água","Escorpião":"Água","Peixes":"Água"
};

// -------------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO
// -------------------------------------------------------------------------------

function casaOposta(casa) { return ((casa + 5) % 12) + 1; } // 1↔7, 4↔10, etc.

function calcularNodoSul(nodoNorte) {
  // Nodo Sul é sempre oposto ao Norte (signo oposto, casa oposta)
  if (!nodoNorte || !nodoNorte.signo) return null;
  return {
    signo: SIGNO_OPOSTO[nodoNorte.signo] || null,
    casa: nodoNorte.casa ? casaOposta(nodoNorte.casa) : null,
    grau: nodoNorte.grau != null ? nodoNorte.grau : null
  };
}

function ocupantesCasa(mapaNatal, casa) {
  return Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v === 'object' && v.casa === casa && SIGNOS_ORDEM.includes(v.signo))
    .map(([k]) => k);
}

function regenteCasa(cuspideSigno) {
  if (!cuspideSigno) return null;
  const trad = REGENTE_SIGNO[cuspideSigno];
  const mod = REGENTE_MODERNO[cuspideSigno];
  return { tradicional: trad, moderno: mod || null };
}

// Verifica se existe aspecto entre dois planetas (em qualquer ordem) de um conjunto de tipos
function temAspecto(aspectos, p1, p2, tipos) {
  return aspectos.some(a => {
    const par = (a.planeta1 === p1 && a.planeta2 === p2) || (a.planeta1 === p2 && a.planeta2 === p1);
    return par && (!tipos || tipos.includes((a.aspecto||'').toLowerCase()));
  });
}
const DIFICEIS = ["quadratura","oposição","oposicao","conjunção","conjuncao"];

// Detecta sinais da Serpente Kármica (o ciclo central que aprisiona)
function detectarSerpente(mapaNatal, aspectos, nodoSul) {
  const sinais = [];
  const pessoais = ["Sol","Lua","Mercúrio","Vênus","Marte"];
  pessoais.forEach(p => { if (temAspecto(aspectos,"Plutão",p,DIFICEIS)) sinais.push(`Plutão em aspecto tenso com ${p} (poder/controle como ciclo)`); });
  ["Sol","Lua","Vênus"].forEach(p => { if (temAspecto(aspectos,"Saturno",p,DIFICEIS)) sinais.push(`Saturno em tensão com ${p} (medo/restrição como ciclo)`); });
  if (ocupantesCasa(mapaNatal,8).length) sinais.push(`Planetas na Casa 8 (${ocupantesCasa(mapaNatal,8).join(", ")}) — transformação recorrente`);
  if (ocupantesCasa(mapaNatal,12).length) sinais.push(`Planetas na Casa 12 (${ocupantesCasa(mapaNatal,12).join(", ")}) — padrão inconsciente ativo`);
  if (nodoSul && nodoSul.casa) sinais.push(`Nodo Sul em ${nodoSul.signo} Casa ${nodoSul.casa} — zona de conforto que pode bloquear evolução`);
  const quiron = mapaNatal["Quíron"];
  if (quiron) sinais.push(`Quíron em ${quiron.signo} Casa ${quiron.casa} — ferida que, não integrada, alimenta o ciclo`);
  return sinais;
}

// Detecta quais dos 7 padrões transgeracionais têm sinal no mapa
function detectarPadroesTransgeracionais(mapaNatal, aspectos, nodoSul) {
  const presentes = [];
  const emCasa = (p,c) => mapaNatal[p] && mapaNatal[p].casa === c;
  // 1 Escassez
  if (emCasa("Saturno",2) || temAspecto(aspectos,"Saturno","Vênus",DIFICEIS))
    presentes.push({ nome:"ESCASSEZ", lema:'"Nunca é suficiente."', quebrar:"Cultivar consciência de abundância presente, mesmo pequena." });
  // 2 Amor condicional
  if (temAspecto(aspectos,"Lua","Saturno",DIFICEIS))
    presentes.push({ nome:"AMOR CONDICIONAL", lema:'"Só sou amada quando mereço."', quebrar:"Experiências de amor incondicional (terapia, comunidade, espiritualidade)." });
  // 3 Silêncio e segredo
  if (emCasa("Mercúrio",12) || emCasa("Plutão",3))
    presentes.push({ nome:"SILÊNCIO E SEGREDO", lema:'"Certas verdades não são ditas."', quebrar:"Fala terapêutica, escrita, verbalizar o não-dito." });
  // 4 Rigidez e controle
  if (temAspecto(aspectos,"Saturno","Lua",DIFICEIS) || emCasa("Plutão",1))
    presentes.push({ nome:"RIGIDEZ E CONTROLE", lema:'"O mundo é perigoso; controle é sobrevivência."', quebrar:"Exposição gradual à incerteza tolerável, meditação, rendição consciente." });
  // 5 Vitimização
  if (emCasa("Netuno",1) || temAspecto(aspectos,"Saturno","Sol",DIFICEIS))
    presentes.push({ nome:"VITIMIZAÇÃO", lema:'"As coisas acontecem para mim, não tenho poder."', quebrar:"Ações pequenas onde o resultado depende só de você." });
  // 6 Hiperresponsabilidade
  if (temAspecto(aspectos,"Lua","Saturno",DIFICEIS) || emCasa("Vênus",12) || (nodoSul && nodoSul.signo==="Câncer"))
    presentes.push({ nome:"HIPERRESPONSABILIDADE", lema:'"Sou responsável pelos sentimentos de todos."', quebrar:"Deixar os outros assumirem as próprias consequências." });
  // 7 Abandono e traição
  if (emCasa("Saturno",7) || emCasa("Plutão",7) || temAspecto(aspectos,"Lilith","Lua",DIFICEIS))
    presentes.push({ nome:"ABANDONO E TRAIÇÃO", lema:'"Quem amo me abandona ou me trai."', quebrar:"Terapia de apego, revisão do histórico, construção de segurança interna." });
  return presentes;
}

// Análise kármica completa (tabela de overlay + temas)
function analisarKarma(mapaNatal, aspectos = []) {
  const nn = mapaNatal["Nodo Norte"] || null;
  const ns = mapaNatal["Nodo Sul"] || calcularNodoSul(nn);
  const tabela = {
    nodoNorte: nn ? `${nn.signo} Casa ${nn.casa ?? '?'} ${nn.grau ?? ''}°` : "?",
    nodoSul: ns ? `${ns.signo} Casa ${ns.casa ?? '?'} ${ns.grau ?? ''}°` : "?",
    plutao: mapaNatal["Plutão"] ? `${mapaNatal["Plutão"].signo} Casa ${mapaNatal["Plutão"].casa ?? '?'}` : "?",
    saturno: mapaNatal["Saturno"] ? `${mapaNatal["Saturno"].signo} Casa ${mapaNatal["Saturno"].casa ?? '?'}` : "?",
    quiron: mapaNatal["Quíron"] ? `${mapaNatal["Quíron"].signo} Casa ${mapaNatal["Quíron"].casa ?? '?'}` : "(não fornecido)",
    lilith: mapaNatal["Lilith"] ? `${mapaNatal["Lilith"].signo} Casa ${mapaNatal["Lilith"].casa ?? '?'}` : "(não fornecido)",
    lua: mapaNatal["Lua"] ? `${mapaNatal["Lua"].signo} Casa ${mapaNatal["Lua"].casa ?? '?'}` : "?",
    casaIV: { cuspide: mapaNatal.cuspideCasa4 || null, ocupantes: ocupantesCasa(mapaNatal,4), regente: regenteCasa(mapaNatal.cuspideCasa4) },
    casaVIII: { cuspide: mapaNatal.cuspideCasa8 || null, ocupantes: ocupantesCasa(mapaNatal,8), regente: regenteCasa(mapaNatal.cuspideCasa8) },
    casaXII: { cuspide: mapaNatal.cuspideCasa12 || null, ocupantes: ocupantesCasa(mapaNatal,12), regente: regenteCasa(mapaNatal.cuspideCasa12) }
  };
  return {
    tabelaOverlay: tabela,
    nodoSulCalculado: ns,
    serpente: detectarSerpente(mapaNatal, aspectos, ns),
    padroesTransgeracionais: detectarPadroesTransgeracionais(mapaNatal, aspectos, ns)
  };
}

// -------------------------------------------------------------------------------
// CONSTANTE 1 — FUNDAMENTOS FILOSÓFICOS (Karma, Samsara, Serpente) + TOM
// -------------------------------------------------------------------------------

const FUNDAMENTOS_KARMICOS = `
═══════════════════════════════════════════════════════════════════════════════
MAPA KÁRMICO — FUNDAMENTOS
═══════════════════════════════════════════════════════════════════════════════
Não é punição por erros, dívida cósmica ou destino imutável. É sobre PADRÕES:
herdados da família, criados nesta vida, que se repetem porque ainda não receberam
consciência — e que PODEM ser quebrados. O mapa revela tendências, não certezas.
Astrologia evolutiva, não fatalista. O mapa revela, não condena; ilumina, não aprisiona.

## PILAR 1 — KARMA
A qualidade energética que você embute nas ações volta na mesma frequência (amor→amor,
medo→confirmação do medo, escassez→escassez). Você não começa do zero: carrega padrões
gravados antes de nascer. Não é punição — é herança inconsciente, que pode ser aceita,
modificada ou recusada.
3 tipos: INDIVIDUAL (o que você criou — 100% sob seu poder, muda hoje); FAMILIAR/
TRANSGERACIONAL (o que a linhagem criou — herdado, repetido sem saber, quebrável com
consciência); COLETIVO (cultura/país/época). Este mapa trabalha Individual e Familiar.

## PILAR 2 — SAMSARA
O ciclo de sofrimento que se repete (relacionamento tóxico atrás de outro igual; ganhar
e perder dinheiro; emprego odiado atrás de outro; coragem→recuo→coragem→recuo). O ciclo
não quebra porque a CAUSA — um padrão inconsciente — não foi endereçada.
Estrutura: GATILHO → PADRÃO AUTOMÁTICO → RESULTADO DOLOROSO → PROMESSA DE MUDANÇA → GATILHO.
Saída não é força de vontade — é CONSCIÊNCIA: ver o ciclo com clareza suficiente para
escolher diferente no momento do gatilho.

## PILAR 3 — SERPENTE KÁRMICA
O padrão que se enrosca na vida (como serpente no galho: não destrói, mas prende e impede
o crescimento livre). Identificada por: Plutão em aspecto difícil com pessoais; Nodo Sul
bloqueando; Saturno em tensão com Sol/Lua/Vênus; padrões de Casa 8 e 12; Quíron não
integrado. Trabalhada com consciência, transforma-se: o veneno vira antídoto, a serpente
que morde vira a que cura.

## TOM CORRETO (produto mais íntimo do catálogo — tocando feridas profundas)
NUNCA "você vai sempre sofrer por este padrão" → SEMPRE "você carrega este padrão e tem
o que precisa para quebrá-lo".
NUNCA "sua família te marcou para sempre" → SEMPRE "sua família te transmitiu algo, e você
escolhe o que fazer com ele".
NUNCA "vai repetir até morrer" → SEMPRE "este ciclo pede consciência, e é o que você
desenvolve agora".
`;

// -------------------------------------------------------------------------------
// CONSTANTE 2 — NODO SUL POR SIGNO (de onde você vem — talento que virou prisão)
// -------------------------------------------------------------------------------

const NODO_SUL_SIGNO = {
  "Áries": "TALENTOS: coragem instintiva, iniciativa rápida, agir sozinha, autoliderança. ZONA DE CONFORTO: resolve tudo sozinha, age antes de pensar, lidera pela força não pela diplomacia. PADRÃO INCONSCIENTE: acha que ninguém faz tão bem, não pede ajuda por orgulho, age tão rápido que destrói o que construiu, boa em começar e ruim em manter, relações sofrem porque não cede. INTEGRAÇÃO (Libra): co-criar, considerar o outro, unir forças — coragem compartilhada é mais poderosa.",
  "Touro": "TALENTOS: paciência extraordinária, persistência, construção lenta e sólida, criar estabilidade, manter. ZONA DE CONFORTO: rotina, segurança material, prazer sensorial, o conhecido e duradouro. PADRÃO INCONSCIENTE: resistência à mudança que vira prisão; apego a pessoas/situações/coisas que já terminaram porque mudança parece ameaça; presa em emprego/relação por ser familiar. INTEGRAÇÃO (Escorpião): transformação purifica, não destrói; aprender a soltar; o que não muda apodrece.",
  "Gêmeos": "TALENTOS: mente ágil, comunicação fácil, versatilidade, conectar ideias. ZONA DE CONFORTO: múltiplos projetos, muita informação, conexões superficiais; sabe muito de muito, pouco de pouco. PADRÃO INCONSCIENTE: foge da profundidade, racionaliza em vez de sentir, mil opiniões e poucas convicções, explica sentimentos em vez de vivê-los. INTEGRAÇÃO (Sagitário): verdade mais profunda, comprometer-se com uma filosofia, sabedoria ≠ informação.",
  "Câncer": "TALENTOS: empatia profunda, cuidado genuíno, nutrir, intuição emocional. ZONA DE CONFORTO: casa, família, memórias, passado. PADRÃO INCONSCIENTE: cuida de todos menos de si; usa o papel de cuidadora para evitar a própria vida; apego ao passado que impede o presente; hipersensível à rejeição. INTEGRAÇÃO (Capricórnio): construir algo de autoria própria, ter ambição, cuidar de si enquanto cuida dos outros.",
  "Leão": "TALENTOS: carisma natural, criatividade espontânea, presença magnética, liderar pelo exemplo. ZONA DE CONFORTO: destaque, reconhecimento, performance, ser o centro. PADRÃO INCONSCIENTE: precisa demais de aprovação; valor depende do que os outros pensam; pode sabotar quem está ao redor para não ser eclipsada; performa em vez de ser. INTEGRAÇÃO (Aquário): servir ao coletivo, grupo acima do ego — brilho verdadeiro ilumina os outros.",
  "Virgem": "TALENTOS: análise precisa, organização, discriminação, habilidade técnica refinada; vê detalhes que outros perdem. ZONA DE CONFORTO: controle, perfeição, refinamento contínuo. PADRÃO INCONSCIENTE: perfeccionismo que paralisa, autocrítica que corrói; ajuda todos porque se sente indigna de ser ajudada; trabalha demais como pagamento de dívida invisível. INTEGRAÇÃO (Peixes): confiar no fluxo, ser imperfeita, receber sem merecer, ter valor além da utilidade.",
  "Libra": "TALENTOS: diplomacia refinada, sensibilidade estética, mediação, charme. ZONA DE CONFORTO: relacionamentos, harmonia, acordo, o belo e agradável; gravita para o que mantém a paz. PADRÃO INCONSCIENTE: perde-se no outro, identidade relacional e não pessoal; evita conflito necessário; concorda discordando porque o amor parece condicional ao acordo. INTEGRAÇÃO (Áries): descobrir quem é sem ninguém para agradar; sua vontade tem valor; seu 'não' é tão sagrado quanto o 'sim'.",
  "Escorpião": "TALENTOS: percepção profunda, investigar, resistência em crises, poder de transformação; sobrevive ao que outros não sobrevivem. ZONA DE CONFORTO: intensidade, profundidade, crises, poder, controle; o ordinário entedia. PADRÃO INCONSCIENTE: cria intensidade desnecessária, desconfia do fácil, sabota relações antes de ser abandonada, acumula rancor e dívidas emocionais. INTEGRAÇÃO (Touro): estabilidade não é tédio, confiança é possível, não precisa ser testada para provar força.",
  "Sagitário": "TALENTOS: otimismo natural, visão filosófica, ensinar, fé genuína; enxerga além do horizonte. ZONA DE CONFORTO: grandes ideias, filosofias, verdades absolutas, o grande quadro. PADRÃO INCONSCIENTE: generaliza e perde o específico; tantas certezas que não aprende; foge do cotidiano nas grandes ideias; promete mais do que entrega. INTEGRAÇÃO (Gêmeos): interessar-se pelos detalhes, ouvir com curiosidade, ser aluno e não só mestre.",
  "Capricórnio": "TALENTOS: disciplina natural, responsabilidade, capacidade estrutural, resistência de longo prazo; sabe construir e persistir. ZONA DE CONFORTO: trabalho, estrutura, controle, resultados mensuráveis; entregar, cumprir, ser confiável. PADRÃO INCONSCIENTE: usa o trabalho para evitar sentir; define valor pelo que produz; severa consigo (e com outros) sem espaço para humanidade; gerencia em vez de se relacionar. INTEGRAÇÃO (Câncer): sentir sem gerenciar, receber cuidado, ser vulnerável, ter família que não é só obrigação.",
  "Aquário": "TALENTOS: pensamento original, visão de futuro, inovar, amor à liberdade; à frente do tempo. ZONA DE CONFORTO: grupos, ideias, causas coletivas, liberdade intelectual; conecta-se pelo intelecto. PADRÃO INCONSCIENTE: distancia-se emocionalmente, racionaliza o que sente, parte de coletivos mas intimamente só, princípios sem conexão. INTEGRAÇÃO (Leão): expressar-se como indivíduo, brilhar como EU, ser íntima, amar uma pessoa concreta — não só a humanidade abstrata.",
  "Peixes": "TALENTOS: compaixão profunda, intuição espiritual, dissolução do ego, fé; sente a unidade de tudo, transcende, perdoa. ZONA DE CONFORTO: espiritualidade, invisível, silêncio, fusão; sabe deixar ir e ser fluida. PADRÃO INCONSCIENTE: usa espiritualidade para escapar da vida concreta; tão fluida que não tem forma própria; perde-se nos outros e chama de amor; confunde dissolução com iluminação. INTEGRAÇÃO (Virgem): discernir, ter limites, ser prática, encarnar, servir com ação concreta."
};

// -------------------------------------------------------------------------------
// CONSTANTE 3 — NODO SUL POR CASA
// -------------------------------------------------------------------------------

const NODO_SUL_CASA = {
  1: "Habilidade natural de ser você mesma, se apresentar, liderar pela presença. Padrão: autocentramento, identidade rígida, dificuldade de se ver pelo olhar do outro. Caminho: a parceria (Casa 7) não ameaça quem você é — completa.",
  2: "Habilidade de acumular, valorizar o tangível, criar segurança material. Padrão: acumulação por medo de escassez, valor medido por posses. Caminho: transformar recursos (Casa 8), partilhar, deixar o velho morrer.",
  3: "Mente ágil, comunicação fácil, curiosidade insaciável. Padrão: superficialidade, racionalização de sentimentos, excesso de informação. Caminho: buscar verdade maior (Casa 9), comprometer-se com uma filosofia.",
  4: "Capacidade de criar lar, cuidar da família, manter raízes. Padrão: apego ao passado, família como identidade, medo de se posicionar publicamente. Caminho: ambição pública própria (Casa 10), construir algo de autoria.",
  5: "Criatividade espontânea, alegria de existir, carisma. Padrão: necessidade de palco, criatividade que não serve ao coletivo, ego criativo inflado. Caminho: servir ao grupo (Casa 11), talentos a serviço de causas maiores.",
  6: "Capacidade de servir, trabalhar, analisar e refinar. Padrão: servilidade, trabalho compulsivo, saúde negligenciada, identidade de 'ajudante'. Caminho: receber cuidado (Casa 12), fazer por compaixão, não por obrigação.",
  7: "Habilidade de se relacionar, ceder, harmonizar, criar parcerias. Padrão: perda de identidade no outro, incapacidade de estar só, codependência. Caminho: ser independente (Casa 1), identidade que não depende de parceiro.",
  8: "Capacidade de transformação, lidar com crises, investigar o profundo. Padrão: manipulação, obsessão com poder, dificuldade de confiar, criação de dramas. Caminho: simplicidade e confiança (Casa 2), construir sem crises.",
  9: "Visão filosófica, otimismo, ensinar e inspirar. Padrão: dogmatismo, fuga do cotidiano nas grandes ideias, promessas sem ação. Caminho: comunicar no detalhe (Casa 3), ser curioso em vez de certo.",
  10: "Liderança pública, disciplina, ambição estruturada. Padrão: trabalho para evitar a vida emocional, autoritarismo, rigidez. Caminho: cuidar (Casa 4), família como prioridade, sentir sem gerenciar.",
  11: "Trabalhar em grupo, servir a causas coletivas, inovar. Padrão: diluição em grupos, identidade coletiva sem individual, distância emocional. Caminho: brilhar como indivíduo (Casa 5), expressão criativa própria.",
  12: "Espiritualidade desenvolvida, compaixão universal, transcender. Padrão: fuga da realidade, dissolução de limites, espiritualidade como escapismo. Caminho: discernimento prático (Casa 6), encarnar, servir concretamente."
};

// -------------------------------------------------------------------------------
// CONSTANTE 4 — NODO NORTE POR SIGNO (a bússola da alma — aprendizado desta vida)
// -------------------------------------------------------------------------------

const NODO_NORTE_SIGNO = {
  "Áries": "APRENDER: CORAGEM PESSOAL AUTÊNTICA. Sua vontade tem valor; existir sem depender de aprovação; egoísmo saudável (cuidar de si) é sobrevivência; a coragem de ser você é seu maior presente. DIFÍCIL porque (NS Libra): pensar em si parece egoísta, conflito parece perigo, independência parece solidão. SE IGNORA: vive em relações onde desaparece, concorda discordando, fica quando deveria ir, vazio que nenhuma relação preenche. SE HONRA: descobre voz, vontade, caminho — e que quem ama de verdade não foge quando você é você. PRÁTICAS: 1 decisão/semana sem consultar ninguém; dizer não a um pedido; começar projeto só seu; dizer 'eu quero' sem justificar.",
  "Touro": "APRENDER: ESTABILIDADE E VALOR PRÓPRIO SUSTENTÁVEL. Estabilidade não é prisão; construção lenta tem valor que a rápida não tem; você vale por existir, não só por transformar. DIFÍCIL (NS Escorpião): estabilidade parece tédio, confiança parece ingenuidade, simplicidade parece superficialidade. SE IGNORA: crises sem fim que consomem sem construir; relações que se destroem e refazem sem evoluir; poder sem paz. SE HONRA: constrói o que dura, lar, segurança real; aprende a confiar. PRÁTICAS: rotina simples por 30 dias; investir no longo prazo; prazer simples sem drama; ficar no presente sem criar crises.",
  "Gêmeos": "APRENDER: CURIOSIDADE, DIÁLOGO E ABERTURA AO DETALHE. Não precisa saber a verdade final; perguntar vale mais que responder; cada conversa revela algo. DIFÍCIL (NS Sagitário): questionar parece fraqueza, ouvir parece perda de tempo, detalhe parece distração. SE IGNORA: ensina mas não aprende, fala mas não escuta, relações unilaterais. SE HONRA: ideias novas chegam, conexões reais se formam. PRÁTICAS: fazer perguntas em vez de respostas por uma semana; escrever algo breve diário; aprender assunto novo sem julgar; conversar com pessoas diferentes.",
  "Câncer": "APRENDER: VULNERABILIDADE, CUIDADO E EMPATIA GENUÍNA. Sentir não é fraqueza; precisar de alguém não é dependência; criar raízes não impede crescer. DIFÍCIL (NS Capricórnio): sentimento parece improdutivo, vulnerabilidade parece risco, família parece obrigação. SE IGNORA: constrói muito sem amor, chega ao topo e pergunta 'para quê?', solidão no sucesso. SE HONRA: forte E vulnerável; sucesso com amor. PRÁTICAS: ligar para quem ama só para dizer; chorar sem analisar; ritual de cuidado com o lar; pedir ajuda no que faria sozinha.",
  "Leão": "APRENDER: EXPRESSÃO INDIVIDUAL E ALEGRIA AUTÊNTICA. Você tem algo único; brilhar não é arrogância; sua expressão serve ao coletivo, não o ameaça. DIFÍCIL (NS Aquário): destaque parece vaidade, brilho parece egoísmo, some como indivíduo. SE IGNORA: serve ao grupo mas não é vista, contribui sem reconhecimento, ressentimento. SE HONRA: ao brilhar com autenticidade, inspira os outros a brilhar. PRÁTICAS: assinar trabalho que faria anônimo; compartilhar criação pessoal; planejar algo só por prazer; dizer 'eu fiz isso' sem minimizar.",
  "Virgem": "APRENDER: DISCERNIMENTO, SERVIÇO CONCRETO E ENCARNAÇÃO. O espiritual se manifesta no concreto; cuidar de um humano específico é sagrado; ser útil no cotidiano é iluminação. DIFÍCIL (NS Peixes): detalhes parecem limites, rotina parece prisão, limites parecem falta de amor. SE IGNORA: flutua entre inspirações sem aterrissar, visão sem prática, ama a humanidade mas não uma pessoa concreta. SE HONRA: grandeza nos detalhes, servir com precisão transforma. PRÁTICAS: rotina simples por 21 dias; algo pequeno por alguém concreto diário; organizar um espaço físico; aprender habilidade prática.",
  "Libra": "APRENDER: PARCERIA, EQUILÍBRIO E COLABORAÇÃO. Dois supera um; ceder não é fraqueza, é inteligência; harmonia é sabedoria, não superficialidade. DIFÍCIL (NS Áries): parceria parece limite, ceder parece perder, negociar parece lentidão. SE IGNORA: chega longe mas sozinha, conquista sem com quem compartilhar, relações que não sobrevivem à necessidade de controle. SE HONRA: a parceria certa multiplica quem você é; o outro soma. PRÁTICAS: negociar o que decidiria sozinha; pedir opinião e considerar de verdade; fortalecer uma parceria; conceder sem ressentimento.",
  "Escorpião": "APRENDER: TRANSFORMAÇÃO, PROFUNDIDADE E PODER VERDADEIRO. Profundidade liberta, não assusta; verdade difícil vale mais que conforto superficial; transformação radical é possível e necessária. DIFÍCIL (NS Touro): profundidade parece perigo, transformação parece destruição, perder controle parece catástrofe. SE IGNORA: estabilidade que entorpece, segurança que aprisiona, evita mudanças até virarem crises. SE HONRA: descobre recursos que não sabia ter, poder real independente das circunstâncias. PRÁTICAS: terapia profunda; enfrentar verdade evitada; transformação de raiz (não maquiagem); liberar ressentimento antigo.",
  "Sagitário": "APRENDER: EXPANSÃO, FÉ E VISÃO ALÉM DO HORIZONTE. Existem verdades maiores que os fatos; fé é coragem de avançar sem todas as informações; a vida tem sentido além do que a mente mapeia. DIFÍCIL (NS Gêmeos): filosofia parece vaga, fé parece irracional, expansão parece imprecisão. SE IGNORA: sabe muito de tudo e nada de nada, informação sem sabedoria, conexões sem profundidade. SE HONRA: encontra o fio que conecta tudo, o desconhecido deixa de ser ameaça. PRÁTICAS: viajar para o muito diferente; estudar uma filosofia/espiritualidade sem julgar; viver por uma verdade 3 meses; ter opinião forte sobre algo importante.",
  "Capricórnio": "APRENDER: ESTRUTURA, AUTORIDADE PRÓPRIA E LEGADO. Pode ser carinhosa E estruturada; responsabilidade é a forma de deixar marca; construir o duradouro exige sacrifício que vale. DIFÍCIL (NS Câncer): estrutura parece fria, disciplina parece punição, ambição parece abandono da família. SE IGNORA: cuida de todos mas não constrói nada de si, amor sem direção. SE HONRA: cuidar e construir ao mesmo tempo; o legado é a forma mais amorosa de cuidar. PRÁTICAS: objetivo profissional de 5 anos; rotina de trabalho disciplinada 60 dias; dizer não a um compromisso emocional para honrar o trabalho; assumir liderança evitada.",
  "Aquário": "APRENDER: CONTRIBUIÇÃO COLETIVA E PENSAMENTO ORIGINAL. Seu propósito é maior que você; originalidade é serviço, não excentricidade; pertencer a algo maior não apaga quem você é. DIFÍCIL (NS Leão): grupo parece diluição, coletivo parece ameaça, comunidade parece limite. SE IGNORA: brilha mas não alimenta, é visto mas não conectado, sua luz ilumina só você. SE HONRA: originalidade a serviço do coletivo multiplica o impacto. PRÁTICAS: juntar-se a grupo com propósito; contribuir com o que beneficia muitos; pensamento inovador que desafia o status quo; rede de pessoas diferentes.",
  "Peixes": "APRENDER: COMPAIXÃO, FÉ E RENDIÇÃO CONSCIENTE. Não dá para controlar tudo; render-se é o ato mais corajoso; existe algo maior que sua análise, e confiar nele é evolução. DIFÍCIL (NS Virgem): fé parece imprecisão, compaixão parece ineficiência, transcendência parece escapismo. SE IGNORA: analisa até o fim e não se move, refina sem entregar, ajuda por obrigação. SE HONRA: ao parar de controlar, a vida flui de formas que a análise nunca encontraria. PRÁTICAS: meditar 10 min/dia por 30 dias; algo por alguém sem esperar resultado; permitir-se não saber; perdão ativo."
};

// -------------------------------------------------------------------------------
// CONSTANTE 5 — NODO NORTE POR CASA (o convite evolutivo)
// -------------------------------------------------------------------------------

const NODO_NORTE_CASA = {
  1: "Descobrir quem você é independentemente do outro; liderar pela presença, ocupar espaço. Convite: 'Descubra sua identidade. Ela existe. Ela importa.'",
  2: "Construir segurança real (financeira, emocional, corporal); pode ter, merece ter, construção lenta é sagrada. Convite: 'Invista em você. Seus recursos expressam seu valor.'",
  3: "Comunicação autêntica e curiosidade genuína; escutar, perguntar, interessar-se pelo detalhe. Convite: 'Sua voz cotidiana tem valor. Diga o que pensa. Pergunte o que não sabe.'",
  4: "Criar raízes, cuidar do lar, honrar a ancestralidade; pode ser pública E ter vida privada rica. Convite: 'Invista no que é seu, íntimo, sem plateia.'",
  5: "Criatividade, expressão pessoal, alegria; criar por prazer é tão sagrado quanto por propósito. Convite: 'Brinque. Crie. Ame. A vida não é só produção.'",
  6: "Serviço cotidiano, rotina sagrada, cuidado do corpo; o espiritual se manifesta na ação concreta. Convite: 'Encarne. Sirva na prática. Seu corpo é seu templo.'",
  7: "Parceria e o espelho do outro; dois pode ser mais que um. Convite: 'Abra-se à parceria real. Deixe o outro te ver.'",
  8: "Transformação profunda, enfrentar o oculto; o que você teme em si é onde está seu poder. Convite: 'Vá fundo. O escuro em você não é perdição — é ouro.'",
  9: "Expansão filosófica, espiritual e geográfica; há mundos além do que você conhece. Convite: 'Saia do familiar. Seu horizonte é maior do que pensa.'",
  10: "Carreira pública, autoridade, legado; você tem algo a oferecer ao mundo. Convite: 'Apareça. Sua presença pública tem propósito.'",
  11: "Comunidade, amizades significativas, projetos coletivos; seu propósito é maior que você. Convite: 'Junte-se. Colabore. Seu sonho se completa no coletivo.'",
  12: "Espiritualidade, rendição, serviço desinteressado; o invisível é tão real quanto o visível. Convite: 'Silencie. Ore. Sirva sem precisar de resultado.'"
};

// -------------------------------------------------------------------------------
// CONSTANTE 6 — PLUTÃO POR CASA (morte e renascimento)
// -------------------------------------------------------------------------------

const PLUTAO_KARMICO_CASA = {
  1: "Morre: identidade falsa, máscara social. Nasce: você autêntica, sem performance. Ciclo: reinvenção drástica em algum momento — inevitável.",
  2: "Morre: relação doentia com dinheiro (escassez ou excesso compulsivo). Nasce: relação de poder com recursos. Ciclo: perdas e ganhos drásticos ensinando o valor real.",
  3: "Morre: forma de pensar/comunicar que limita. Nasce: mente transformadora, palavra que cura. Ciclo: algo dito (ou não dito) gerou consequências profundas.",
  4: "Morre: dinâmica familiar tóxica, padrão ancestral. Nasce: família escolhida, raízes conscientes. Ciclo: família como campo de transformação profunda.",
  5: "Morre: criatividade reprimida, expressão bloqueada. Nasce: criatividade que transforma, amor que liberta. Ciclo: relação ou projeto criativo que transforma a identidade.",
  6: "Morre: trabalho que adoece, rotina que prende. Nasce: serviço que transforma, saúde como prioridade. Ciclo: crise de saúde/trabalho que força reconstrução total.",
  7: "Morre: parceiro que não serve, padrão tóxico. Nasce: parceria de poder real, amor que liberta. Ciclo: relações intensas e transformadoras.",
  8: "Plutão em casa própria: transformação máxima, poder absoluto. Morre: tudo que impede o renascimento. Ciclo: morte e renascimento simbólico (ou literal) em algum ponto.",
  9: "Morre: crença rígida, dogma que aprisiona. Nasce: filosofia pessoal, fé baseada em experiência. Ciclo: crise de fé que abre espiritualidade mais profunda.",
  10: "Morre: carreira que não é sua, persona falsa. Nasce: autoridade autêntica, poder profissional genuíno. Ciclo: colapso ou transformação radical de carreira.",
  11: "Morre: grupo que não serve, amizades baseadas em medo. Nasce: comunidade de transformação, causa que move. Ciclo: traição/ruptura de grupo que liberta.",
  12: "Morre: padrão inconsciente central. Nasce: acesso ao poder espiritual mais profundo. Ciclo: encontro com o que estava oculto (e é o mais poderoso)."
};

// -------------------------------------------------------------------------------
// CONSTANTE 7 — SATURNO POR SIGNO (a lição kármica)
// -------------------------------------------------------------------------------

const SATURNO_KARMICO_SIGNO = {
  "Áries": "Lição: agir com responsabilidade, não por impulso. Padrão: impulso sem estrutura que gera consequências.",
  "Touro": "Lição: construir segurança sem acumular por medo. Padrão: relação de escassez ou excesso com recursos.",
  "Gêmeos": "Lição: comunicar com profundidade e comprometimento. Padrão: comunicação superficial que nunca vai fundo.",
  "Câncer": "Lição: receber cuidado sem vergonha, cuidar sem se perder. Padrão: família como fonte de medo, não de amparo.",
  "Leão": "Lição: autoconfiança real, não performance. Padrão: busca de aprovação que nunca satisfaz.",
  "Virgem": "Lição: servir com alegria, não com obrigação. Padrão: perfeccionismo que paralisa, autocrítica que corrói.",
  "Libra": "Saturno em exaltação — lição de equilíbrio e justiça. Lição: parcerias reais, com reciprocidade. Padrão: relações desequilibradas por medo de conflito.",
  "Escorpião": "Lição: transformar sem destruir, ter poder sem precisar de controle. Padrão: uso de poder para manter segurança emocional.",
  "Sagitário": "Lição: comprometer-se com uma verdade, cumprir promessas. Padrão: expansão sem fundação, promessa sem entrega.",
  "Capricórnio": "Saturno em domicílio — lição máxima de responsabilidade. Lição: construir legado com integridade. Padrão: ambição que perde o humano no caminho.",
  "Aquário": "Saturno em domicílio — responsabilidade coletiva. Lição: liderar o grupo com sabedoria, não só inovar. Padrão: genialidade sem comprometimento.",
  "Peixes": "Lição: fé com discernimento, servir com limites. Padrão: vitimização ou dissolução de limites como recorrência."
};

// -------------------------------------------------------------------------------
// CONSTANTE 8 — QUÍRON POR SIGNO (ferida e maestria)
// -------------------------------------------------------------------------------

const QUIRON_SIGNO = {
  "Áries": "Ferida: 'Não sou capaz de existir plenamente. Preciso pedir permissão para ser.' Dom: ensina coragem autêntica e existência plena.",
  "Touro": "Ferida: 'Nunca tenho o suficiente. Não mereço conforto e prazer.' Dom: ensina valor intrínseco e segurança real.",
  "Gêmeos": "Ferida: 'Não sou inteligente. Minha voz não tem valor.' Dom: ensina comunicação como cura.",
  "Câncer": "Ferida: 'Não fui cuidada como precisava. Não sou segura.' Dom: torna-se o cuidador que não teve.",
  "Leão": "Ferida: 'Não sou especial. Não tenho direito de brilhar.' Dom: ensina expressão autêntica e valor pessoal.",
  "Virgem": "Ferida: 'Nunca sou boa o suficiente. Tenho que me justificar para existir.' Dom: ensina serviço com alegria e direito à imperfeição.",
  "Libra": "Ferida: 'Não sou amável como sou. Preciso me adaptar para ser aceita.' Dom: ensina harmonia autêntica e amor incondicional.",
  "Escorpião": "Ferida: 'Não é seguro ser profunda. Intimidade traz dor.' Dom: guia outros pela transformação porque sobreviveu à sua.",
  "Sagitário": "Ferida: 'Não sei para onde ir. Não confio na vida. Não tenho fé.' Dom: torna-se guia espiritual de quem perdeu a direção.",
  "Capricórnio": "Ferida: 'Não tenho autoridade real. Ninguém me leva a sério.' Dom: ensina autoridade legítima conquistada.",
  "Aquário": "Ferida: 'Sou diferente demais para pertencer. Sou estranha.' Dom: ensina originalidade como força, não isolamento.",
  "Peixes": "Ferida: 'Sou sensível demais para este mundo. Não sei onde começo e o outro termina.' Dom: ensina compaixão com limites e espiritualidade encarnada."
};

// -------------------------------------------------------------------------------
// CONSTANTE 9 — LILITH POR SIGNO (poder reprimido)
// -------------------------------------------------------------------------------

const LILITH_KARMICO_SIGNO = {
  "Áries": "Reprimido: raiva, iniciativa, direito de liderar. Emerge: explosões, agressividade ou passividade total. Integrar: raiva como informação e ação, não explosão nem supressão.",
  "Touro": "Reprimido: prazer, corpo, direito ao conforto. Integrar: desfrutar sem culpa nem excesso.",
  "Gêmeos": "Reprimido: curiosidade, multiplicidade, direito de mudar de ideia. Integrar: comunicação que não precisa ser consistente para ser válida.",
  "Câncer": "Reprimido: necessidade de cuidado, vulnerabilidade. Integrar: receber sem vergonha, pedir sem se diminuir.",
  "Leão": "Reprimido: brilho, grandeza, necessidade de ser vista. Integrar: visibilidade como contribuição, não vaidade.",
  "Virgem": "Reprimido: análise crítica, discernimento, o 'não'. Integrar: crítica construtiva sem autocrítica destrutiva.",
  "Libra": "Reprimido: necessidades nas relações, o 'não' no amor. Integrar: amor que inclui os próprios limites.",
  "Escorpião": "Reprimido: poder, sexualidade, intensidade. Integrar: intensidade direcionada, não suprimida.",
  "Sagitário": "Reprimido: fé própria, convicções, expansão. Integrar: ter filosofia própria sem precisar de aprovação.",
  "Capricórnio": "Reprimido: ambição, poder institucional, autoridade. Integrar: ambição sem culpa, liderança sem desculpa.",
  "Aquário": "Reprimido: originalidade radical, rebeldia, futuro. Integrar: ser diferente como ato político e evolutivo.",
  "Peixes": "Reprimido: misticidade, intuição, acesso ao invisível. Integrar: espiritualidade como poder, não como fuga."
};

// -------------------------------------------------------------------------------
// CONSTANTE 10 — CASAS KÁRMICAS (IV, VIII, XII)
// -------------------------------------------------------------------------------

const CASAS_KARMICAS = `
## CASA IV — PADRÕES FAMILIARES E ANCESTRAIS (raiz; onde a família vive dentro de você)
Analisar signo da cúspide, planetas dentro, regente e sua posição. Padrão por signo na Casa 4:
Áries: família de conflito/independência forçada → aprender a pertencer.
Touro: família material/apego à tradição → aprender a transformar.
Gêmeos: comunicação superficial → aprender profundidade emocional.
Câncer: família emocional intensa → aprender limites saudáveis.
Leão: performance e orgulho → aprender autenticidade privada.
Virgem: crítica e exigência → aprender autocompaixão.
Libra: fachada harmoniosa → aprender conflito saudável.
Escorpião: segredos e poder → aprender transparência.
Sagitário: ausência e expansão → aprender presença.
Capricórnio: obrigação e rigidez → aprender amor sem condições.
Aquário: não-convencional ou distante → aprender pertencimento.
Peixes: confusão e sacrifício → aprender limites e clareza.

## CASA VIII — MORTE, RENASCIMENTO, TRANSFORMAÇÃO (ir ao fundo para emergir diferente)
Planetas na Casa 8 indicam onde houve (e haverá) morte e renascimento simbólicos.
Sol: identidade em transformações radicais. Lua: vida emocional intensa/transformadora.
Marte: ação transformadora, corte radical. Júpiter: transformação traz expansão/herança.
Saturno: transformação lenta e difícil, mas de legado. Plutão (domicílio): transformação máxima e inevitável.

## CASA XII — KARMA OCULTO E AUTO-SABOTAGEM (abaixo da consciência; "inimigos ocultos" = partes não reconhecidas de si)
Planetas na Casa 12 agem ATRAVÉS de você sem que perceba.
Sol: subestima o próprio brilho (luz escondida). Lua: emoções não sentidas conscientemente que influenciam tudo.
Mercúrio: pensamentos não articulados que determinam escolhas. Vênus: desejos reprimidos que emergem inesperados.
Marte: raiva não expressa que corrói por dentro. Júpiter: proteção que age sem você perceber.
Saturno: medo profundo que estrutura a vida sem ser visto. Plutão: poder de transformação latente, ainda não despertado.
`;

// -------------------------------------------------------------------------------
// CONSTANTE 11 — PADRÕES TRANSGERACIONAIS + RELACIONAMENTOS + MISSÃO
// -------------------------------------------------------------------------------

const PADROES_E_MISSAO = `
## PADRÕES TRANSGERACIONAIS (transmitidos por modelagem inconsciente, não genética)
Sinais no mapa: Lua em Casa 4 ou aspecto com Saturno (padrão materno); Saturno em Casa 4/10 (padrão paterno);
Plutão em Casa 4 (transformação de padrão familiar profundo); Nodo Sul em Casa 4 (família como zona de conforto);
Casa 4 muito habitada (família como tema central do karma).
OS 7 PADRÕES MAIS COMUNS:
1 ESCASSEZ ("nunca é suficiente") — Saturno C2 ou aspecto difícil com Vênus → consciência de abundância presente.
2 AMOR CONDICIONAL ("só sou amada quando mereço") — Lua difícil com Saturno → amor incondicional (terapia, comunidade).
3 SILÊNCIO E SEGREDO ("certas verdades não se dizem") — Mercúrio C12 ou Plutão C3 → verbalizar o não-dito.
4 RIGIDEZ E CONTROLE ("controle é sobrevivência") — Saturno com Lua ou Plutão C1 → rendição consciente, meditação.
5 VITIMIZAÇÃO ("não tenho poder") — Netuno C1 ou Saturno com Sol → ações onde o resultado depende só de você.
6 HIPERRESPONSABILIDADE ("sou responsável por todos") — Lua com Saturno, Vênus C12, NS Câncer → deixar os outros assumirem.
7 ABANDONO E TRAIÇÃO ("quem amo me abandona") — Saturno/Plutão C7, Lilith com Lua → segurança interna, terapia de apego.

## RELACIONAMENTOS KÁRMICOS (relação que veio ensinar algo)
Sinais de relação kármica: atração intensa imediata; padrões que se repetem; gatilhos profundos; difícil de sair mesmo doendo; transformação inevitável após o fim.
No mapa: sobreposição de Nodos; Saturno de um com Sol/Lua do outro; Plutão de um com Vênus do outro; Casa 8 habitada; Nodo Sul em Casa 7.
4 TIPOS: ESPELHO (oposições — o que critica no outro é o que falta integrar); PROFESSOR (Saturno de um sobre pessoais do outro — a dor é o aprendizado pedido); ALMA GÊMEA EVOLUTIVA (Nodos complementares — apoia o Nodo Norte); PADRÃO REPETIDO (o padrão já está no mapa natal — o problema é interno, não o outro).

## MISSÃO DE ALMA (qualidade de presença que serve ao mundo — não profissão)
Síntese de: Nodo Norte (direção) + Sol (essência) + Saturno (lição que vira dom) + Quíron (ferida que vira maestria) + MC (manifestação).
FÓRMULA: "Você veio para [Nodo Norte] usando o dom de [Quíron integrado] a fim de [MC]."
`;

// -------------------------------------------------------------------------------
// CONSTANTE 12 — ESTRUTURA DO RELATÓRIO + UPSELL (individual)
// -------------------------------------------------------------------------------

const ESTRUTURA_KARMICO = `
## ESTRUTURA DO RELATÓRIO (22 seções, nesta ordem)
EXTENSÃO: relatório PREMIUM EXTENSO. Os números são PISOS MÍNIMOS de palavras, NUNCA tetos. É proibido resumir, agrupar ou abreviar. Na dúvida, vá mais fundo. Cite SEMPRE signo + casa + grau reais de cada ponto (Nodos, Saturno, Quíron, Plutão, Lilith) e os aspectos com orbe, correlacionando-os. Cada padrão difícil é nomeado com compaixão e SEMPRE seguido do caminho de libertação, nunca como rótulo clínico.

1. CARTA AO CLIENTE (>=700): acolhe antes de revelar; "você não está aqui por acaso". Tom de quem enxerga a alma, não a culpa.
2. O QUE É KARMA PARA ESTE CLIENTE (>=1200): não genérico; ancore no mapa real, nas três câmaras (vida anterior, ancestral, em resolução).
3. NODO SUL — DE ONDE VOCÊ VEM (>=2800): signo + casa + regente do NS (signo/casa onde está) + planetas conjuntos ao NS (orbe 8°); talentos prontos, zona de conforto, maestria que virou prisão.
4. NODO NORTE — PARA ONDE VOCÊ EVOLUI (>=3000): signo + casa + regente do NN (signo/casa) + planetas conjuntos ao NN; por que é difícil, o que muda quando se honra, práticas.
5. EIXO KÁRMICO E A INTEGRAÇÃO ENTRE OS NODOS (>=1600): o eixo de casas (1-7, 2-8, 3-9, 4-10, 5-11, 6-12) e seu tema central; as fases entre os Nodos e onde a pessoa está agora.
6. A SERPENTE KÁRMICA — O CICLO CENTRAL (>=1800): identificação, como se manifesta hoje, o ponto exato de virada.
7. SEU SAMSARA ESPECÍFICO (>=1600): nomeie ao menos 3 ciclos que se repetem, o gatilho de cada um e o ponto de interrupção.
8. PLANETAS RETRÓGRADOS NATAIS — O KARMA REAPRENDIDO (>=1600): para cada planeta Rx natal, o tema kármico (energia internada em outro tempo, reaprendida de dentro para fora). Se não houver Rx, diga e leia a ausência.
9. PLUTÃO — MORTE E RENASCIMENTO (>=2000): casa + aspectos com pessoais (Sol/Lua/Vênus/Marte/Mercúrio); o que se transforma, por que a resistência dói, o que nasce.
10. SATURNO — A LIÇÃO KÁRMICA CENTRAL (>=2000): signo + casa + retrógrado? + aspectos com os Nodos; o que cobra, por que parece injusto, a estrutura que dura.
11. QUÍRON — A FERIDA SAGRADA (>=2000): signo + casa + aspecto com NN; a ferida, como se manifesta, o dom que ela esconde, o caminho de maestria.
12. LILITH — O PODER REPRIMIDO (>=1400): signo + casa; o que foi silenciado/banido, como emerge, como integrar sem destruir.
13. CASA 12 — O KARMA OCULTO (>=2000): signo + regente + planeta a planeta (cada planeta na 12 com sua leitura kármica); o que opera abaixo da consciência.
14. CASA 4 E A HERANÇA FAMILIAR (>=2400): signo + regente + planeta a planeta; cruzamentos Lua×Saturno, Lua×Plutão, Lua×Urano; o padrão materno e o ancestral.
15. PADRÕES TRANSGERACIONAIS (>=2000): o herdado da linhagem, o padrão materno e o paterno, como romper cada um conscientemente.
16. PADRÕES EM RELACIONAMENTOS (>=1600): o padrão no amor, por que atrai o que atrai, como evoluir.
17. OS OITO CRUZAMENTOS KÁRMICOS — A SÍNTESE (>=2400): execute e narre os 8 cruzamentos do BLOCO DE CRUZAMENTOS; é aqui que o mapa vira diagnóstico integrado, não peças soltas.
18. ANATOMIA DAS SOMBRAS KÁRMICAS (>=2600): siga o BLOCO DE SOMBRAS KÁRMICAS; identifique SOMENTE os padrões presentes e desenvolva cada um no padrão de quatro movimentos. Melhor 3 fundos que 6 rasos.
19. MISSÃO DE ALMA (>=1600): por que está aqui, a contribuição única, como honrar no cotidiano.
20. PRÁTICAS DE LIBERTAÇÃO (>=1600): de 5 a 7 práticas ESPECÍFICAS para este mapa (não genéricas), cada uma ancorada num indicador real.
21. AFIRMAÇÕES E PRÓXIMOS 3 MESES (>=1000): 10 afirmações baseadas nestes Nodos/Plutão/Quíron + o que fazer nos próximos meses, em ordem.
22. MENSAGEM FINAL E PRÓXIMOS PASSOS (>=900): não veio para sofrer, veio para se libertar; padrões não são identidade; o mapa não é sentença. Inclua o aviso de responsabilidade e 1-2 cross-sells coerentes (ver UPSELL). Encerre com a assinatura "Com cuidado, nossa astróloga - ASTRALIA".

## TOM E REGRAS ABSOLUTAS
Nome do cliente ao longo do documento. Cada padrão TEM saída clara. Nunca culpabiliza, sempre empodera. Cada seção ancorada nos dados reais (nunca genérico). Linguagem profunda mas acessível, filosófica mas prática. Tom: conversa sincera com quem acredita em você. Nunca catastrófico ou determinista. NUNCA assine como "equipe".

## UPSELL (individual; surge como conselho genuíno, no gancho real)
- Mapa Profissional: conflito entre vocação e padrão kármico.
- Revolução Solar: ciclo de transformação em curso (timing anual).
- Previsões 18 Meses: transição/crise (janelas de mudança).
- Mapa da Lilith: Lilith forte ou temas de poder/autenticidade.
- Sinastria: quando os padrões de relacionamento são centrais.
- Mapa Astral Personalizado: cliente novo, quando o Kármico abriu mais perguntas que respostas.
Ofereça 1-2 mais relevantes ao que o mapa revelou.
`;

// -------------------------------------------------------------------------------
// FUNÇÃO BUILD
// -------------------------------------------------------------------------------
// dados: { nome, dataNascimento, horaNascimento, localNascimento, contexto? }
// mapaNatal: { "Nodo Norte":{signo,casa,grau}, "Plutão":..., "Saturno":..., "Quíron":...,
//   "Lilith":..., Lua, Sol, Vênus, Marte, Mercúrio, Netuno, MC, ASC,
//   cuspideCasa4, cuspideCasa8, cuspideCasa12 }  (Nodo Sul é calculado se ausente)
// aspectos: [{ planeta1, aspecto, planeta2, orbe }]

function buildPromptMapaKarmico(dados, mapaNatal, aspectos = []) {
  const nome = dados.nome || '[NOME]';
  const analise = analisarKarma(mapaNatal, aspectos);
  const ns = analise.nodoSulCalculado;
  const nn = mapaNatal["Nodo Norte"] || null;
  const t = analise.tabelaOverlay;

  const blocoDados = `Nodo Norte: ${t.nodoNorte} | Nodo Sul: ${t.nodoSul}
Plutão: ${t.plutao} | Saturno: ${t.saturno} | Quíron: ${t.quiron} | Lilith: ${t.lilith} | Lua: ${t.lua}
Casa IV: cúspide ${t.casaIV.cuspide||'?'}, ocupantes [${t.casaIV.ocupantes.join(', ')||'vazia'}], regente ${t.casaIV.regente?t.casaIV.regente.tradicional:'?'}
Casa VIII: cúspide ${t.casaVIII.cuspide||'?'}, ocupantes [${t.casaVIII.ocupantes.join(', ')||'vazia'}]
Casa XII: cúspide ${t.casaXII.cuspide||'?'}, ocupantes [${t.casaXII.ocupantes.join(', ')||'vazia'}]`;

  const blocoSerpente = analise.serpente.length ? analise.serpente.map(s=>`  - ${s}`).join("\n") : "  - (forneça aspectos para detecção automática)";
  const blocoPadroes = analise.padroesTransgeracionais.length
    ? analise.padroesTransgeracionais.map(p=>`  - ${p.nome}: ${p.lema} Quebrar: ${p.quebrar}`).join("\n")
    : "  - (nenhum sinal automático detectado nos aspectos fornecidos — investigar manualmente)";

  const todosPlanetas = Object.entries(mapaNatal)
    .filter(([k,v]) => v && typeof v === 'object' && SIGNOS_ORDEM.includes(v.signo))
    .map(([p,d]) => `  - ${p}: ${d.signo} ${d.grau ?? '?'}°${d.retrogrado ? ' ℞' : ''} (Casa ${d.casa ?? '?'})`).join("\n");

  const prompt = `Você é um astrólogo com 30 anos de experiência em astrologia evolutiva e kármica, com formação em psicologia transpessoal e base em filosofias orientais (karma, samsara, dharma). Combina rigor técnico com compaixão genuína. Cliente: ${nome}. NUNCA é determinista — use "tende a", "pode indicar", jamais afirmações absolutas.
OBJETIVO: revelar padrões com precisão técnica; oferecer caminhos de libertação genuínos; NUNCA culpabilizar, sempre empoderar; linguagem profunda mas acessível; honesto sobre desafios sem ser catastrófico.
Comprimento: 10.000-15.000 palavras.

# DADOS DA CLIENTE
Nome: ${nome} | Nascimento: ${dados.dataNascimento||'[DATA]'}, ${dados.horaNascimento||'[HORA]'}, ${dados.localNascimento||'[LOCAL]'}
${dados.contexto ? `Contexto trazido pela cliente: ${dados.contexto}` : 'Contexto da cliente: (não fornecido)'}

# MAPA NATAL
${todosPlanetas}
  - MC: ${mapaNatal.MC ? (mapaNatal.MC.signo+' '+(mapaNatal.MC.grau||'')) : '?'} | ASC: ${mapaNatal.ASC || '?'}

# TABELA DE OVERLAY KÁRMICA (já calculada — use como base)
${blocoDados}

# SINAIS DA SERPENTE KÁRMICA (detectados automaticamente)
${blocoSerpente}

# PADRÕES TRANSGERACIONAIS COM SINAL NO MAPA (detectados automaticamente)
${blocoPadroes}

# ASPECTOS KÁRMICOS (orbe ≤5°)
${aspectos.length ? aspectos.map(a=>`  - ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe ${a.orbe ?? '?'}°)`).join("\n") : "(não fornecidos — leitura por signo/casa)"}

${FUNDAMENTOS_KARMICOS}

## NODO SUL POR SIGNO (use o desta cliente: ${ns?ns.signo:'?'})
${Object.entries(NODO_SUL_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n\n")}

## NODO SUL POR CASA (use a desta cliente: Casa ${ns?ns.casa:'?'})
${Object.entries(NODO_SUL_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## NODO NORTE POR SIGNO (use o desta cliente: ${nn?nn.signo:'?'})
${Object.entries(NODO_NORTE_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n\n")}

## NODO NORTE POR CASA (use a desta cliente: Casa ${nn?nn.casa:'?'})
${Object.entries(NODO_NORTE_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## PLUTÃO POR CASA
${Object.entries(PLUTAO_KARMICO_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## SATURNO POR SIGNO
${Object.entries(SATURNO_KARMICO_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

## QUÍRON POR SIGNO
${Object.entries(QUIRON_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

## LILITH POR SIGNO
${Object.entries(LILITH_KARMICO_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

${CASAS_KARMICAS}
${PADROES_E_MISSAO}
${ESTRUTURA_KARMICO}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "Carta ao Cliente", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" exato (1-20); "texto" em PROSA profunda corrida (segunda pessoa), respeitando os mínimos de palavras por seção.

# LEMBRETES
1. Use o nome ${nome} em todo o documento
2. Nodo Sul e Norte com tratamento profundo (mín. 700 e 800 palavras)
3. Identifique a Serpente Kármica e nomeie pelo menos 3 samsaras (ciclos) específicos
4. Cada padrão TEM saída prática — nunca culpabilize, sempre empodere
5. Padrões transgeracionais: nomeie o materno e o paterno
6. Práticas e afirmações ESPECÍFICAS para este mapa (não genéricas)
7. Tom: profundo, esperançoso, jamais catastrófico
8. Pelo menos 1-2 chamadas para outro mapa Astralia (individual, no gancho real) — sem combo
9. Nomeie as tendências difíceis (manipulação, controle, possessividade, obsessão, necessidade de validação/centralidade) ANCORADAS no posicionamento real e SEMPRE com caminho de integração — nunca como rótulo clínico
10. Seja inspirador: a cada ciclo ${nome} renasce com novos caminhos e oportunidades
11. Mínimo 10.000 palavras

Gere agora o Mapa Kármico completo (seções 1-20). Retorne apenas o JSON.`;

  return {
    diagnostico: {
      cliente: nome,
      nodoNorte: t.nodoNorte,
      nodoSul: t.nodoSul,
      serpente: analise.serpente,
      padroesTransgeracionais: analise.padroesTransgeracionais.map(p=>p.nome),
      casaIV: t.casaIV, casaVIII: t.casaVIII, casaXII: t.casaXII
    },
    prompt,
    metadados: {
      framework: "Mapa Kármico — Nodos + Plutão + Saturno + Quíron + Lilith + Casas IV/VIII/XII + Serpente + 7 padrões transgeracionais",
      modeloRecomendado: "claude-sonnet-4-6",
      palavrasEsperadas: "10.000-15.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "1.0"
    }
  };
}

// -------------------------------------------------------------------------------
// CORPO DE CONHECIMENTO KÁRMICO (reusado pela ponte síncrona)
// -------------------------------------------------------------------------------
function montarConhecimentoKarmico() {
  return `${FUNDAMENTOS_KARMICOS}

## NODO SUL POR SIGNO
${Object.entries(NODO_SUL_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n\n")}

## NODO SUL POR CASA
${Object.entries(NODO_SUL_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## NODO NORTE POR SIGNO
${Object.entries(NODO_NORTE_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n\n")}

## NODO NORTE POR CASA
${Object.entries(NODO_NORTE_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## PLUTÃO POR CASA
${Object.entries(PLUTAO_KARMICO_CASA).map(([c,txt])=>`Casa ${c}: ${txt}`).join("\n")}

## SATURNO POR SIGNO
${Object.entries(SATURNO_KARMICO_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

## QUÍRON POR SIGNO
${Object.entries(QUIRON_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

## LILITH POR SIGNO
${Object.entries(LILITH_KARMICO_SIGNO).map(([s,txt])=>`${s}: ${txt}`).join("\n")}

${CASAS_KARMICAS}
${PADROES_E_MISSAO}`;
}

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// BLOCOS METODOLÓGICOS (diretrizes operacionais kármicas) — injetados por etapa
// -------------------------------------------------------------------------------
const BLOCO_CRUZAMENTOS_KARM = `=== BLOCO DE CRUZAMENTOS KÁRMICOS (execute os oito e narre o resultado) ===
Não basta ler cada indicador isolado: o diagnóstico kármico nasce do cruzamento entre eles. Execute os oito e traga o resultado integrado.
1. NODO NORTE signo x NODO NORTE casa: "sua alma veio aprender [qualidade do signo] na área de [casa]".
2. NODO SUL signo x planetas conjuntos ao NS: o que trouxe e o modus operandi kármico (cada planeta conjunto detalha o dom/armadilha).
3. REGENTE DO NN x sua posição (signo/casa/aspectos): o GPS da missão — como e onde ela se realiza.
4. SATURNO x NODOS: Saturno em aspecto ao NN (a lição é parte da missão) ou ao NS (a lição vem do passado); o signo de Saturno resolve o padrão do NS?
5. QUÍRON x NODO NORTE: quando há aspecto, a cura da ferida É a missão; mostre como uma serve à outra.
6. PLUTÃO x NODOS: transformação como caminho (aspecto ao NN) ou padrão de poder trazido (aspecto ao NS); a casa de Plutão x casa do NN.
7. CASA 12 x mapa geral: planetas na 12 = karma oculto nos bastidores; o regente da 12 mostra como o oculto se expressa na vida consciente.
8. CASA 4 x padrões familiares: signo/planetas da 4 e seu regente x Nodos; a herança serve ou obstrui a missão? Lua x Casa 4 = padrão materno e ancestralidade.`;

const BLOCO_SOMBRAS_KARM = `=== BLOCO DE SOMBRAS KÁRMICAS ===
O karma também é o que ainda não foi aprendido e aparece como sombra. Identifique SOMENTE os padrões claramente presentes no mapa. Para CADA um, escreva quatro movimentos: (1) NOMEAÇÃO suave ancorada na configuração; (2) PERGUNTA reflexiva que questiona com compaixão e deixa a pessoa responder por dentro; (3) CONEXÃO com o aspecto/casa exato; (4) REENCAMINHAMENTO: o dom que a sombra esconde quando integrada. Melhor 3 sombras fundas que 6 rasas.

PADRÕES MODELADOS (gatilho -> núcleo; adapte ao mapa real):
- NÓ SUL ATIVO DEMAIS, POUCO NODO NORTE (muitos planetas conj. NS + regente do NN mal posicionado): a pessoa permanece na zona de conforto kármica e nunca arrisca o crescimento. "Existe uma versão de você que funcionou muito bem em outro tempo — e esse tempo passou. O que você seria se parasse de usar o que já sabe como escudo contra o que ainda precisa aprender?"
- SATURNO TENSO COM O NODO NORTE (quadratura/oposição): a responsabilidade vira desculpa para não crescer. "Sua responsabilidade é real. Mas ela está sendo usada como razão para não fazer o que você veio fazer?"
- CASA 12 MUITO HABITADA, CASA 1 VAZIA (3+ na 12, nenhum na 1): vive nos bastidores do próprio karma e não assume o protagonismo. "Você existe sobretudo no invisível. O que aconteceria se trouxesse para a luz o que cultiva no silêncio?"
- PLUTÃO TENSO + NODO SUL EM ESCORPIÃO: padrões de controle e intensidade que custam a soltar. "O poder que você tem é real; a questão é o que faz com ele — serve à transformação ou ao controle? É mais fácil transformar o outro do que a si mesma?"
- QUÍRON CONJUNTO AO NODO SUL SEM TRABALHO TERAPÊUTICO: carrega a ferida sem perceber que ela é o dom. "A área que mais te envergonha pode ser exatamente onde você tem mais a oferecer. O que mudaria se parasse de esconder a ferida e começasse a usá-la?"
Para padrões presentes não modelados acima, use o mesmo formato de quatro movimentos, sempre ancorado no aspecto real.`;

const BLOCO_PERGUNTAS_KARM = `=== BLOCO DE PERGUNTAS REFLEXIVAS (encerre as seções relevantes com a pergunta certa) ===
NODO NORTE: o que você mais evita fazer e que, quando faz, traz mais realização? Em qual situação se sente mais vivo, mesmo desconfortável? Que versão sua precisa nascer, mesmo que a atual morra um pouco?
NODO SUL: em que áreas recorre automaticamente ao mesmo padrão que não funciona? Que talento vem tão fácil que o impede de desenvolver outros? O que poderia largar que já não é você, mesmo tendo sido?
SATURNO: qual área a vida mais cobra e você mais resiste? Se sua maior dificuldade é sua maior escola, o que ela ensina? Onde você exige de si mais do que de qualquer outro?
QUÍRON: o que na sua história gostaria que tivesse sido diferente? O que você sabe sobre o humano que só se sabe passando pelo que passou? Já começou a curar nos outros o que ainda cura em si?
CASA 12 / KARMA OCULTO: existe padrão que se repete e você não explica pela vida atual? Há algo que a família "nunca falou" e você sente como presença? O que, trazido à luz, mudaria tudo?`;

// PONTE SÍNCRONA — buildPromptKarmico(dados, planetasInfo, casasInfo, aspectosInfo)
// Mesma assinatura da ponte do Lilith/Personalizado (leitura.js / worker).
// Recebe os dados JÁ FORMATADOS em texto e RETORNA A STRING do prompt.
// -------------------------------------------------------------------------------
const SECOES_POR_PARTE_KARM = {
  completo:[1,22],
  parte1:[1,4],    // carta, o que é karma, Nodo Sul, Nodo Norte
  parte2:[5,8],    // eixo/integração, serpente, samsara, retrógrados
  parte3:[9,12],   // Plutão, Saturno, Quíron, Lilith
  parte4:[13,16],  // Casa 12, Casa 4/herança, transgeracional, relacionamentos
  parte5:[17,18],  // 8 cruzamentos, sombras kármicas
  parte6:[19,22],  // missão, práticas, afirmações+3 meses, mensagem final
};
const BLOCOS_POR_PARTE_KARM = {
  completo:{ teoria:true,  cruzamentos:true,  sombras:true,  perguntas:true  },
  parte1:  { teoria:true,  cruzamentos:false, sombras:false, perguntas:true  },
  parte2:  { teoria:true,  cruzamentos:false, sombras:false, perguntas:true  },
  parte3:  { teoria:true,  cruzamentos:false, sombras:false, perguntas:true  },
  parte4:  { teoria:true,  cruzamentos:false, sombras:false, perguntas:true  },
  parte5:  { teoria:true,  cruzamentos:true,  sombras:true,  perguntas:false },
  parte6:  { teoria:false, cruzamentos:false, sombras:false, perguntas:false },
};
function buildPromptKarmico(dados, planetasInfo, casasInfo, aspectosInfo, parte = "completo") {
  const nome = dados.nome || '[NOME]';
  const _f = SECOES_POR_PARTE_KARM[parte] || SECOES_POR_PARTE_KARM.completo, _ini = _f[0], _fim = _f[1];
  const _b = BLOCOS_POR_PARTE_KARM[parte] || BLOCOS_POR_PARTE_KARM.completo;
  const _teoria = _b.teoria ? "\n\n" + montarConhecimentoKarmico() : "";
  const _cruz = _b.cruzamentos ? "\n\n" + BLOCO_CRUZAMENTOS_KARM : "";
  const _somb = _b.sombras ? "\n\n" + BLOCO_SOMBRAS_KARM : "";
  const _perg = _b.perguntas ? "\n\n" + BLOCO_PERGUNTAS_KARM : "";
  const _escopo = parte === "completo"
    ? "Gere TODAS as 22 seções, na ordem, sem agrupar nem resumir."
    : `ESCOPO DESTA GERAÇÃO (sobrepõe qualquer outra instrução de quantidade): esta é a ${parte}. Gere SOMENTE as seções ${_ini} a ${_fim} — NÃO gere as demais e NÃO tente cobrir as 22 de uma vez. Mantenha o \"numero\" global real (de ${_ini} a ${_fim}). Como você produz apenas parte do relatório, APROFUNDE AO MÁXIMO cada seção desta faixa: exceda os mínimos de palavras, traga mais exemplos, mais correlações e mais nuance. Não economize.`;
  return `Você é um astrólogo brasileiro com 30 anos de experiência em astrologia evolutiva e kármica, com formação em psicologia transpessoal e base em filosofias orientais (karma, samsara, dharma). Escreve em PORTUGUÊS DO BRASIL, combinando rigor técnico com compaixão genuína. Revela sem condenar, ilumina sem traumatizar. NUNCA é determinista ou culpabilizante — use sempre "tende a", "pode indicar", nunca afirmações absolutas. O mapa revela padrões; jamais sentencia.

MISSÃO: revelar a ${nome} os padrões da alma — Nodo Sul e Norte, a Serpente Kármica, o samsara que se repete, Plutão, Saturno, Quíron, Lilith, as casas kármicas (IV, VIII, XII), os padrões transgeracionais (materno e paterno) e a missão de alma — sempre com caminho de libertação. Personalize tudo usando o nome ${nome}.

NUNCA invente posições — use APENAS os dados reais abaixo. Calcule a idade a partir da data de nascimento para contextualizar.

=== DADOS REAIS DE ${nome.toUpperCase()} ===
Nascimento: ${dados.data || dados.dataNascimento || '[DATA]'}${dados.hora ? ' às ' + dados.hora : ''}
Cidade: ${dados.cidade || dados.localNascimento || '[LOCAL]'}
${dados.contexto ? 'Contexto / padrão que se repete: ' + dados.contexto : ''}

${planetasInfo}

${casasInfo}

${aspectosInfo}${_teoria}

${ESTRUTURA_KARMICO}${_cruz}${_somb}${_perg}

=== INSTRUÇÕES DE SAÍDA ===
${_escopo}

Gere uma leitura COMPLETA e profundamente personalizada do Mapa Kármico de ${nome}, seguindo EXATAMENTE a estrutura acima (22 seções), na ordem dada — gerando apenas a faixa de seções definida no escopo desta geração. Cada seção recebe o seu próprio desenvolvimento aprofundado — NÃO agrupe nem resuma. Cite SEMPRE o signo, a casa e o GRAU reais de cada ponto (Nodos, Plutão, Saturno, Quíron, Lilith) e os aspectos reais com o orbe, correlacionando os posicionamentos entre si. Identifique a Serpente Kármica e nomeie ao menos 3 samsaras (ciclos) específicos. Nomeie as tendências difíceis (manipulação, controle, possessividade, obsessão, necessidade de validação/centralidade etc.) ancoradas no posicionamento real e SEMPRE com o caminho de integração — nunca como rótulo clínico. Escreva em prosa rica, em segunda pessoa, com profundidade, aconselhamento e exemplos situacionais contextualizados à fase de vida. Nunca culpabilize, sempre empodere. Seja inspirador: lembre que a cada ciclo ${nome} renasce com novos caminhos e oportunidades.

Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON:
{
  "secoes": [
    {"titulo": "☋ Título da seção (cite signo/casa/grau quando couber)", "texto": "vários parágrafos ricos e personalizados"}
  ]
}`;
}


module.exports = {
  buildPromptMapaKarmico,
  buildPromptKarmico,
  montarConhecimentoKarmico,
  analisarKarma, calcularNodoSul, casaOposta, ocupantesCasa, regenteCasa,
  detectarSerpente, detectarPadroesTransgeracionais,
  FUNDAMENTOS_KARMICOS, NODO_SUL_SIGNO, NODO_SUL_CASA, NODO_NORTE_SIGNO, NODO_NORTE_CASA,
  PLUTAO_KARMICO_CASA, SATURNO_KARMICO_SIGNO, QUIRON_SIGNO, LILITH_KARMICO_SIGNO,
  CASAS_KARMICAS, PADROES_E_MISSAO, ESTRUTURA_KARMICO, SIGNO_OPOSTO,
  BLOCO_CRUZAMENTOS_KARM, BLOCO_SOMBRAS_KARM, BLOCO_PERGUNTAS_KARM,
  SECOES_POR_PARTE_KARM, BLOCOS_POR_PARTE_KARM
};
