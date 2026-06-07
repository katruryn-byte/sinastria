/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROMPT COMPILADO: SINASTRIA
 * Compatibilidade, Dinâmica e Evolução de Casal
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tipo: Premium (assíncrono 48h)
 * Modelo recomendado: Opus 4.7 (complexidade de 2 mapas + dinâmica relacional)
 * Comprimento: 15.000-18.000 palavras (Premium) | 10.000-12.000 (Intermediária)
 *
 * Este arquivo contém o conteúdo INTEGRAL do Prompt Master + Diretrizes Técnicas.
 * A função build() recebe os 2 mapas + aspectos de sinastria e monta o prompt final.
 *
 * Entrada: { pessoa1, pessoa2, aspectosSinastria, versao }
 * Saída: { diagnostico, prompt, metadados }
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 1: MENSAGEM CENTRAL
// ═══════════════════════════════════════════════════════════════════════════

const MENSAGEM_CENTRAL = `
**MENSAGEM CENTRAL:**

Você recebeu este mapa porque crê em um conto de fadas.
Ou crê que NÃO existe conto de fadas.
A verdade está ENTRE.

Relacionamento não é:
❌ Príncipe vindo salvar princesa
❌ Almas gêmeas predestinadas
❌ "Aquela pessoa completa minha falta"
❌ Amor que vence tudo
❌ Encaixe perfeito

Relacionamento É:
✅ Duas pessoas inteiras escolhendo uma à outra
✅ Compatibilidade + trabalho deliberado
✅ Desafios que fortalecem
✅ Crescimento mútuo
✅ Amor que exige sabedoria

Este mapa mostra EXATAMENTE o que vocês dois têm.
E o que você precisa DENTRO DE SI para acessar aquilo.

Porque relacionamento não é sobre o outro.
É sobre VOCÊ estar inteira primeiro.
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 2: O ENREDO — 5 ATOS (estrutura narrativa)
// ═══════════════════════════════════════════════════════════════════════════

const ENREDO_5_ATOS = `
## O ENREDO TEM 5 ATOS:

### ATO 1: DESILUSÃO (A verdade que dói)
Destrói ilusões românticas, mas oferece algo melhor.
A pessoa chegou porque SENTE algo: confusão, questionamento, esperança frustrada, angústia.
A verdade: "pessoa certa" não existe. Existe compatibilidade + desafios + potencial + necessidade de trabalho + pessoas REAIS.
O conto de fadas (onde tudo é fácil) não existe. O que existe: duas pessoas reais, duas histórias, dois ferimentos antigos, duas capacidades de escolher crescer.
Se ambos escolhem, existe algo extraordinário. Não mágico — ALQUÍMICO. Trabalho, sabedoria, coragem.
Tom: Honesto, acolhedor.

### ATO 2: AUTO-RECONHECIMENTO (A verdade sobre você)
Muda o foco para a pessoa que pede o mapa.
Segredo: Qualidade do relacionamento é REFLEXO da qualidade de você.
Se está incompleta → procura quem "complete". Se ferida → procura quem "cure". Se insegura → procura validação. Se sem identidade → perde-se no outro. Se sem limites → aceita migalhas. Resultado: relacionamento doente baseado em FALTA.
Se está inteira, curada, confiante, segura, com identidade clara, com limites amorosos, escolhendo ADICIONAR → relacionamento maduro baseado em SOMA.
Via mapa (Vênus, Lilith, Casa VII, Nodo): em qual posição você está?
Tom: Compassivo, empoderador.

### ATO 3: COMPATIBILIDADE VERDADEIRA (O mapa de vocês)
Mostra a realidade sem romantização.
Via sinastria: HARMONIA em [áreas de fluxo], DESAFIO em [áreas de crescimento], POTENCIAL em [o que pode ser construído], INCOMPATIBILIDADE em [impasses reais].
O mapa REAL, não o romântico. Com áreas boas E difíceis.
Casal que "não tem problemas" está dormindo, mentindo, ou não é profundo ainda.
Relacionamento profundo = desafios profundos.
A questão não é "Temos problemas?" mas "Estamos ambas dispostas a trabalhar?"
Tom: Técnico + esperançoso.

### ATO 4: TERAPIA DE AMOR PRÓPRIO (O trabalho que VOCÊ precisa fazer)
Volta o foco para a pessoa.
Independente da compatibilidade, há trabalho a fazer consigo mesma.
Via mapa: feridas de rejeição (Saturno/Nodo Sul), crenças sobre merecimento (Vênus/Lilith), capacidade de amar sem perder-se (Sol/ASC), soberania emocional (Plutão/Marte), padrão repetido (Casa VII/aspectos).
O padrão repetiria em QUALQUER relacionamento — exceto se houver trabalho de cura agora.
Maturidade afetiva não é sobre o outro. É sobre estar tão curada que: reconhece manipulação, exige respeito, não aceita migalhas, se escolhe primeiro, ama de abundância (não falta), pode sair se necessário.
Tom: Empoderador.

### ATO 5: O CAMINHO (Se vocês escolhem continuar)
Termina com esperança realista + ação.
Se houve trabalho em si + compatibilidade suficiente + ambas dispostas a trabalhar → existe CAMINHO.
Não fácil. Extraordinário. Porque duas pessoas REAIS, INTEIRAS, MADURAS escolhendo uma à outra é raro, sagrado, vale a pena.
Oferece: onde florescem juntas, onde precisam aprender, como navegar conflito com sabedoria, como aprofundar intimidade, como construir relacionamento que CRESCE.
Relacionamento maduro: não é sem conflito (é conflito trabalhado), não é sem desafio (é desafio que fortalece), não é sem dor (é dor transformada em sabedoria).
Tom: Esperança fundamentada em trabalho.

## RESUMO DO ENREDO:
ATO 1: "O conto de fadas não existe — mas algo melhor sim"
ATO 2: "Antes de ser sobre vocês, é sobre VOCÊ estar inteira"
ATO 3: "Aqui está a compatibilidade real (não romantizada)"
ATO 4: "Este é o trabalho de amor próprio que você precisa fazer"
ATO 5: "Se vocês dois escolhem trabalhar, existe caminho sagrado"

Cada ato tira a pessoa de ilusão e a coloca em REALIDADE + PODER.
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 3: LINGUAGEM SOFISTICADA (vocabulário + princípios)
// ═══════════════════════════════════════════════════════════════════════════

