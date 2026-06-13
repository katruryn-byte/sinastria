// =============================================================================
// prompt-revolucao-solar.js  —  Astralia · Revolução Solar Premium
// Builder do prompt de geração. Funde a diretriz completa (Opus) com a voz da
// Lilith + camadas de GUIA DE AÇÕES e MANUAL DE ALERTAS.
// Reveladora, premonitória, orientadora — indica acontecimentos e pode
// determinar de leve. Reflete o ano REAL do cliente a partir dos dados injetados.
// -----------------------------------------------------------------------------
// MODELO ALVO: Claude Opus 4.8 (claude-opus-4-8) — produto mais complexo do
//   ecossistema; pede o modelo mais profundo. NOTA DE DECISÃO: a esteira hoje
//   gera PDF com Sonnet 4.6. Para usar Opus só aqui, a chamada no worker
//   (gerar-combo-item) precisa especificar 'claude-opus-4-8' para este produto.
//   Opus = maior profundidade e custo. Decisão da Jordana.
// -----------------------------------------------------------------------------
// SEM TETO DE PALAVRAS: os números abaixo são PISOS mínimos a superar, jamais
//   tetos. O relatório vai até onde o mapa pedir — completo, nunca truncado.
// -----------------------------------------------------------------------------
// COMO INTEGRAR:
//   const { buildPromptRevolucaoSolar } = require('./prompts-combo/prompt-revolucao-solar');
//   const prompt = buildPromptRevolucaoSolar(dados);
//   (se o repo usar ESM, troque module.exports por: export { buildPromptRevolucaoSolar })
//
// FORMATO ESPERADO DE `dados` (tudo já CALCULADO antes — o builder não calcula astrologia):
//   {
//     nome: "Maria",
//     contexto: { desejoDoAno, maiorPreocupacao, profissional, amorosa, financeira,
//                 decisaoAdiada, mudouUltimos6m, intuicaoDoAno, medoEspecifico, oQueSeriaBomAno },
//     ciclo: { ano, aniversario, proximo, idadeNoAniversario, mesesVividos, mesesRestantes,
//              ponto, horaRetornoSolar: "19:47", fuso: "Brasília" },
//     local: { aniversarioIgualNatal, cidadeAniversario },
//     natal: { ascSigno, solSigno, luaSigno },
//     rs: {
//        ascSigno, mcSigno, planetaMaisForte, temaCentral,
//        solCasaNatal, luaSigno, luaCasaNatal,
//        venusCasaNatal, marteCasaNatal, mercurioCasaNatal,
//        jupiterCasaNatal, saturnoCasaNatal, plutaoCasaNatal,
//        uranoCasaNatal, netunoCasaNatal, nodoCasaNatal, lilithCasaNatal,
//        casasMaisHabitadas: [ {casa, n}, ... ],
//        jupiterNaProfeccao, saturnoNaProfeccao
//     },
//     profeccao: { casa, signoCuspide, senhorDoAno, senhorNatal, senhorRS },
//     aspectosRSxNatal: [ {linha, orbe, ht:"H"|"T", efeito}, ... ],
//     aspectosInternosRS: [ {linha, orbe, ht}, ... ],
//     gatilhosAtivos: [ "[AMOR] Vênus RS na Casa 7 natal", ... ]
//   }
// =============================================================================

// ----------------------------------------------------------------------------
// LOOKUPS — condensados da diretriz. O builder injeta no prompt APENAS a
// entrada que corresponde ao mapa do cliente (prompt enxuto e focado no ano real).
// ----------------------------------------------------------------------------

const ASC_RS = {
  "Áries":"o ano da iniciativa e da presença — corpo em rajadas, pede movimento; abre o que estava parado; assume papéis de liderança que vinha adiando; cuidado com agir sem fundação. Palavras: coragem, começo, presença.",
  "Touro":"o ano da construção e dos sentidos — corpo pede prazer e descanso; dinheiro, imóveis e recursos no centro; constrói algo de longo prazo; cuidado com teimosia e apego. Palavras: estabilidade, valor, prazer.",
  "Gêmeos":"o ano da comunicação e das muitas frentes — sistema nervoso acelerado; a voz ganha alcance; aprende, escreve, conecta; cuidado com dispersão. Palavras: voz, curiosidade, troca.",
  "Câncer":"o ano do cuidado e das raízes — corpo cíclico e sensível; um ciclo familiar se encerra ou se transforma; lar e emoção dominam; cuidado com hipersensibilidade e limites. Palavras: lar, memória, pertencimento.",
  "Leão":"o ano do brilho e da visibilidade — vitalidade alta, coração e coluna sensíveis; reconhecimento chega, aceite-o; aparece, cria, lidera, ama; cuidado com a sede de aprovação. Palavras: palco, criação, amor.",
  "Virgem":"o ano do aprimoramento e do serviço — corpo sensível à rotina e à alimentação; revisões importantes em trabalho e saúde; organiza e serve com excelência; cuidado com o perfeccionismo que paralisa. Palavras: excelência, saúde, discernimento.",
  "Libra":"o ano das parcerias e do equilíbrio — corpo pede harmonia, rins e hormônios sensíveis; uma parceria se define (aliança, contrato ou encerramento); cuidado com a indecisão e o ceder demais. Palavras: parceria, beleza, justiça.",
  "Escorpião":"o ano da transformação e da profundidade — corpo amplificado, sistema reprodutor sensível; um 'antes e depois'; verdades ocultas vêm à tona; cuidado com obsessão e ciúme. Palavras: profundidade, poder, renascimento.",
  "Sagitário":"o ano da expansão e da aventura — corpo quer movimento e ar livre, fígado e quadris sensíveis; algo leva além dos limites habituais (viagem, estudo, filosofia); cuidado com excesso sem fundamento. Palavras: fé, horizonte, liberdade.",
  "Capricórnio":"o ano da maturidade e do legado — corpo resistente, joelhos e ossos pedem cuidado; chamada a assumir responsabilidades maiores; constrói algo que dura; cuidado com a frieza e o excesso de trabalho. Palavras: estrutura, responsabilidade, ambição.",
  "Aquário":"o ano da originalidade e das redes — sistema nervoso elétrico, tornozelos e circulação sensíveis; uma decisão que parece 'fora da curva' é o que a evolução pede; cuidado com o desapego que isola. Palavras: inovação, grupo, futuro.",
  "Peixes":"o ano da espiritualidade e da compaixão — corpo hipersensível, reage a substâncias, pés e linfa sensíveis; o invisível fica mais real que o visível; arte e intuição florescem; cuidado com a fuga e a falta de limite. Palavras: entrega, arte, transcendência."
};

const SOL_CASA = {
  1:"IDENTIDADE E PRESENÇA — o ano de se reencontrar e se reapresentar; reinvenção pessoal, possível mudança visual; o mundo reage diferente porque você está diferente.",
  2:"RECURSOS E VALOR PRÓPRIO — o ano do dinheiro, dos talentos e da autoestima; tende a haver mudança na renda (novo trabalho, aumento, reconstrução).",
  3:"COMUNICAÇÃO E APRENDIZADO — o ano da voz e da mente; um projeto de comunicação (livro, curso, canal) ganha força; tira ideias da cabeça e põe no mundo.",
  4:"LAR E FAMÍLIA — o ano das raízes; mudança de casa, reforma, reaproximação ou encerramento de ciclo doméstico; trabalho de base emocional.",
  5:"CRIATIVIDADE E AMOR ROMÂNTICO — o ano do prazer e da criação; romance intenso, obra que se concretiza, permissão de ser vista.",
  6:"SAÚDE E TRABALHO COTIDIANO — o ano do corpo e da rotina; mudança de função; fundações sólidas mais que holofotes.",
  7:"PARCERIAS — o ano das relações formais; casamento, sociedade ou separação; o outro como espelho; contratos com peso especial.",
  8:"TRANSFORMAÇÃO E INTIMIDADE — o ciclo mais intenso; algo que era deixa de ser; trabalho de sombra, herança, recursos compartilhados.",
  9:"EXPANSÃO E FILOSOFIA — o ano de crescer; viagem significativa, estudo superior, publicação, nova filosofia de vida; cruzar fronteiras.",
  10:"CARREIRA E REPUTAÇÃO — um dos anos mais propícios à carreira em todo o ciclo de vida; reconhecimento, novo cargo, visibilidade; apareça.",
  11:"REDES E SONHOS — o ano do coletivo; novo grupo ou comunidade, amizade importante, projeto coletivo que decola; o futuro começa agora.",
  12:"ESPIRITUALIDADE E RECOLHIMENTO — o ano mais interior; retiro, terapia profunda, finalização de ciclos; o invisível é o mais importante."
};