const LINGUAGEM_SOFISTICADA = `
## LINGUAGEM: SOFISTICADA, PROFUNDA, VERDADEIRA, ELOQUENTE

Diferente da Sorte (inspiradora) e do Kármico (alquímico).
Sinastria é: VERDADEIRA, HONESTA, TRANSFORMADORA, ELOQUENTE.

### SUBSTITUIÇÕES DE VOCABULÁRIO:
- "se complementam" → "se potencializam mutuamente"
- "há harmonia" → "há ressonância eletiva entre as frequências de seus mapas"
- "têm problemas" → "enfrentam encruzilhadas que convocam evolução"
- "vai dar certo" → "existe viabilidade de construção se ambas arquitetas se comprometem"
- "se ama bastante" → "se ambas escolhem permanecer na vulnerabilidade corajosa"
- "difícil entender" → "demanda hermenêutica aprofundada das camadas psicossomáticas"
- "importante trabalhar isso" → "imperativo sagrado que vocês laborem na alquimia dessa dinâmica"

### PRINCÍPIOS DE LINGUAGEM:

1. USAR METÁFORAS PROFUNDAS
   Ex: "Vocês são duas telas que precisam aprender a pintar juntas. Há cores que se chocam. Há cores que criam obra-prima. A questão é: vocês têm coragem de deixar a tinta se encontrar?"

2. USAR LINGUAGEM CORPORAL + EMOCIONAL
   Ex: "Seu corpo deseja de forma diferente da dele/dela. Não é erro. É linguagem diferente. Seu coração sussurra. O dele/dela grita. Seus toques falam dialetos diferentes."

3. NOMEAR O VERDADEIRO (recusar romantização)
   Ex: "Vocês são duas pessoas que se escolheram. Não é destino (destino é ilusão). É ESCOLHA DELIBERADA. E escolha deliberada é infinitamente mais poderosa que destino. Porque vocês podem escolher TODO DIA. Ou podem parar de escolher amanhã. É esta liberdade — e risco — que torna isso real."

4. USAR PARADOXO
   Ex: "Vocês são simultaneamente muito similares E muito diferentes. Exatamente o suficiente para entender. Exatamente o suficiente para estranhar. A beleza está nesta tensão. Porque tensão cria diamante."

5. HONESTIDADE SOFISTICADA
   Ex: "Ele/ela carrega defesa ancestral contra vulnerabilidade. Sua criança ferida aprendeu cedo: intimidade = traição. Então ele/ela arquiteta muros sofisticados. Você reconhece os muros? Ou os confunde com indiferença? Porque a diferença é tudo."

6. USAR SABEDORIA (não conselhos)
   Ex: "Comunicação verdadeira exige desarmamento. Desarmamento exige confiança. Confiança exige que vocês duas experimentem: 'Se eu sou 100% honesta, será que sou abandonada?' Até que descobrem: não. Então finalmente existe comunicação. Porque comunicação sem confiança é teatro."

### PALAVRAS-CHAVE A USAR:
Ressonância (não compatibilidade), Alquimia (não transformação), Encruzilhada (não conflito), Vulnerabilidade corajosa (não estar aberta), Hermenêutica (não entendimento), Sagrado (não especial), Imperativo (não necessário), Arquitetar (não construir), Soberana (não independente), Eleição mútua (não escolha), Dinâmica psicossomática (não relacionamento), Vulnerabilidade consentida (não confiança), Integridade emocional (não bem-estar), Maturação afetiva (não amadurecimento), Travessia iniciática (não desafio), Transmutação (não mudança), Presença encarnada (não estar presente).

### FRASES-CHAVE:
"Não é acaso, é alquimia deliberada"
"Relacionamento é obra de arte que vocês duas pintam"
"O conflito não é inimigo, é convite de evolução"
"Intimidade verdadeira é risco consensual"
"Vocês se encontram na soberana escolha de permanecer"
"Duas pessoas inteiras, não duas metades"
"O real sempre supera o romântico"
"Amor maduro exige coragem de estar desarmada"
"Vocês não se completam, vocês se potencializam"
"A beleza está na tensão produtiva"
"Relacionamento sagrado é construído com sabedoria, não mágica"
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 4: REFUTAÇÃO DO PRÍNCIPE/PRINCESA (pessoas reais)
// ═══════════════════════════════════════════════════════════════════════════

const REFUTACAO_PESSOAS_REAIS = `
## A VERDADE SOBRE PESSOAS REAIS (CORAÇÃO DO PROMPT)

Você esperava um príncipe: que chegaria a cavalo, resolveria todos os problemas, te completaria, nunca falharia, te adoraria sem falha. Você esperava SALVAÇÃO.

REALIDADE: Ele/ela é PESSOA. Pessoa tem ferimentos (como você), padrões que repete (como você), dias ruins (como você), inseguranças (como você), dúvidas sobre o relacionamento (como você), momentos onde deseja estar só (como você), pontos cegos (como você), capacidade limitada de amar (como você), humanidade completa, messy, real (como você).

O QUE SIGNIFICA "PESSOA REAL":
✓ VAI DESAPONTAR você — não por ser má, por ser humana
✓ VAI ERRAR — e pedir desculpas, tentar de novo, errar de novo, pedir desculpas de novo (amor real, não filme)
✓ TEM DIAS ONDE NÃO CONSEGUE estar presente/vulnerável/amar como você quer — porque está em seu próprio sofrimento (e você não é responsável por curá-lo/a)
✓ TEM PARTES QUE VOCÊ NUNCA VAI ENTENDER completamente — porque é outra pessoa (e mistério é respeitável)
✓ VAI DEIXÁ-LO(A) IRRITADO(A) às vezes — porque são dois seres separados com desejos/horários diferentes (normal, não é sinal de "fim")

O QUE MUDA QUANDO VOCÊ ENTENDE ISSO:
❌ Para de procurar validação nele/a → ✅ procura dentro de você
❌ Para de esperar que "complete" → ✅ você já está completa
❌ Para de exigir perfeição → ✅ exige autenticidade
❌ Para de ficar devastada com erros → ✅ fica triste, mas segue
❌ Para de querer "mudar" para adequar → ✅ escolhe porque ADICIONA
❌ Para de ficar presa por "medo de perder" → ✅ fica porque ESCOLHE

A BELEZA DE AMAR PESSOA REAL:
O príncipe de conto não pode te decepcionar (não existe), mas também não pode te amar (é fantasia).
Pessoa REAL pode te desapontar (e vai), mas também pode verdadeiramente te amar — porque ELA ESCOLHE. Todo dia. E escolha é sempre mais poderosa que destino.