const LUA_SIGNO = {
  "Áries":"emoções rápidas e intensas; nutre-se de ação e autonomia; risco de impulsividade que fere.",
  "Touro":"emoções lentas e profundas; nutre-se de constância e conforto; risco de teimosia emocional.",
  "Gêmeos":"emoções mentalizadas; nutre-se de conversa e leveza; risco de ansiedade quando a mente não para.",
  "Câncer":"emoções profundas e cíclicas; nutre-se de lar e cuidado; risco de hipersensibilidade e humor instável.",
  "Leão":"emoções expressivas e generosas; nutre-se de amor e reconhecimento; risco do drama que cansa.",
  "Virgem":"emoções contidas e analíticas; nutre-se de rotina sã e serviço; risco da autocrítica que rumina.",
  "Libra":"emoções relacionais; nutre-se de parceria e harmonia; risco de codependência e indecisão.",
  "Escorpião":"emoções intensas e transformadoras; nutre-se de verdade e profundidade; risco de obsessão e ciúme.",
  "Sagitário":"emoções expansivas e otimistas; nutre-se de liberdade e fé; risco de negar a dor com otimismo.",
  "Capricórnio":"emoções contidas e responsáveis; nutre-se de estrutura e respeito; risco da frieza que isola.",
  "Aquário":"emoções distanciadas e originais; nutre-se de grupo e causa; risco do desapego que parece indiferença.",
  "Peixes":"emoções dissolventes e compassivas; nutre-se de arte e espírito; risco da fuga e da falta de filtro."
};

const LUA_CASA = {
  1:"o emocional fica exposto — o que sente, os outros veem.",2:"emoção e dinheiro se enlaçam; cuidado com decisões financeiras em tensão.",
  3:"o que se sente precisa ser dito ou escrito; sua palavra cura.",4:"lar e família dominam o campo emocional (o mais intenso).",
  5:"o coração se acende no amor e na criação.",6:"o corpo é o espelho do estado emocional.",
  7:"o outro define como se sente; relações escondidas emergem.",8:"um processo emocional profundo e inevitável; purificação.",
  9:"fé, viagem e estudo como cura emocional.",10:"conquista e reconhecimento nutrem — e expõem ao julgamento.",
  11:"a comunidade define o estado emocional; pertencer importa.",12:"emoções que operam abaixo da superfície; sonhos reveladores."
};

const JUPITER_CASA = {
  1:"expansão da identidade — mais presença, novos começos favorecidos.",2:"expansão financeira — renda, contratos, recursos chegando (um dos melhores trânsitos para dinheiro).",
  3:"expansão da comunicação — publicação, curso, alcance que cresce.",4:"expansão do lar — casa maior, família que cresce, harmonia doméstica.",
  5:"expansão do amor e da criação — romance feliz, obra que floresce.",6:"expansão pelo trabalho e saúde — mais clientes, melhora do corpo.",
  7:"expansão das parcerias — casamento, nova parceria, contratos favoráveis.",8:"expansão pela transformação — herança, investimento, ganho via outros.",
  9:"o maior campo de sorte (domicílio) — viagem transformadora, publicação, estudo que liberta.",10:"expansão profissional — promoção, reconhecimento, cargo novo, empresa fundada.",
  11:"expansão pelas redes — comunidade que decola, amizades que abrem portas.",12:"expansão espiritual — proteção mesmo no difícil, retiro fértil, arte."
};

const SATURNO_CASA = {
  1:"teste de identidade — ano mais sério e contido; amadurecimento acelerado; o corpo pede cuidado.",2:"teste financeiro — disciplina obrigatória, possível período de menor renda.",
  3:"teste da comunicação — o que se diz pesa; estudo longo; contratos com cuidado.",4:"teste do lar — responsabilidades familiares pesadas; o passado retorna para ser resolvido.",
  5:"teste do amor e da criação — relação que se torna séria; criar exige disciplina.",6:"teste da saúde e da rotina — sobrecarga; o corpo cobra; método obrigatório.",
  7:"teste das parcerias — o que não tem fundação termina; o que tem, consolida.",8:"teste da transformação — dívidas, luto, processos lentos; o que não pode durar é encerrado.",
  9:"teste das crenças — o que cresce precisa de fundação real; especialização longa.",10:"teste da carreira (domicílio) — ano duro que constrói reputação duradoura.",
  11:"teste dos grupos — perde-se o que não era real; fortalece-se o genuíno.",12:"teste espiritual — recolhimento, solidão necessária, terapia profunda."
};

const VENUS_CASA = {
  1:"mais magnetismo — ano favorável ao amor e à própria imagem; novo vínculo possível.",2:"amor que vira valor — prosperidade, presente, investimento bem-sucedido.",
  3:"amor pela palavra — sedução pela conversa, afeto próximo (colega, vizinhança).",4:"amor no lar — reconciliação familiar; bom momento para quem mora junto.",
  5:"romance em destaque (um dos melhores) — novo amor ou criação que realiza.",6:"amor no cotidiano — relação que nasce no trabalho; cuidar como amar.",
  7:"parceria em foco — proposta, renovação de votos, nova união significativa.",8:"amor que transforma — intimidade profunda, atração intensa, finanças conjuntas melhoram.",
  9:"amor que expande — alguém de outra cultura/visão; amor que inspira.",10:"amor e carreira se cruzam — reconhecimento pela imagem; relação ligada ao status.",
  11:"amizade que vira amor — círculo social se expande.",12:"amor no silêncio — conexão espiritual, cura afetiva, possível romance discreto."
};

const MARTE_CASA = {
  1:"energia física altíssima — projetos iniciados com força; canalize em exercício; cuidado com conflito por excesso de assertividade.",2:"luta pelos recursos — conquista por ação, mas também gasto impulsivo.",
  3:"comunicação incisiva — debate, escrita urgente; atrito com irmãos/vizinhos.",4:"energia no lar — reforma, mudança ou conflito familiar que pede resolução.",
  5:"paixão e ardor — amor com urgência, criação em alta velocidade.",6:"ação no trabalho — muita dedicação; risco de esgotamento, cuidado com a saúde.",
  7:"o outro traz ação — decisão urgente sobre a parceria, após confronto necessário.",8:"desejo intenso e coragem para crises — ação que transforma; não adie esse movimento.",
  9:"energia para expandir — viagem urgente, projeto que decola, estudo que vira carreira.",10:"ambição em ação — promoção por esforço; possível atrito com autoridade.",
  11:"liderança coletiva — energia para causas; atrito por posições divergentes.",12:"energia nos bastidores — esforço pouco reconhecido; ação espiritual; saúde pede atenção."
};

const MERCURIO_CASA = {
  1:"sua palavra é você — nova forma de se expressar define como é percebida.",2:"comunicação que gera renda — negociação importante, voz monetizada.",
  3:"mente em plenitude — muitos projetos de comunicação; risco de sobrecarga de informação.",4:"conversas e documentos de família/imóvel; diálogos que curam a história.",
  5:"comunicação criativa — romance que começa por uma mensagem, carta, conversa.",6:"comunicação no trabalho — revisão de contratos, diálogos decisivos com colegas.",
  7:"a conversa decisiva sobre o relacionamento; negociações e acordos.",8:"investigação que transforma — uma descoberta muda sua perspectiva.",
  9:"comunicação expandida — ensinar ou publicar para público maior; idiomas, viagem.",10:"comunicação pública — apresentações e entrevistas definem o prestígio do ano.",
  11:"comunicação em grupo — algo que diz em público repercute.",12:"comunicação interna — diário, terapia; o que não é dito pesa, encontre saída segura."
};

const PLUTAO_CASA = {
  1:"você muda de forma irreversível — identidade em morte e renascimento.",2:"recursos se transformam drasticamente — perda que liberta ou ganho que reorganiza tudo.",
  3:"a palavra que transforma realidades — revelação que não pode ser retirada.",4:"transformação familiar profunda; ancestralidade confrontada.",
  5:"amor que transforma — fim de um vínculo ou início de um que muda tudo.",6:"trabalho e rotina reconstruídos da raiz; possível mudança de profissão.",
  7:"a parceria se transforma radicalmente — separação ou metamorfose total da relação.",8:"transformação máxima (domicílio) — morte e renascimento em várias áreas.",
  9:"visão de mundo reconstruída — quebra de paradigma, conversão.",10:"carreira em metamorfose — fim de um caminho, ascensão ou queda de poder.",
  11:"grupos e amizades se transformam — ruptura com o que não serve, entrada no que transforma.",12:"o inconsciente emerge — sombras que pedem integração; terapia profunda necessária."
};

const HORARIO = {
  madrugada:"O ano começa em recolhimento interior — os primeiros meses são de preparação e gestação, não de ação visível. Trabalho interno antes de resultado externo.",
  manha:"O ano começa com clareza e frescor — ação tem resultado rápido; o que se inicia cedo no ciclo ganha impulso natural. Ano de começos.",
  tarde:"O ano começa em plenitude — você já está no meio de algo; continuidade, não ruptura; colheita de ciclos anteriores. Ano de maturação.",
  noite:"O ano começa em encerramento — algo se fecha para que outro ciclo abra; transição e abertura honrosa de nova fase."
};