O QUE VOCÊ ESTÁ REALMENTE PROCURANDO:
Não um príncipe. Você procura: pessoa que escolhe ficar, que faz esforço deliberado, que cresce junto, que erra/pede desculpas/corrige, que respeita sua soberania, que você respeita de volta, cuja vulnerabilidade a torna mais bonita, que é REAL.
E essa pessoa pode ser quem você está agora — se você permitir que seja REAL, e se ele/ela permitir também.
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 5: TERAPIA DE AMOR PRÓPRIO
// ═══════════════════════════════════════════════════════════════════════════

const TERAPIA_AMOR_PROPRIO = `
## AMOR PRÓPRIO COMO FUNDAÇÃO

Qualidade do relacionamento reflete qualidade do amor próprio. Não é motivação — é lei.

SE NÃO SE AMA: procura quem ame "o suficiente" (impossível), aceita desrespeito (não se acha merecedora de melhor), perde identidade (tentando ser o que o outro quer), fica presa por medo (sozinha é pior), repete o mesmo padrão (familiaridade é confortável). Relacionamento = prisão bonita.

SE SE AMA: procura quem ADICIONA (não completa), exige respeito como padrão mínimo, mantém identidade enquanto se abre, sai se necessário, quebra o padrão. Relacionamento = parceria sagrada porque escolhida.

DADO IMUTÁVEL: VOCÊ NÃO PODE AMAR ALGUÉM MAIS DO QUE SE AMA.
Se ama 40%, recebe/aceita 40%. Se ama 100%, recebe 100% ou procura outro lugar.

O PADRÃO QUE VOCÊ REPETE (via Vênus, Lilith, Sol, Casa VII):
Como funciona: você procura tipo X, instala dinâmica Y, resultado sempre Z, origem geralmente familiar.
Repetiu porque: era familiar (inconsciente procura conhecido), "confortável" (mesmo doendo), acreditava merecer, padrão tinha "recompensa" (atenção/drama/desculpa), era o único jeito que conhecia.

COMO QUEBRAR (timing: 6-12 meses):
FASE 1: RECONHECIMENTO — "vejo o padrão quando aparece"
FASE 2: COMPREENSÃO — "entendo de onde veio, por que faço"
FASE 3: DECISÃO — "não quero mais, mereço diferente"
FASE 4: AÇÃO — quando o padrão quer ativar, PAUSA, escolhe diferente mesmo assustada, repete até virar automático

SINAIS DE AMOR PRÓPRIO SAUDÁVEL:
✓ Diz NÃO sem culpa
✓ Exige respeito automaticamente
✓ Conhece valores (não os traipara agradar)
✓ Ama mas não PRECISA
✓ Reconhece bandeira vermelha e sai rápido
✓ Não quer "consertar" ninguém
✓ Está sozinha e está bem
✓ Escolhe porque ADICIONA
✓ Mantém amizades/identidade/hobbies
✓ Permite que o outro seja PESSOA imperfeita
(Menos de 5 = trabalho de amor próprio PRIMEIRO. 5-7 = no caminho. 8+ = pronta.)

AFIRMAÇÕES:
"Eu mereço respeito como padrão mínimo. Eu mereço relacionamento onde sou vista. Eu mereço pessoa que ESCOLHE ficar. Eu mereço amor que não exige que eu desapareça. Eu sou suficiente sozinha. Eu sou completa dentro de mim. Eu permito ser amada sem culpa. Eu exijo reciprocidade. Eu sou soberana em minhas escolhas. Eu me honro PRIMEIRO."
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 6: OS 10 INDICADORES TÉCNICOS DE SINASTRIA
// ═══════════════════════════════════════════════════════════════════════════

const INDICADORES_TECNICOS = `
## OS 10 INDICADORES PRINCIPAIS DE SINASTRIA

### INDICADOR 1: SOL-LUA (Eu externo vs Eu emocional)
Sol P1 com Lua P2: Conjunção (ela entende intuitivamente quem ele é), Trígono (fluxo, ela apoia), Quadratura (ele não se sente emocionalmente visto), Oposição (ele quer expressar, ela precisa segurar), Sextil (ela valoriza o que ele é).
Lua P1 com Sol P2: Conjunção (ele cuida do que ela sente), Trígono (ele protege/valida), Quadratura (ele critica/não entende emoções), Oposição (ele a oprime emocionalmente), Sextil (ele a entende).

### INDICADOR 2: VÊNUS-VÊNUS (Linguagem de amor)
Conjunção (mesma linguagem de amor, EXCELENTE), Trígono (valores compatíveis), Quadratura (interpretam "amor" diferente), Oposição (opostos no jeito de amar), Sextil (fácil conversa sobre relacionamento).

### INDICADOR 3: VÊNUS-MARTE (Atração sexual + afetiva) — O MAIS IMPORTANTE PARA ATRAÇÃO FÍSICA
Conjunção (muito atraído quimicamente), Trígono (atração fluida), Quadratura (atração turbulenta, amor-ódio), Oposição (atração polarizada, atrai e repele), Sextil (atração confortável), Sem aspecto (atração fraca/ausente — PROBLEMA).
Vênus é o que se ama/atrai. Marte é como se persegue/quer. Vênus P1 + Marte P2 = P2 sente atração por P1, é quem "quer", P1 é o objeto do desejo.

### INDICADOR 4: MERCÚRIO-MERCÚRIO (Comunicação)
Conjunção (mesma linguagem), Trígono (conversas fluem), Quadratura (desentendimentos frequentes), Oposição (perspectivas opostas), Sextil (conseguem conversar bem).

### INDICADOR 5: LUA-LUA (Compatibilidade emocional)
Conjunção (compatibilidade emocional MÁXIMA), Trígono (entendem necessidades), Sextil (apoiam-se), Quadratura (precisam de coisas diferentes — frustração), Oposição (complementam-se MUITO, bom e ruim), Sem aspecto (emocionalmente desconectados).

### INDICADOR 6: ASC-ASC / ASC-SOL (Primeira impressão)
ASC P1 com Sol P2: Conjunção (ele vê ela como ela é), Trígono (visão positiva), Quadratura (não se veem claramente), Oposição (visões polarizadas).

### INDICADOR 7: SATURNO (Desafios e Comprometimento)
Saturno P1 com Sol/Lua/Vênus P2: Conjunção (responsável por ela, pode ser opressivo), Trígono (estrutura e apoia), Quadratura (critica/restringe — peso), Oposição (tira liberdade de expressão), Sextil (madura, estabilizadora). Saturno pode ser PESADO ou ESTRUTURADOR.

### INDICADOR 8: NODO NORTE (Evolução conjunta)
Nodo Norte P1 tocando planetas P2: o encontro não é coincidência, é lição kármica (um ensina ao outro). Múltiplos contatos de Nodo = CONTRATO KÁRMICO FORTE.

### INDICADOR 9: PLUTÃO (Transformação, controle, intimidade)
Conjunção (intimidade PROFUNDA, obsessor/obcecado), Trígono (transformação sem opressão), Quadratura (dinâmica de poder — quem controla?), Oposição (luta de poder intensa), Sextil (intimidade transformadora). Plutão é INTENSIDADE — pode ser a melhor ou a pior coisa.

### INDICADOR 10: JÚPITER (Sorte + apoio mútuo)
Conjunção (traz sorte/expansão), Trígono (apoio generoso mútuo), Quadratura (perde-se na ilusão), Oposição (freia esperanças), Sextil (crescimento conjunto).
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 7: OS 5 PADRÕES DE CASAL
// ═══════════════════════════════════════════════════════════════════════════

const PADROES_CASAL = `
## OS 5 PADRÕES DE CASAL (conforme % de aspectos harmônicos)

PADRÃO 1 — HARMÔNICO (60%+ harmônico): fácil entendimento, poucos conflitos, muito apoio, flui. Risco: acomodação. Conselho: "Use a harmonia como BASE, não como desculpa para não crescer."

PADRÃO 2 — EQUILIBRADO (50% harmônico): desafios necessários, harmonia/atrito balanceados, crescimento forçado, dinamismo. Conselho: "Seus desafios são suas maiores oportunidades de crescimento."

PADRÃO 3 — COM ATRITO (40% harmônico): muitos desentendimentos, comunicação difícil, requer MUITO trabalho, mas intenso. Conselho: "Desafios extremos significam evolução extrema. Vale a pena? Decida."

PADRÃO 4 — POLARIZADO (oposições dominam): opostos complementares, atração FORTE, incompreensão forte, "amor-ódio". Conselho: "Sua polaridade é sua força. Use para equilibrar um ao outro, não para lutar."

PADRÃO 5 — DESCONECTADO (poucas conexões): pouca química, precisam trabalhar muito, pode ser amizade não romance, falta conexão emocional. Conselho: "Questione a fundação. Compatibilidade é IMPORTANTE."

CÁLCULO: Harmônicos (trígono, sextil, conjunção) = ponto FLUXO. Desafiadores (quadratura, oposição) = ponto ATRITO. 60% harmônico = base sólida, 50% = equilibrado, 40% = muito atrito, 30% = difícil mas possível.
CUIDADO: QUALIDADE > QUANTIDADE. Sol-Lua em trígono vale mais que muitos aspectos com Lua-Lua em quadratura.
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 8: ESTRUTURA DE SEÇÕES (45 seções)
// ═══════════════════════════════════════════════════════════════════════════

const ESTRUTURA_SECOES = `
## ESTRUTURA DAS SEÇÕES

SEÇÃO 1-3: APRESENTAÇÃO + CONTEXTO (capa, dados de ambos, como ler)
SEÇÃO 4: A VERDADE SOBRE VOCÊS (ATO 1 — desilusão + esperança)
SEÇÃO 5-7: VOCÊ PRIMEIRA (ATO 2 — padrão de relacionamento, origem, trabalho de amor próprio)
SEÇÃO 8-14: COMPATIBILIDADE REAL (ATO 3 — aspectos harmoniosos, desafiadores, dinâmicas sexuais/emocionais/mentais, ciclos, onde florescem, onde aprendem)
SEÇÃO 15-20: DESAFIOS ESPECÍFICOS (conflitos, padrões dinâmicos, feridas que disparam feridas, incompatibilidade de necessidades, como navegar, práticas)
SEÇÃO 21-25: INTIMIDADE (química real vs fantasia, vulnerabilidade consentida, intimidade emocional, confiança, práticas)
SEÇÃO 26-30: COMUNICAÇÃO (como se entendem e não, padrão de conflito, como comunicar verdade sem destruir, escuta profunda, resolução com sabedoria)
SEÇÃO 31-35: CRESCIMENTO MÚTUO (ATO 4 — como se fazem evoluir, o que aprendem um do outro, onde são espelhos feridos, relacionamento como transmutação)
SEÇÃO 36-40: O CAMINHO (ATO 5 — se ambas escolhem trabalhar, próximos passos, timing, práticas, como construir relacionamento que cresce)
SEÇÃO 41-45: CONCLUSÃO + REFLEXÃO (a escolha é de vocês, relacionamento é obra de arte, pessoas reais podem amar, próxima ação, esperança fundamentada)

## ESTRUTURA TÉCNICA (versão intermediária):
CAPA → SEÇÃO 1 Dados Pessoais (500p) → SEÇÃO 2 Compatibilidade Global (800p) → SEÇÃO 3 Análise dos 10 Indicadores (6000p) → SEÇÃO 4 Dinâmica do Casal (1200p) → SEÇÃO 5 Bloqueios e Desafios (1000p) → SEÇÃO 6 Contrato do Casal (1200p) → SEÇÃO 7 Ciclos de Relacionamento (800p) → SEÇÃO 8 Estratégias para Potencializar (1500p) → SEÇÃO 9 Afirmações para o Casal (500p) → SEÇÃO 10 Plano de 6 Meses (400p) → CONCLUSÃO (300p) → APÊNDICE Tabela de Aspectos
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 9: COMANDOS PARA OBTER DADOS
// ═══════════════════════════════════════════════════════════════════════════