function L(tabela, chave, rotulo) {
  const v = tabela[chave];
  return v ? `• ${rotulo}: ${v}` : '';
}
function faixaHora(hhmm) {
  if (!hhmm || !hhmm.includes(':')) return null;
  const h = parseInt(hhmm.split(':')[0], 10);
  if (h >= 0 && h < 6) return 'madrugada';
  if (h >= 6 && h < 12) return 'manha';
  if (h >= 12 && h < 18) return 'tarde';
  return 'noite';
}

// ----------------------------------------------------------------------------
// BUILDER
// ----------------------------------------------------------------------------
function buildPromptRevolucaoSolar(d) {
  const c = d.contexto || {};
  const rs = d.rs || {};
  const ciclo = d.ciclo || {};
  const prof = d.profeccao || {};

  const fx = ciclo.faixaHorario || faixaHora(ciclo.horaRetornoSolar);
  const leituraHora = fx && HORARIO[fx]
    ? `Horário do retorno solar: ${ciclo.horaRetornoSolar || '—'}${ciclo.fuso ? ' ('+ciclo.fuso+')' : ''} — ${HORARIO[fx]}`
    : '';

  const chaves = [
    L(ASC_RS, rs.ascSigno, `Tom do ano (ASC da RS em ${rs.ascSigno})`),
    L(SOL_CASA, rs.solCasaNatal, `Foco central (Sol da RS na Casa ${rs.solCasaNatal} natal)`),
    L(LUA_SIGNO, rs.luaSigno, `Tom emocional (Lua em ${rs.luaSigno})`),
    L(LUA_CASA, rs.luaCasaNatal, `Onde a emoção se concentra (Lua na Casa ${rs.luaCasaNatal} natal)`),
    L(JUPITER_CASA, rs.jupiterCasaNatal, `Onde o ano ABRE (Júpiter na Casa ${rs.jupiterCasaNatal} natal)`),
    L(SATURNO_CASA, rs.saturnoCasaNatal, `Onde o ano TESTA (Saturno na Casa ${rs.saturnoCasaNatal} natal)`),
    L(VENUS_CASA, rs.venusCasaNatal, `Amor e prazer (Vênus na Casa ${rs.venusCasaNatal} natal)`),
    L(MARTE_CASA, rs.marteCasaNatal, `Ação e desejo (Marte na Casa ${rs.marteCasaNatal} natal)`),
    L(MERCURIO_CASA, rs.mercurioCasaNatal, `Mente e palavra (Mercúrio na Casa ${rs.mercurioCasaNatal} natal)`),
    L(PLUTAO_CASA, rs.plutaoCasaNatal, `Transformação irreversível (Plutão na Casa ${rs.plutaoCasaNatal} natal)`)
  ].filter(Boolean).join('\n');

  const aspectos = (d.aspectosRSxNatal || [])
    .slice().sort((a,b)=> (a.orbe??99)-(b.orbe??99))
    .map(a => `• ${a.linha} — orbe ${a.orbe}° (${a.ht==='H'?'harmônico':'tenso'})${a.efeito? ' · '+a.efeito:''}`)
    .join('\n') || '(sem aspectos fortes informados)';

  const internos = (d.aspectosInternosRS || [])
    .map(a => `• ${a.linha} — orbe ${a.orbe}° (${a.ht==='H'?'harmônico':'tenso'})`).join('\n') || '(nenhum informado)';

  const gatilhos = (d.gatilhosAtivos || []).map(g => `• ${g}`).join('\n') || '(deduzir dos dados acima)';
  const habitadas = (rs.casasMaisHabitadas || []).map(h => `Casa ${h.casa} (${h.n} planetas)`).join(', ') || '—';

  const ctx = [
    c.desejoDoAno     && `Maior desejo para o ano: ${c.desejoDoAno}`,
    c.maiorPreocupacao&& `Maior preocupação: ${c.maiorPreocupacao}`,
    c.profissional    && `Situação profissional: ${c.profissional}`,
    c.amorosa         && `Situação amorosa: ${c.amorosa}`,
    c.financeira      && `Situação financeira: ${c.financeira}`,
    c.decisaoAdiada   && `Decisão adiada: ${c.decisaoAdiada}`,
    c.mudouUltimos6m  && `Mudou nos últimos 6 meses: ${c.mudouUltimos6m}`,
    c.intuicaoDoAno   && `Intuição sobre o ano: ${c.intuicaoDoAno}`,
    c.medoEspecifico  && `Medo específico: ${c.medoEspecifico}`,
    c.oQueSeriaBomAno && `O que faria deste um bom ano: ${c.oQueSeriaBomAno}`
  ].filter(Boolean).join('\n') || '(contexto não informado — escreva sem inventar fatos da vida da pessoa)';

  const notaLocal = (d.local && d.local.aniversarioIgualNatal === false && d.local.cidadeAniversario)
    ? `A carta foi levantada para ${d.local.cidadeAniversario}, onde ${d.nome} passa o aniversário deste ciclo — o local define o Ascendente e toda a distribuição das casas do ano.`
    : (d.local && d.local.aniversarioIgualNatal ? '' : 'Observação: o local do aniversário não foi confirmado; a carta usa o local natal — registre essa ressalva uma única vez, com leveza.');

  // ---------------------------------------------------------------------------
  return `Você é a astróloga da Astralia escrevendo a Revolução Solar de ${d.nome} para o ciclo de ${ciclo.aniversario} a ${ciclo.proximo}. Você tem trinta anos de prática em Revolução Solar e a sua leitura é reconhecida pela precisão.

═══════════════ QUEM ESCREVE — A VOZ ═══════════════
Você escreve na voz da Astralia: a mesma da Lilith. Íntima, reveladora, corajosa. Fala com ${d.nome} em segunda pessoa, como quem senta ao lado e diz a verdade com ternura — nunca de cima, nunca de longe. Nomeia o que a pessoa já sente antes de explicá-lo, para que ela reconheça o ano no próprio corpo. Poética quando o céu pede poesia, seca quando pede um aviso. Não enfeita o que dói nem encolhe o que brilha.

A Revolução Solar pede de você duas camadas além de revelar. Você ORIENTA — é um guia de ações: a cada energia, mostra o que fazer com ela. E você ALERTA — é um manual de janelas: aponta a curva antes dela, sem assustar, como quem conhece a estrada.

REGRA DE OURO: nada de horóscopo genérico. Cada frase nasce DOS DADOS deste mapa e DO QUE ${d.nome} contou. Se a frase serviria para qualquer pessoa, está errada — reescreva até só servir para esta.

═══════════════ O TOM PREMONITÓRIO ═══════════════
Você É reveladora e premonitória. Indique ACONTECIMENTOS — nomeie o que tende a se manifestar (uma virada, um encontro, um encerramento, uma mudança, uma conquista). Você PODE determinar de leve: "há forte probabilidade de que…", "este ciclo provavelmente traz…", "o mapa revela que… tende a acontecer". Não se esconda atrás de vagueza — a pessoa pagou para saber o que vem.
MAS os limites são firmes:
• Nunca crave data fechada nem fatalidade ("vai acontecer com certeza no dia tal", "você vai sofrer").
• Nunca seja catastrófica — todo alerta vem com uma saída e uma ação.
• Para os meses JÁ VIVIDOS do ciclo: tom determinista ("este período provavelmente trouxe…", "o mapa indicou que…").
• Para os meses POR VIR: premonitório-revelador ("existe forte tendência a…", "o campo se abre para…").
• Saúde, mente e tragédia: SEMPRE linguagem de tendência e cuidado, jamais sentença ou diagnóstico. Não anuncie doença nem morte; fale de padrões, vulnerabilidades e prevenção.
Revelar com firmeza afetuosa: o leve determinismo serve à clareza, nunca ao susto.

═══════════════ O QUE É ESTA LEITURA ═══════════════
A Revolução Solar é a carta do instante exato em que o Sol voltou ao grau do nascimento de ${d.nome}. Não decreta o futuro — revela o CAMPO DE ENERGIA do ciclo: o tom, o foco, onde a vida abre, onde cobra, o que pede coragem, o que pede cuidado.
Esta leitura tem a PROFUNDIDADE DE UM MAPA ASTRAL PREMIUM, apontada para o ano que ${d.nome} escolheu. O ciclo central vai de um aniversário ao outro (doze meses), mas os temas mais fortes costumam se anunciar antes do aniversário e seguir reverberando depois do próximo: trate o arco de manifestação como algo que pode se estender por até cerca de UM ANO E MEIO.
${notaLocal}
${leituraHora ? '\n'+leituraHora : ''}

⏳ TEMPO DO CICLO: aniversário ${ciclo.aniversario} · ${ciclo.mesesVividos} meses já vividos · ${ciclo.mesesRestantes} pela frente · ponto: ${ciclo.ponto}.

═══════════════ TRAVAS (inegociáveis) ═══════════════
1. SEM TETO DE PALAVRAS. Os pisos abaixo são mínimos a superar com folga, nunca limites. Vá até onde o mapa pedir. Relatório curto é relatório errado; jamais resuma, sintetize ou abrevie.
2. Tom premonitório-revelador (acima): indica acontecimentos, determina de leve, nunca crava nem aterroriza.
3. NÃO diagnosticar. Saúde/emoção/mente: tendência e cuidado, com lembrete de que não substitui acompanhamento profissional.
4. Guia de ações: cada seção fecha com algo prático — o que fazer, o que evitar, em que janela.
5. Cross-sell só quando o mapa pedir (instruções na seção final). Nunca force.

═══════════════ O MAPA DESTE CICLO (dados reais — base de tudo) ═══════════════
Natal (contexto leve): ASC ${d.natal?.ascSigno||'—'} · Sol ${d.natal?.solSigno||'—'} · Lua ${d.natal?.luaSigno||'—'}.
RS: ASC ${rs.ascSigno||'—'} · MC ${rs.mcSigno||'—'} · Sol na Casa ${rs.solCasaNatal||'—'} natal · Lua em ${rs.luaSigno||'—'} (Casa ${rs.luaCasaNatal||'—'} natal).
Planeta mais forte da RS: ${rs.planetaMaisForte||'(definir pelo mapa)'} · Tema central sugerido: ${rs.temaCentral||'(extrair do conjunto)'}.
Casas mais habitadas: ${habitadas}.

CHAVES INTERPRETATIVAS (filtradas para este mapa — espinha, não texto a copiar):
${chaves}

PROFECÇÃO ANUAL: aos ${ciclo.idadeNoAniversario} anos, ativa-se a Casa ${prof.casa||'—'} (cúspide em ${prof.signoCuspide||'—'}). Senhor do Ano: ${prof.senhorDoAno||'—'} — natal em ${prof.senhorNatal||'—'}, na RS em ${prof.senhorRS||'—'}.
Convergências: Júpiter na casa da profecção? ${rs.jupiterNaProfeccao? 'SIM — expansão máxima nessa área, enfatize':'não'}. Saturno na casa da profecção? ${rs.saturnoNaProfeccao? 'SIM — teste máximo nessa área, enfatize':'não'}.

ATIVAÇÕES DO ANO (aspectos RS × natal, do mais forte ao mais fraco — o de menor orbe é o tema mais nítido):
${aspectos}

DINÂMICA INTERNA DO ANO (aspectos dentro da RS):
${internos}

GATILHOS CONFIRMADOS (alertas e dons específicos — desenvolva cada um com narrativa):
${gatilhos}

O QUE ${d.nome} CONTOU (conecte o mapa a isto o tempo todo):
${ctx}

═══════════════ AS SEÇÕES (ordem fixa) ═══════════════
Pisos mínimos a superar (sem teto): N1 ≈ 450+ palavras · N2 ≈ 900+ · N3 ≈ 1600+ · N4 ≈ 2800+. Somadas, têm o porte de um mapa astral premium completo.

0 · BLOCO DE DADOS DA RS — abra com um quadro técnico (data, horário exato e sua leitura, local, ASC e MC da RS, planeta mais forte, tema central, duração com o arco estendido de até ~1,5 ano). Confere credibilidade e personalização imediata.

1 · A CHEGADA DO CICLO [N1]. Existencial, não técnica. A primeira frase faz ${d.nome} reconhecer o ano no próprio corpo. "Este é o ano em que…" (a partir do ASC da RS). Conecte o que ela deseja ao que o mapa mostra.

2 · O TOM DO ANO — ASC da RS [N3]. Desdobre o ASC ${rs.ascSigno} em tom, corpo, oportunidade, desafio e os ACONTECIMENTOS que ele tende a trazer. Some a leitura do horário (como o ciclo começa). Compare com o ASC natal (${d.natal?.ascSigno}). Feche com 3–5 palavras-chave e "você já sente isso no ar?".

3 · O CENTRO — Sol da RS por casa [N3]. Casa ${rs.solCasaNatal} natal: o palco central. Como se manifesta concretamente, com os eventos prováveis dessa casa. Se a profecção ativa a mesma casa, é o sublinhado do destino — enfatize.

4 · O TOM EMOCIONAL — Lua da RS [N3]. Lua em ${rs.luaSigno}, Casa ${rs.luaCasaNatal}: o que nutre e o que drena; como cuidar do coração neste ano.

5 · ONDE O ANO ABRE — Júpiter [N2]. Casa ${rs.jupiterCasaNatal}: o campo de sorte; o que tocar e COMO usar a abertura. Guia de ações puro.

6 · ONDE O ANO COBRA — Saturno [N2]. Casa ${rs.saturnoCasaNatal}: o teste como escola, nunca castigo; o que constrói e o que pede de maturidade. Honesto, com a saída à vista.

7 · AMOR, DESEJO E RELAÇÕES — a seção mais densa [N4]. Vênus (Casa ${rs.venusCasaNatal}) e Marte (Casa ${rs.marteCasaNatal}); aspecto Vênus×Marte; gatilhos de amor e de sexualidade. O que o ciclo favorece e o que testa, com janelas e acontecimentos prováveis. Adulto, caloroso, sem vulgaridade. Para solteira e para quem está em relação, descreva os dois cenários quando fizer sentido.

8 · CARREIRA E REALIZAÇÃO [N3]. Gatilhos de carreira, MC da RS (${rs.mcSigno}), Sol/Júpiter/Saturno em casas profissionais. Acontecimentos prováveis e janelas. Se a profecção converge com carreira, enfatize.

9 · DINHEIRO E RECURSOS [N3]. Gatilhos financeiros + Júpiter/Saturno/Vênus/Marte nas casas 2 e 8. O que proteger e o que construir; honesto, nunca catastrófico.

10 · SAÚDE E CORPO [N2]. Como o corpo responde ao ASC ${rs.ascSigno} + gatilhos de saúde. Cuidado prático e específico. TRAVA: tendência e cuidado, jamais diagnóstico; não substitui profissional.

11 · A TRAVESSIA PLANETÁRIA [N3]. Os demais planetas que tiverem dado — Mercúrio (Casa ${rs.mercurioCasaNatal||'—'}), Plutão (Casa ${rs.plutaoCasaNatal||'—'}), Urano (Casa ${rs.uranoCasaNatal||'—'}), Netuno (Casa ${rs.netunoCasaNatal||'—'}), Nodo Norte (Casa ${rs.nodoCasaNatal||'—'}), Lilith (Casa ${rs.lilithCasaNatal||'—'}). Cada um: o que ativa, o acontecimento que tende a trazer, como agir. Plutão = o que se transforma sem volta.

12 · O PALCO DA PROFECÇÃO [N2]. A Casa ${prof.casa} ativada e o Senhor do Ano (${prof.senhorDoAno}): onde e como o palco principal opera; o que a profecção acrescenta.

13 · AS ATIVAÇÕES — RS × natal [N3]. Os aspectos de menor orbe, um a um. O de menor orbe é o tema mais nítido. Aspectos sobre ASC, MC, Casa 4 e Casa 7 são os mais importantes.

14 · O ANO EM QUATRO ESTAÇÕES [N3]. Divida o ciclo em quatro trimestres a partir do aniversário (o que começa / o que se constrói / o que se transforma / o que se conclui). Para os já vividos, tom determinista; para os que vêm, premonitório. Em cada estação: tema, área em destaque, oportunidade, cuidado e uma frase-guia.

15 · AS JANELAS [N2]. Manual de alertas e aberturas. Janelas favoráveis (Júpiter/Vênus) e de cuidado (Saturno/Marte). Lembre o arco estendido de até ~1,5 ano — temas que se anunciam antes e reverberam depois. Orientadora, não prescritiva.

16 · MENSAGEM FINAL + PRÓXIMOS PASSOS + AVISO LEGAL [N2]. Carta pessoal com 2 dados concretos DESTA RS. A pergunta mais poderosa que o ano faz a ${d.nome}. Uma lista de 5–7 ações concretas para começar agora. O mapa aponta; a ação é sempre dela. Aviso legal padrão Astralia. Cross-sell só se o mapa pedir — carreira em foco → Mapa Profissional · amor/parceria intensos → Sinastria · padrões que se repetem → Mapa Kármico · finanças no centro → Mapa da Sorte · Lilith forte → Mapa da Lilith · necessidade de detalhe mês a mês → Previsão de 18 Meses.

═══════════════ COMECE ═══════════════
Escreva a Revolução Solar completa de ${d.nome}, na voz acima, seção por seção, em português impecável, sem teto de extensão. Que ela termine a leitura sabendo o que o ano traz — e o que fazer com ele.`;
}

module.exports = { buildPromptRevolucaoSolar };