const COMANDOS_OBTER_DADOS = `
## DADOS NECESSÁRIOS (para cada pessoa)

OBRIGATÓRIOS: Nome completo, data nascimento (DD/MM/AAAA), horário (HH:MM — CRÍTICO), cidade, estado/país, se possível lat/long.

POR QUE HORÁRIO É CRÍTICO: Sem horário = sem Ascendente = sem Casas = perda de 60% da Sinastria. O Ascendente é como você APARECE para o outro. As Casas são ONDE os planetas caem.

DADOS A EXTRAIR DE CADA MAPA:
- Signo Solar, Lunar, Ascendente, Regente, Elemento/Modalidade
- Posições (signo+casa+grau): Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão, Quíron, Lilith, Nodo Norte, Nodo Sul
- Ângulos: ASC (Casa I), DESC (Casa VII), MC (Casa X), FC (Casa IV)
- Aspectos: tabela completa entre os mapas, orbes, tipo (harmônico/desafiador), exatidão

ORBES RECOMENDADOS: Conjunção (máx 8°, ideal 0-3°), Sextil (máx 6°), Quadratura (máx 8°), Trígono (máx 8°), Oposição (máx 8°). Quanto menor o orbe, mais força.

SE NÃO TIVER HORÁRIO: avisar que a análise fica sem Ascendente/Casas exatas (qualidade reduzida) ou focar só em planetas/aspectos (incompleta). Sempre recomendar buscar certidão de nascimento.
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 10: CHECKLIST DE QUALIDADE + ERROS A EVITAR
// ═══════════════════════════════════════════════════════════════════════════

const CHECKLIST_QUALIDADE = `
## CHECKLIST DE QUALIDADE (antes de finalizar)

☐ ENREDO claro em 5 atos? (Desilusão → Autoconhecimento → Compatibilidade → Terapia → Caminho)
☐ LINGUAGEM sofisticada? (vocabulário extraordinário, não trivial)
☐ METÁFORAS profundas?
☐ REFUTAÇÃO de príncipe/princesa clara? (pessoas reais)
☐ TERAPIA de amor próprio prática? (específica, não abstrata)
☐ PADRÃO nomeado com compaixão? (sem culpa, com compreensão)
☐ COMPATIBILIDADE honesta? (mostra harmonia E desafios)
☐ TOM valida ANTES de consertar?
☐ PRIMEIRA AÇÃO clara? (ela sabe o que fazer HOJE)
☐ ESTRUTURA completa?
☐ NUNCA romantiza?
☐ SEMPRE empodera? (ambas têm poder de escolha)

## ERROS A EVITAR:
❌ Romantizar ("almas gêmeas", "o universo os juntou") → ✅ "base harmônica E desafios; o contrato é: ele aprende A, ela aprende B"
❌ Ignorar desafio ("relacionamento perfeito") → ✅ "X desafios; aqui está como trabalhar"
❌ Focar só em "% de compatibilidade" → ✅ "base sólida, mas precisam trabalhar comunicação/intimidade"
❌ Ignorar Plutão → ✅ "Plutão faz relação intensíssima; trabalhem dinâmica de poder conscientemente"
❌ Não mencionar Nodo Norte → ✅ "Nodo de P1 toca Marte de P2; P2 ensina P1 a agir com confiança"
❌ Ignorar ausência de aspectos → ✅ "ausência de Vênus-Marte = química fraca; trabalhem outras áreas"
❌ Não oferecer estratégias práticas → ✅ "estratégia: P1 comunica X, P2 ouve Y"
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTE 11: CATEGORIAS OBRIGATÓRIAS (framework Astralia — não abandonar)
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORIAS_FRAMEWORK = `
## CATEGORIAS OBRIGATÓRIAS DO FRAMEWORK ASTRALIA (sempre presentes)

Mesmo sendo Sinastria (foco em relacionamento), as 5 categorias do framework aparecem aplicadas ao CASAL:
- 💑 RELACIONAMENTO (foco central — profundo, é o produto)
- 💰 DINHEIRO (como o casal lida com recursos, valores materiais, dinâmica de poder financeiro) — PROPRIEDADE, sempre citado
- 🏥 SAÚDE (saúde do relacionamento, padrões de estresse mútuo, sexualidade como saúde) — citado
- 💼 TRABALHO/EMPRESA (se trabalham juntos, ambição de cada um, como carreira afeta o casal) — citado
- 👨‍👩‍👧 FAMÍLIA (planos de família, dinâmica com famílias de origem, Casa 4 de cada um) — citado

REGRA: Dinheiro e Relacionamento são PROPRIEDADE (sempre aparecem). As outras 3 ajustam profundidade conforme os aspectos do casal tocam essas áreas.
`;

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL: construirSinastria
// ═══════════════════════════════════════════════════════════════════════════

function construirSinastria(dados) {
  const { pessoa1, pessoa2, aspectosSinastria, versao = "premium" } = dados;

  // PASSO 1: Análise dos aspectos
  const analise = analisarSinastria(aspectosSinastria, pessoa1, pessoa2);

  // PASSO 2: Montar prompt integral
  const prompt = estruturarPromptSinastria(analise, pessoa1, pessoa2, aspectosSinastria, versao);

  // PASSO 3: Retornar
  return {
    diagnostico: {
      pessoa1: pessoa1.nome,
      pessoa2: pessoa2.nome,
      padraoCasal: analise.padraoCasal,
      percentualHarmonia: analise.percentualHarmonia,
      indicadoresChave: analise.indicadoresChave,
      contratoKarmico: analise.contratoKarmico,
      venusMarte: analise.venusMarte,
      versao
    },
    prompt: prompt,
    metadados: {
      framework: "Sinastria Master + Diretrizes Técnicas + Framework Astralia",
      modeloRecomendado: "claude-sonnet-4-6",
      palavrasEsperadas: versao === "premium" ? "15.000-18.000" : "10.000-12.000",
      tipo: "premium_assincrono_48h",
      saida: "JSON estruturado por seções (renderização de PDF é camada separada)",
      versao: "2.0"
    }
  };
}

/**
 * PASSO 1: Analisar sinastria (conta harmonia, identifica padrão e indicadores)
 */
function analisarSinastria(aspectos, pessoa1, pessoa2) {
  let harmonicos = 0;
  let desafiadores = 0;
  const indicadoresChave = [];

  aspectos.forEach(a => {
    const tipo = (a.aspecto || "").toLowerCase();
    if (tipo.includes("trígono") || tipo.includes("trigono") || tipo.includes("sextil") || tipo.includes("conjunção") || tipo.includes("conjuncao") || tipo === "120°" || tipo === "60°" || tipo === "0°") {
      harmonicos++;
    } else if (tipo.includes("quadratura") || tipo.includes("oposição") || tipo.includes("oposicao") || tipo === "90°" || tipo === "180°") {
      desafiadores++;
    }

    // Identifica indicadores-chave (Sol-Lua, Vênus-Marte, Lua-Lua, Nodo, Plutão)
    const par = `${a.planeta1}-${a.planeta2}`;
    if (ehIndicadorChave(a.planeta1, a.planeta2)) {
      indicadoresChave.push(`${par}: ${a.aspecto} (orbe ${a.orbe ?? "?"}°)`);
    }
  });

  const total = harmonicos + desafiadores;
  const percentualHarmonia = total > 0 ? Math.round((harmonicos / total) * 100) : 0;

  return {
    harmonicos,
    desafiadores,
    percentualHarmonia,
    padraoCasal: determinarPadrao(percentualHarmonia, aspectos),
    indicadoresChave,
    contratoKarmico: avaliarContratoKarmico(aspectos),
    venusMarte: avaliarVenusMarte(aspectos)
  };
}

function ehIndicadorChave(p1, p2) {
  const chave = [p1, p2].sort().join("-");
  const indicadores = [
    "Lua-Sol", "Sol-Lua", "Marte-Vênus", "Vênus-Marte", "Lua-Lua",
    "Vênus-Vênus", "Mercúrio-Mercúrio", "Nodo Norte-Sol", "Nodo Norte-Lua",
    "Nodo Norte-Vênus", "Nodo Norte-Marte", "Plutão-Vênus", "Plutão-Lua",
    "Saturno-Sol", "Saturno-Lua", "Saturno-Vênus"
  ];
  return indicadores.some(i => i.split("-").sort().join("-") === chave);
}

function determinarPadrao(percentual, aspectos) {
  const oposicoes = aspectos.filter(a =>
    (a.aspecto || "").toLowerCase().includes("oposição") ||
    (a.aspecto || "").toLowerCase().includes("oposicao") ||
    a.aspecto === "180°"
  ).length;

  const totalAspectos = aspectos.length;

  if (oposicoes > totalAspectos * 0.3) return "POLARIZADO (oposições dominam)";
  if (percentual >= 60) return "HARMÔNICO (60%+ harmônico)";
  if (percentual >= 50) return "EQUILIBRADO (50% harmônico)";
  if (percentual >= 40) return "COM ATRITO (40% harmônico)";
  if (totalAspectos < 8) return "DESCONECTADO (poucas conexões)";
  return "COM ATRITO (precisa trabalho)";
}

function avaliarContratoKarmico(aspectos) {
  const nodais = aspectos.filter(a =>
    a.planeta1 === "Nodo Norte" || a.planeta2 === "Nodo Norte" ||
    a.planeta1 === "Nodo Sul" || a.planeta2 === "Nodo Sul"
  ).length;

  if (nodais >= 3) return "FORTE (múltiplos contatos nodais)";
  if (nodais >= 1) return "MÉDIO (há contato nodal)";
  return "FRACO (sem contatos nodais significativos)";
}

function avaliarVenusMarte(aspectos) {
  const vm = aspectos.find(a =>
    (a.planeta1 === "Vênus" && a.planeta2 === "Marte") ||
    (a.planeta1 === "Marte" && a.planeta2 === "Vênus")
  );

  if (!vm) return "AUSENTE (atração química fraca — atenção)";
  return `${vm.aspecto} (orbe ${vm.orbe ?? "?"}°)`;
}

/**
 * PASSO 2: Estruturar prompt integral
 */
function estruturarPromptSinastria(analise, pessoa1, pessoa2, aspectos, versao) {
  const comprimento = versao === "premium" ? "15.000-18.000 palavras" : "10.000-12.000 palavras";

  return `
Você é uma astróloga mestre em Sinastria, gerando uma análise de compatibilidade transformadora.
Comprimento: ${comprimento}. Tom: honesto, sofisticado, NUNCA romantizado.

${MENSAGEM_CENTRAL}

# DADOS DO CASAL

## ${pessoa1.nome}
${formatarMapa(pessoa1)}

## ${pessoa2.nome}
${formatarMapa(pessoa2)}

# DIAGNÓSTICO DA SINASTRIA (já calculado)
- Padrão do casal: ${analise.padraoCasal}
- Harmonia: ${analise.percentualHarmonia}% (${analise.harmonicos} harmônicos, ${analise.desafiadores} desafiadores)
- Vênus-Marte (atração): ${analise.venusMarte}
- Contrato kármico: ${analise.contratoKarmico}
- Indicadores-chave:
${analise.indicadoresChave.map(i => `  - ${i}`).join("\n")}

# ASPECTOS COMPLETOS DA SINASTRIA
${formatarAspectos(aspectos)}

${ENREDO_5_ATOS}

${LINGUAGEM_SOFISTICADA}

${REFUTACAO_PESSOAS_REAIS}

${TERAPIA_AMOR_PROPRIO}

${INDICADORES_TECNICOS}

${PADROES_CASAL}

${ESTRUTURA_SECOES}

${CATEGORIAS_FRAMEWORK}

${CHECKLIST_QUALIDADE}

# UPSELL (individual — sem combo; oferecer ao final, no gancho real que a sinastria revelar)
Conforme a análise revelar, ofereça 1-2 mapas Astralia (nunca empacotados, nunca os seis de uma vez):
- Mapa Kármico: se há contrato kármico forte ou padrões que se repetem entre o casal.
- Mapa da Sorte ou Profissional: se um dos dois busca clareza individual (prosperidade/vocação).
- Revolução Solar: se o casal está em ano de decisão (casamento, mudança, sociedade).
Como conselho genuíno, não propaganda.

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": 1, "titulo": "...", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" sequencial conforme a estrutura de seções; "texto" em PROSA corrida sofisticada (segunda pessoa, não replicar bullets do template).

# COMANDO FINAL
Gere a Sinastria completa para ${pessoa1.nome} e ${pessoa2.nome}.
Use o padrão de casal identificado (${analise.padraoCasal}) para calibrar o tom.
Aprofunde os indicadores-chave listados.
Aplique os 5 atos como espinha dorsal narrativa.
Use linguagem sofisticada e metáforas profundas.
Nunca romantize. Sempre empodere. Mostre harmonia E desafios.
Dinheiro e Relacionamento são propriedade (sempre presentes). Saúde, Trabalho e Família sempre citados.
Retorne apenas o JSON.
`.trim();
}

/**
 * AUXILIAR: Formatar mapa de uma pessoa
 */
function formatarMapa(pessoa) {
  if (!pessoa.planetas) return "(dados incompletos)";

  const planetas = Object.entries(pessoa.planetas)
    .map(([p, d]) => `  - ${p}: ${d.signo} ${d.grau}° (Casa ${d.casa})`)
    .join("\n");

  return `Nascimento: ${pessoa.dataNascimento}, ${pessoa.horaNascimento}, ${pessoa.localNascimento}
${planetas}
  - ASC: ${pessoa.ASC || "?"} | MC: ${pessoa.MC || "?"}`;
}

/**
 * AUXILIAR: Formatar aspectos da sinastria
 */
function formatarAspectos(aspectos) {
  return aspectos
    .map(a => `  - ${a.planeta1} ${a.aspecto} ${a.planeta2} (orbe ${a.orbe ?? "?"}°) [${a.tipo || "?"}]`)
    .join("\n");
}

// EXPORTAR

// ═══════════════════════════════════════════════════════════════════════════
// MODERNIZAÇÃO — calibragem por tipo, estrutura macro, chunk e ponte síncrona
// ═══════════════════════════════════════════════════════════════════════════

// Calibragem do tom/eixo conforme o tipo de relação (campo dados.tipoRelacao)
const TIPOS_SINASTRIA = {
  amorosa: "AMOROSA — entre parceiros românticos. Eixo: atração, intimidade, química sexual (Vênus-Marte), linguagens do amor, futuro a dois. Vênus-Marte = magnetismo físico.",
  profissional: "PROFISSIONAL — entre sócios ou colegas. Eixo: complementaridade de habilidades, divisão de poder, comunicação, confiança e entrega. Vênus-Marte = sintonia criativa e ritmo de trabalho (NÃO leitura sexual). Saturno = responsabilidade e contrato.",
  familiar: "FAMILIAR — entre pais e filhos, irmãos. Eixo: padrões herdados, dinâmica de cuidado e autoridade, feridas transgeracionais, como se nutrem e se ferem. Lua = cuidado; Saturno = autoridade e cobrança. Sem leitura sexual.",
  amizade: "AMIZADE — entre amigos íntimos. Eixo: lealdade, suporte mútuo, crescimento, lazer compartilhado e durabilidade do vínculo. Sem leitura sexual."
};

// Estrutura macro (17 seções legíveis; os subtópicos são obrigatórios DENTRO de cada uma)
const ESTRUTURA_SINASTRIA = `
## ESTRUTURA DO RELATÓRIO — 17 seções macro (cada uma desenvolvida com profundidade; os subtópicos são OBRIGATÓRIOS dentro da seção, em prosa corrida)

ATO 1 — O ENCONTRO
1. CARTA INICIAL — o que é a sinastria de vocês, como ler este material, o que ela revela e o que não promete. Acolhimento. (~500)
2. OS DOIS MAPAS, LADO A LADO — síntese de quem é cada um (Sol, Lua, Ascendente, Vênus e Marte de cada, COM OS GRAUS); o que cada um traz para a relação antes mesmo do encontro. (~800)
3. PRIMEIRA IMPRESSÃO — por que vocês se atraíram (ou se estranharam): Ascendentes, Sol-Lua cruzados e os primeiros aspectos que saltam. (~700)

ATO 2 — VOCÊ PRIMEIRO
4. COMO CADA UM AMA E O QUE REPETE — antes do casal, o padrão individual (Vênus e Lua natais de cada um, feridas que cada um carrega); a relação só se entende quando cada um se vê. (~700)

ATO 3 — A QUÍMICA REAL
5. A QUÍMICA ENTRE VOCÊS — atração e magnetismo: Vênus-Marte (com grau e orbe), Sol-Lua, conjunções de impacto; o que acende. (~800)
6. COMO VOCÊS SE COMPLEMENTAM — presentes mútuos: trígonos e sextis, casas interceptadas (um planeta caindo nas casas do outro), o que um oferece que o outro precisava. (~800)
7. COMO VOCÊS SE COMUNICAM — Mercúrio cruzado: onde se entendem sem palavras e onde nascem ruídos e mal-entendidos; o caminho da escuta. (~600)
8. AS LINGUAGENS DO AMOR, NA PRÁTICA — manual de convivência: como CADA UM precisa receber afeto (frases diretas: "para [Nome] se sentir amado/valorizado, faça X"); Vênus por elemento de cada um. (~700)
9. COMO VOCÊS AGEM JUNTOS — Marte cruzado: cooperação, ritmo, onde a energia soma e onde atrita; decisões e conflitos práticos. (~600)

ATO 3.5 — AS SOMBRAS (honestidade sem condenação)
10. OS DESAFIOS DA RELAÇÃO — aspectos tensos (quadraturas e oposições, com grau e orbe): o que pede crescimento, sempre com o caminho de travessia. (~800)
11. SATURNO — O PROFESSOR DA RELAÇÃO — estrutura que sustenta vs. peso que esfria; frieza, cobrança, "contrato de trabalho"; como trazer leveza. (~500)
12. PLUTÃO E NETUNO — PODER E ILUSÃO — os ganchos de sombra: dinâmicas de controle/possessividade/ciúme (Plutão) e de idealização/codependência/perda de si (Netuno), SEMPRE nomeadas como dinâmica ancorada no aspecto real, com o caminho de autonomia e limites. (~700)

ATO 4 — A TRANSFORMAÇÃO
13. INTIMIDADE E CONFIANÇA — química real vs. fantasia, vulnerabilidade consentida, o que constrói (ou corrói) a confiança entre vocês. (~600)
14. O PROPÓSITO DO ENCONTRO — Nodos Lunares cruzados e o karma do casal: relação evolutiva (que faz crescer) ou kármica (que veio ensinar); o que vocês vieram fazer um pelo outro. (~700)
15. QUE TIPO DE RELAÇÃO É A DE VOCÊS — síntese pelos 7 padrões (almas evolutivas, complementaridade, espelho kármico, atração intensa, poder, crescimento pelo atrito, jupiteriana); qual é o de vocês e o que isso significa. (~600)

ATO 5 — O CAMINHO
16. O QUE A RELAÇÃO PEDE DE CADA UM + O POTENCIAL DE VOCÊS JUNTOS — o trabalho de cada lado, a melhor versão que pode emergir e um plano prático dos próximos passos. (~900)
17. MENSAGEM FINAL + PRÓXIMOS PASSOS NA ASTRALIA — fechamento que empodera (a escolha é de vocês; relações se reconstroem a cada ciclo de consciência) + 1-2 chamadas individuais no gancho real. (~500)
`;

// Faixas de seções para geração em partes (chunk) — evita estourar 30k tokens por chamada
const SECOES_POR_PARTE_SIN = {
  completo: [1, 17],
  parte1:   [1, 6],
  parte2:   [7, 12],
  parte3:   [13, 17]
};

// Corpo de conhecimento reusado pela ponte síncrona
function montarConhecimentoSinastria() {
  return [
    MENSAGEM_CENTRAL,
    ENREDO_5_ATOS,
    LINGUAGEM_SOFISTICADA,
    REFUTACAO_PESSOAS_REAIS,
    TERAPIA_AMOR_PROPRIO,
    INDICADORES_TECNICOS,
    PADROES_CASAL,
    CATEGORIAS_FRAMEWORK,
    CHECKLIST_QUALIDADE
  ].join("\n\n");
}

// PONTE SÍNCRONA — buildPromptSinastria(dados, mapaAInfo, mapaBInfo, aspectosInfo, parte)
// dados: { nomeA, nomeB, tipoRelacao, estagio?, questao?, horaBausente? }
// mapaAInfo / mapaBInfo: mapas já formatados em texto; aspectosInfo: aspectos A×B em texto.
// parte: "completo" | "parte1" | "parte2" | "parte3" (chunk).
function buildPromptSinastria(dados, mapaAInfo, mapaBInfo, aspectosInfo, parte = "completo") {
  const nomeA = dados.nomeA || (dados.pessoa1 && dados.pessoa1.nome) || '[PESSOA A]';
  const nomeB = dados.nomeB || (dados.pessoa2 && dados.pessoa2.nome) || '[PESSOA B]';
  const tipo = (dados.tipoRelacao || 'amorosa').toLowerCase();
  const calibragem = TIPOS_SINASTRIA[tipo] || TIPOS_SINASTRIA.amorosa;
  const faixa = SECOES_POR_PARTE_SIN[parte] || SECOES_POR_PARTE_SIN.completo;
  const ini = faixa[0], fim = faixa[1];
  const escopo = parte === "completo"
    ? "Gere TODAS as 17 seções, na ordem."
    : `Esta é a ${parte}. Gere SOMENTE as seções ${ini} a ${fim} da estrutura — não gere as demais. Mantenha o "numero" global real de cada seção (de ${ini} a ${fim}).`;
  const horaB = dados.horaBausente
    ? `ATENÇÃO: a hora de nascimento de ${nomeB} não foi informada. Trate o Ascendente e as casas de ${nomeB} como não confirmados; priorize os aspectos de Sol, Lua, Vênus e Marte (estáveis independentemente da hora) e sinalize com elegância essa limitação onde for relevante.`
    : "";

  return `Você é uma astróloga brasileira mestre em Sinastria, com 30 anos de experiência em astrologia comparada e psicologia dos relacionamentos. Escreve em PORTUGUÊS DO BRASIL, com sofisticação e calor. Sua análise revela a DINÂMICA da relação — o que une E o que desafia, com igual profundidade — sem jamais julgar a relação como boa ou má, e sem jamais dizer "fuja" ou "não vai durar". NUNCA é determinista: use "tende a", "pode indicar". Você fala para AS DUAS pessoas, não só para quem pediu.

TIPO DE RELAÇÃO (calibre todo o tom e o foco por isto): ${calibragem}
${dados.estagio ? 'Estágio da relação: ' + dados.estagio : ''}
${dados.questao ? 'Principal questão que querem entender: ' + dados.questao : ''}

${MENSAGEM_CENTRAL}

# OS DOIS MAPAS
## ${nomeA}
${mapaAInfo}

## ${nomeB}
${mapaBInfo}
${horaB}

# ASPECTOS ENTRE OS MAPAS
Use APENAS estes. Cite o grau dos planetas e o orbe de cada aspecto, e correlacione os aspectos entre si.
${aspectosInfo}

${montarConhecimentoSinastria()}

${ESTRUTURA_SINASTRIA}

# REQUISITOS
- Cite SEMPRE o grau dos planetas e o orbe de cada aspecto; correlacione os posicionamentos (ex.: a Vênus de ${nomeA} em tal grau tocando o Marte de ${nomeB} reforça/tensiona tal outra dinâmica).
- Aspectos difíceis SEMPRE com caminho de crescimento. As sombras (Plutão, Netuno, Saturno) são nomeadas como dinâmica ancorada no aspecto real — NUNCA como rótulo clínico ("narcisista", "tóxico"), NUNCA com "fuja desta pessoa". Linguagem acolhedora, porém incisiva quando preciso.
- Fale para AS DUAS pessoas. Tom de terapeuta de casais que conhece astrologia: honesto, jamais condenatório.
- Aplique os 5 Atos como espinha narrativa e os 7 tipos para calibrar a síntese.
- Empodere: relações evoluem, e a cada ciclo de consciência há a chance de reconstruir o vínculo em bases melhores.

# ESCOPO DESTA GERAÇÃO
${escopo}

# FORMATO DE SAÍDA (OBRIGATÓRIO)
Responda EXCLUSIVAMENTE com JSON válido, sem texto antes/depois, sem markdown:
{ "secoes": [ { "numero": ${ini}, "titulo": "...", "texto": "..." } ] }
REGRAS: aspas duplas; escape quebras como \\n e aspas internas como \\"; sem blocos de código; "numero" = número global real da seção; "texto" em PROSA corrida sofisticada (segunda pessoa, sem replicar bullets do template).

# COMANDO FINAL
Gere a Sinastria de ${nomeA} e ${nomeB}${parte !== "completo" ? " (" + parte + ", seções " + ini + "-" + fim + ")" : ""}. Nunca romantize, nunca condene. Mostre harmonia E desafio. Retorne apenas o JSON.`;
}


module.exports = {
  construirSinastria,
  buildPromptSinastria,
  montarConhecimentoSinastria,
  TIPOS_SINASTRIA,
  ESTRUTURA_SINASTRIA,
  SECOES_POR_PARTE_SIN,
  MENSAGEM_CENTRAL,
  ENREDO_5_ATOS,
  LINGUAGEM_SOFISTICADA,
  REFUTACAO_PESSOAS_REAIS,
  TERAPIA_AMOR_PROPRIO,
  INDICADORES_TECNICOS,
  PADROES_CASAL,
  ESTRUTURA_SECOES,
  COMANDOS_OBTER_DADOS,
  CHECKLIST_QUALIDADE,
  CATEGORIAS_FRAMEWORK
};
