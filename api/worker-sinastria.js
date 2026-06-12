// api/worker-sinastria.js
// Esteira incremental da SINASTRIA (4 tipos: eros, philia, storge, pragma).
// Roda por cron (a cada minuto). Cada invocação executa UMA etapa:
//   1ª: tira a compra da fila, calcula a sinastria (FreeAstrology, 1 única vez,
//       cacheada no job) e gera a primeira parte;
//   seguintes: geram uma parte por vez (Claude Sonnet, ~22k tokens);
//   última: monta o PDF (PDFShift), registra a cota e envia por e-mail (Resend).
//
// TRAVA ANTI-SOBREPOSIÇÃO (lição do worker-combo): um lock com TTL impede que
// invocações do cron se atropelem gerando a mesma parte em duplicidade.
//
// Rotas de teste (?teste=ADMIN_SECRET):
//   &status=1                          → relatório das filas
//   &seed=eros|philia|storge|pragma    → cria compra fictícia (&email= opcional)
//   &reprocessar=sess_XXXX             → reenfileira compra PAGA para gerar do zero

const { createClient } = require('redis');

// Requires com caminho LITERAL, um a um — o empacotador da Vercel só inclui no
// deploy os módulos que consegue rastrear estaticamente (require em variável
// falha SÓ em produção; foi o bug que paralisou o combo do Lilith em 11/06).
let CORE = null, PROMPT = null, COTA = null;
try { CORE = require('./_sinastria-core.js'); } catch (e) { console.warn('[worker-sinastria] módulo ausente: _sinastria-core -', e.message); }
try { PROMPT = require('./prompt-sinastria.js'); } catch (e) { console.warn('[worker-sinastria] módulo ausente: prompt-sinastria -', e.message); }
try { COTA = require('./_cota.js'); } catch (e) { console.warn('[worker-sinastria] módulo ausente: _cota (contador segue desativado) -', e.message); }

const MAX_TOKENS = 22000;
const TTL_JOB = 60 * 60 * 24 * 30; // 30 dias
const LOCK_TTL = 540;              // 9 min — cobre uma parte (~6 min) com folga
const MAX_TENTATIVAS = 3;

const ROTULO_TIPO = {
  eros:   'Sinastria Amorosa · Eros',
  philia: 'Sinastria de Amizade · Philia',
  storge: 'Sinastria de Família · Storge',
  pragma: 'Sinastria Profissional · Pragma'
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Extração de JSON robusta a markdown e truncamento (padrão comprovado do Lilith) ──
function extrairJSON(texto) {
  if (!texto) return null;
  let limpo = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
  const primeiro = limpo.indexOf('{');
  if (primeiro === -1) return null;
  const ultimo = limpo.lastIndexOf('}');
  if (ultimo > primeiro) {
    try { return JSON.parse(limpo.substring(primeiro, ultimo + 1)); } catch (e) { /* tenta recuperar */ }
  }
  const str = limpo.substring(primeiro);
  let abertos = 0, dentroString = false, escape = false, ultimoValido = -1;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { dentroString = !dentroString; continue; }
    if (dentroString) continue;
    if (c === '{' || c === '[') abertos++;
    if (c === '}' || c === ']') { abertos--; if (abertos === 0) ultimoValido = i; }
  }
  if (ultimoValido > -1) {
    try { return JSON.parse(str.substring(0, ultimoValido + 1)); } catch (e) { /* desiste */ }
  }
  return null;
}

// ── Claude Sonnet com retry em rate limit/sobrecarga (mesmo padrão do Lilith) ──
async function chamarClaude(prompt, maxTokens, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (res.status === 429 || res.status === 529) { await sleep(2000 * (i + 1)); continue; }
    const corpo = await res.text();
    let data = null; try { data = JSON.parse(corpo); } catch (e) {}
    // Erro da API NUNCA é engolido: vira mensagem visível no diagnóstico
    if (!res.ok) return { __erro: 'API Anthropic HTTP ' + res.status + ' — ' + corpo.slice(0, 200) };
    if (data && data.type === 'error') return { __erro: 'API Anthropic: ' + ((data.error && data.error.message) || corpo.slice(0, 200)) };
    return data;
  }
  return null;
}

// ── Blocos de texto para o prompt, a partir do resultado do núcleo ──
function montarBlocos(r, nomeA, nomeB) {
  return {
    pontosA: CORE.fmtPontos(r.pontosA, nomeA),
    pontosB: CORE.fmtPontos(r.pontosB, nomeB),
    cruzados: CORE.fmtCruzados(r.cruzados, nomeA, nomeB, 40),
    contagem: CORE.fmtContagem(r.contagem),
    overlayAemB: CORE.fmtOverlay(r.overlayAemB, nomeA, nomeB),
    overlayBemA: CORE.fmtOverlay(r.overlayBemA, nomeB, nomeA),
    composto: CORE.fmtComposto(r.composto),
    perfilA: CORE.fmtPerfil(r.perfilA, nomeA),
    perfilB: CORE.fmtPerfil(r.perfilB, nomeB),
    venusXvenus: CORE.fmtComparacaoSignos(r.venusXvenus, 'Vênus', nomeA, nomeB),
    marteXmarte: CORE.fmtComparacaoSignos(r.marteXmarte, 'Marte', nomeA, nomeB)
  };
}

// ── HTML do PDF (capa + seções), paleta vinho/dourado da Astralia ──
function escaparHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function paragrafos(conteudo) {
  return String(conteudo || '').split(/\n\s*\n/).map(p => '<p>' + escaparHtml(p.trim()).replace(/\n/g, '<br>') + '</p>').join('\n');
}
function montarHtmlSinastria(job) {
  const rotulo = ROTULO_TIPO[job.tipo] || 'Sinastria';
  const dataStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const corpo = (job.secoes || []).map(s => `
    <section class="secao">
      <h2>${escaparHtml(s.titulo)}</h2>
      ${paragrafos(s.conteudo)}
    </section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<style>
  @page { margin: 2.2cm 1.9cm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #2b1320; font-size: 12.5pt; line-height: 1.75; }
  .capa { text-align: center; page-break-after: always; padding-top: 5cm; }
  .capa .marca { font-size: 13pt; letter-spacing: 0.55em; color: #b8860b; text-transform: uppercase; }
  .capa h1 { font-size: 30pt; color: #7a1632; margin: 0.6em 0 0.2em; font-weight: normal; letter-spacing: 0.04em; }
  .capa .nomes { font-size: 19pt; color: #2b1320; margin-top: 1.4em; }
  .capa .e { color: #b8860b; font-style: italic; font-size: 14pt; margin: 0.3em 0; }
  .capa .data { margin-top: 3.2em; font-size: 10.5pt; color: #8a6d3b; letter-spacing: 0.18em; text-transform: uppercase; }
  .filete { width: 130px; height: 1px; background: #b8860b; margin: 1.6em auto; }
  h2 { color: #7a1632; font-size: 17pt; font-weight: normal; margin: 1.8em 0 0.5em; padding-bottom: 0.25em; border-bottom: 1px solid #d9b86a; page-break-after: avoid; }
  p { margin: 0 0 0.85em; text-align: justify; }
  .secao { page-break-inside: auto; }
  .rodape { margin-top: 3em; text-align: center; font-size: 9.5pt; color: #8a6d3b; letter-spacing: 0.2em; }
</style></head>
<body>
  <div class="capa">
    <div class="marca">Astralia</div>
    <div class="filete"></div>
    <h1>${escaparHtml(rotulo)}</h1>
    <div class="nomes">${escaparHtml(job.casal.nomeA)}<div class="e">&amp;</div>${escaparHtml(job.casal.nomeB)}</div>
    <div class="data">${dataStr}</div>
  </div>
  ${corpo}
  <div class="rodape">✦ ASTRALIA · ASTROLOGIA OCIDENTAL ✦</div>
</body></html>`;
}

// ── PDF via PDFShift ──
async function gerarPdfBuffer(html) {
  if (!process.env.PDFSHIFT_API_KEY) throw new Error('PDFSHIFT_API_KEY ausente no servidor');
  const resp = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: { 'X-API-Key': process.env.PDFSHIFT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: html, sandbox: process.env.PDFSHIFT_SANDBOX === '1' })
  });
  if (!resp.ok) {
    const det = await resp.text().catch(() => '');
    throw new Error('PDFShift ' + resp.status + ' ' + det.slice(0, 200));
  }
  return Buffer.from(await resp.arrayBuffer());
}

// ── E-mail de entrega via Resend, com o PDF anexado ──
function corpoEmailSinastria(job) {
  const rotulo = ROTULO_TIPO[job.tipo] || 'Sinastria';
  return `
  <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #1a0a14; color: #f3e7d3; padding: 36px 30px; border-radius: 10px;">
    <div style="text-align:center; letter-spacing: 0.5em; color: #d9b86a; font-size: 13px;">ASTRALIA</div>
    <h1 style="text-align:center; font-weight: normal; color: #f3e7d3; font-size: 24px; margin: 22px 0 6px;">A Sinastria de Vocês chegou ✨</h1>
    <p style="text-align:center; color:#d9b86a; font-style: italic; margin: 0 0 26px;">${escaparHtml(rotulo)}</p>
    <p>${escaparHtml(job.casal.nomeA)} &amp; ${escaparHtml(job.casal.nomeB)},</p>
    <p>o céu de vocês dois foi lido, cruzado e escrito. O documento completo segue em anexo, em PDF — guarde, releia, sublinhe. Ele foi feito para durar mais do que uma leitura.</p>
    <p>Com carinho,<br>Dana Dasha · Astralia</p>
    <p style="font-size: 11px; color: #a08a6a; margin-top: 28px;">Este material é simbólico e reflexivo; não substitui acompanhamento profissional de saúde, psicológico ou jurídico.</p>
  </div>`;
}
async function enviarEmailSinastria(job, pdfBuffer) {
  if (!job.email) return { skipped: true, motivo: 'sem e-mail do cliente' };
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY ausente no servidor');
  const prim = n => (String(n || '').trim().split(/\s+/)[0] || 'Voce').replace(/[^\p{L}\p{N}-]/gu, '');
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Astralia <contato@astralia.online>',
      to: [job.email],
      subject: 'A Sinastria de Vocês chegou ✨',
      html: corpoEmailSinastria(job),
      attachments: [{
        filename: 'Sinastria-' + prim(job.casal.nomeA) + '-e-' + prim(job.casal.nomeB) + '.pdf',
        content: pdfBuffer.toString('base64')
      }]
    })
  });
  if (!resp.ok) {
    const det = await resp.text().catch(() => '');
    throw new Error('Resend ' + resp.status + ' ' + det.slice(0, 200));
  }
  return { sent: true };
}

// ── Persistência ──
async function salvarJob(redis, job) {
  await redis.setEx('sinastria:job:' + job.sessionId, TTL_JOB, JSON.stringify(job));
}
async function atualizarSessao(redis, sessionId, patch) {
  try {
    const raw = await redis.get('session:' + sessionId);
    if (!raw) return;
    const s = JSON.parse(raw);
    Object.assign(s, patch);
    await redis.setEx('session:' + sessionId, TTL_JOB, JSON.stringify(s));
  } catch (e) { console.warn('[worker-sinastria] sessão não atualizada:', e.message); }
}

// Carimba a entrega na planilha (Apps Script): upsert por "Sessao ID",
// nas duas chaves do casal (sid e sid-B). Só toca nos campos enviados.
async function carimbarEntregaSheets(sessionId) {
  try {
    if (!process.env.APPS_SCRIPT_URL || !sessionId) return;
    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
    for (const chave of [sessionId, sessionId + '-B']) {
      await fetch(process.env.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'Sessao ID': chave, 'Status Entrega': 'entregue', 'Email Enviado Em': agora })
      });
    }
  } catch (e) { console.log('Sheets carimbo:', e.message); }
}

module.exports = async function handler(req, res) {
  const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
  const ehTeste = req.query && req.query.teste === process.env.ADMIN_SECRET;

  const redis = createClient({ url: redisUrl });
  redis.on('error', err => console.error('Redis:', err));
  await redis.connect();

  try {
    // ── STATUS (teste) ──
    if (ehTeste && req.query.status === '1') {
      const [fila, erro, ativo, lock] = await Promise.all([
        redis.lLen('fila:sinastria'), redis.lLen('sinastria:erro'),
        redis.get('sinastria:ativo'), redis.get('sinastria:lock')
      ]);
      let job = null;
      if (ativo) {
        const raw = await redis.get('sinastria:job:' + ativo);
        if (raw) {
          const j = JSON.parse(raw);
          job = {
            sessionId: j.sessionId, tipo: j.tipo, status: j.status,
            partes: j.partes.map(p => ({ parte: p.parte, feito: p.feito, tentativas: p.tentativas, ultimoErro: p.ultimoErro || null })),
            secoes_acumuladas: (j.secoes || []).length
          };
        }
      }
      await redis.quit();
      return res.status(200).json({ status: 'relatorio', fila_sinastria: fila, erros: erro, ativo, lock_ocupado: !!lock, job });
    }

    // ── Espelho da chave Anthropic: inspeção sem expor o segredo ──
    // ?teste=ADMIN_SECRET&chave=1
    if (ehTeste && req.query.chave) {
      const k = process.env.ANTHROPIC_API_KEY || '';
      await redis.quit();
      return res.status(200).json({
        status: 'chave',
        existe: !!k,
        tamanho: k.length,
        comeca_com: k.slice(0, 11),
        termina_com: '...' + k.slice(-4),
        tem_espaco_ou_quebra: /\s/.test(k),
        formato_esperado: 'sk-ant-..., ~100+ caracteres, sem espaços'
      });
    }

    // ── Sonda da ponte com a planilha: GET no Apps Script ──
    // ?teste=ADMIN_SECRET&sheets=1
    if (ehTeste && req.query.sheets) {
      if (!process.env.APPS_SCRIPT_URL) { await redis.quit(); return res.status(200).json({ status: 'sem_APPS_SCRIPT_URL' }); }
      try {
        const r = await fetch(process.env.APPS_SCRIPT_URL);
        const corpo = await r.text();
        await redis.quit();
        return res.status(200).json({ status: 'ponte', http: r.status, resposta: corpo.slice(0, 300) });
      } catch (e) { await redis.quit(); return res.status(200).json({ status: 'ponte_falhou', erro: e.message }); }
    }

    // ── Resgate retroativo: grava na planilha uma compra que o webhook perdeu ──
    // ?teste=ADMIN_SECRET&registrarSheets={sessionId}
    if (ehTeste && req.query.registrarSheets) {
      const sid = String(req.query.registrarSheets);
      const raw = await redis.get('session:' + sid);
      if (!raw) { await redis.quit(); return res.status(404).json({ error: 'sessão não encontrada' }); }
      if (!process.env.APPS_SCRIPT_URL) { await redis.quit(); return res.status(200).json({ status: 'sem_APPS_SCRIPT_URL' }); }
      const s = JSON.parse(raw);
      const d = s.dados || {};
      const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
      let tzDe = () => '';
      try {
        const { getTimezoneCoord } = require('./timezone-coord');
        tzDe = (p) => { try { return (p && p.lat && p.lon) ? String(getTimezoneCoord(p.lat, p.lon, p.data, p.hora)) : ''; } catch (e) { return ''; } };
      } catch (e) {}
      const tipoBase = 'sinastria-' + (d.tipo || 'eros') + (d.edicao ? '-' + d.edicao : '');
      const linhaDe = (p, papel, valor, cpf, chave) => ({
        'Data': agora, 'Nome': (p && p.nome) || d.nome || '', 'WhatsApp': d.whatsapp || '', 'Email': d.email || '',
        'Cidade': (p && p.cidade) || '', 'Nascimento': (p && p.data) || '', 'Hora': (p && p.hora) || '',
        'Tipo': tipoBase + ' · ' + papel, 'Valor': valor, 'Codigo Cliente': d.codigoCliente || '',
        'Genero': d.genero || '', 'Cliente Recorrente': '', 'Lat': (p && p.lat) || '', 'Lon': (p && p.lon) || '',
        'Timezone': tzDe(p), 'CPF': cpf || '', 'Status Pagamento': s.status === 'pending' ? 'pending' : 'approved',
        'Payment ID MP': s.paymentId ? String(s.paymentId) : '', 'Sessao ID': chave,
        'Status Entrega': s.status === 'entregue' ? 'entregue' : 'em produção'
      });
      const linhas = [linhaDe(d.pessoaA || d, 'Pessoa 1', Number(s.preco || 0).toFixed(2), d.cpf || '', sid)];
      if (d.pessoaB) linhas.push(linhaDe(d.pessoaB, 'Pessoa 2', '', '', sid + '-B'));
      const respostas = [];
      for (const linha of linhas) {
        const r = await fetch(process.env.APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(linha) });
        respostas.push({ http: r.status, corpo: (await r.text()).slice(0, 120) });
      }
      await redis.quit();
      return res.status(200).json({ status: 'registrado', sessionId: sid, linhas: linhas.length, respostas });
    }

    // ── Modo verErros: lê a fila de erros (diagnóstico) ──
    // ?teste=ADMIN_SECRET&verErros=1
    if (ehTeste && req.query.verErros) {
      const brutos = await redis.lRange('sinastria:erro', 0, 9);
      const erros = [];
      for (const e of brutos) {
        let reg; try { reg = JSON.parse(e); } catch (x) { reg = { sessionId: e }; }
        if (!reg.motivo && reg.sessionId) {
          const rawJ = await redis.get('sinastria:job:' + reg.sessionId);
          if (rawJ) {
            try {
              const j = JSON.parse(rawJ);
              const pErr = (j.partes || []).find(p => p.ultimoErro);
              if (pErr) { reg.parte = pErr.parte; reg.motivo = pErr.ultimoErro; }
            } catch (x) {}
          }
        }
        erros.push(reg);
      }
      await redis.quit();
      return res.status(200).json({ status: 'erros', total: erros.length, erros });
    }

    // ── Modo limparErros: esvazia a fila de erros após o conserto ──
    if (ehTeste && req.query.limparErros) {
      const n = await redis.lLen('sinastria:erro');
      await redis.del('sinastria:erro');
      await redis.quit();
      return res.status(200).json({ status: 'erros_limpos', removidos: n });
    }

    // ── SEED (teste): compra fictícia direto na fila ──
    if (ehTeste && req.query.seed) {
      const tipo = String(req.query.seed);
      if (!PROMPT || !PROMPT.TIPOS || !PROMPT.TIPOS.includes(tipo)) {
        await redis.quit();
        return res.status(400).json({ error: 'tipo inválido', validos: PROMPT ? PROMPT.TIPOS : [] });
      }
      const sessionId = 'sin-TESTE-' + Date.now();
      const dados = {
        email: req.query.email || 'katruryn@gmail.com',
        tipo,
        edicao: req.query.edicao || null,
        pessoaA: { nome: 'Maria Clara', data: '1992-03-15', hora: '14:30', cidade: 'Fortaleza', lat: -3.7319, lon: -38.5267 },
        pessoaB: { nome: 'João Pedro', data: '1989-11-22', hora: '08:15', cidade: 'Fortaleza', lat: -3.7319, lon: -38.5267 }
      };
      await redis.setEx('session:' + sessionId, TTL_JOB, JSON.stringify({
        sessionId, produto: 'sinastria', status: 'pago_aguardando_geracao', dados,
        preco: 0, paidAt: new Date().toISOString(), teste: true
      }));
      await redis.lPush('fila:sinastria', JSON.stringify({ sessionId, dados, preco: 0, paidAt: new Date().toISOString() }));
      const fila = await redis.lLen('fila:sinastria');
      await redis.quit();
      return res.status(200).json({ status: 'seed_enfileirado', sessionId, tipo, fila_sinastria: fila });
    }

    // ── REPROCESSAR (teste): reenfileira compra PAGA do zero ──
    if (ehTeste && req.query.reprocessar) {
      const sid = String(req.query.reprocessar);
      const raw = await redis.get('session:' + sid);
      if (!raw) { await redis.quit(); return res.status(404).json({ error: 'sessão não encontrada', sessionId: sid }); }
      const s = JSON.parse(raw);
      if (s.status !== 'pago_aguardando_geracao' && s.status !== 'gerado' && s.status !== 'approved') {
        await redis.quit(); return res.status(400).json({ error: 'sessão não está paga', status: s.status });
      }
      await redis.del('sinastria:job:' + sid);
      await redis.lRem('sinastria:erro', 0, sid);
      const ativo = await redis.get('sinastria:ativo');
      if (ativo === sid) await redis.del('sinastria:ativo');
      await redis.lPush('fila:sinastria', JSON.stringify({
        sessionId: sid, dados: s.dados, preco: s.preco, paidAt: s.paidAt,
        reprocessadoEm: new Date().toISOString()
      }));
      const fila = await redis.lLen('fila:sinastria');
      await redis.quit();
      return res.status(200).json({ status: 'reenfileirado para geração do zero', sessionId: sid, fila_sinastria: fila });
    }

    // ── Módulos essenciais presentes? ──
    if (!CORE || !PROMPT) {
      await redis.quit();
      return res.status(500).json({ error: 'módulos essenciais ausentes no deploy', core: !!CORE, prompt: !!PROMPT });
    }

    // ── TRAVA anti-sobreposição: só uma invocação trabalha por vez ──
    const lockOk = await redis.set('sinastria:lock', new Date().toISOString(), { NX: true, EX: LOCK_TTL });
    if (!lockOk) {
      await redis.quit();
      return res.status(200).json({ status: 'ocupado', detalhe: 'outra invocação está gerando; este tique passa a vez' });
    }

    try {
      // ── Job ativo ou próxima compra da fila ──
      let sessionId = await redis.get('sinastria:ativo');
      let job = null;

      if (sessionId) {
        const raw = await redis.get('sinastria:job:' + sessionId);
        if (raw) job = JSON.parse(raw);
        else { await redis.del('sinastria:ativo'); sessionId = null; }
      }

      if (!job) {
        const item = await redis.rPop('fila:sinastria');
        if (!item) {
          return res.status(200).json({ status: 'fila_vazia' });
        }
        const compra = JSON.parse(item);
        const d = compra.dados || {};
        const tipoBruto = (PROMPT.ALIAS_TIPO && PROMPT.ALIAS_TIPO[d.tipo]) || d.tipo;
        const tipo = (tipoBruto && PROMPT.TIPOS.includes(tipoBruto)) ? tipoBruto : 'eros';
        if (!d.pessoaA || !d.pessoaB || !d.pessoaA.data || !d.pessoaB.data) {
          await redis.lPush('sinastria:erro', JSON.stringify({ sessionId: compra.sessionId || 'sem-id', motivo: 'dados_invalidos: pessoaA/pessoaB incompletos' }));
          return res.status(200).json({ status: 'dados_invalidos', sessionId: compra.sessionId });
        }

        // Núcleo matemático: calculado UMA vez, cacheado no job em blocos de texto
        const resultado = await CORE.calcularSinastria(d.pessoaA, d.pessoaB);
        const nomeA = d.pessoaA.nome || 'Pessoa A';
        const nomeB = d.pessoaB.nome || 'Pessoa B';
        const blocos = montarBlocos(resultado, nomeA, nomeB);

        const edicao = (d.edicao && PROMPT.EDICOES && PROMPT.EDICOES.includes(d.edicao)) ? d.edicao : null;

        job = {
          sessionId: compra.sessionId,
          tipo,
          edicao,
          casal: { nomeA, nomeB },
          email: d.email || null,
          blocos,
          partes: PROMPT.listaPartes(tipo).map(p => ({ parte: p, feito: false, tentativas: 0, ultimoErro: null })),
          secoes: [],
          status: 'gerando',
          criadoEm: new Date().toISOString()
        };
        sessionId = job.sessionId;
        await salvarJob(redis, job);
        await redis.set('sinastria:ativo', sessionId);
        await atualizarSessao(redis, sessionId, { statusGeracao: 'gerando' });
        // segue direto para gerar a primeira parte nesta mesma invocação
      }

      // ── Todas as partes prontas? → MONTAGEM (PDF + cota + e-mail) ──
      const pendente = job.partes.find(p => !p.feito);
      if (!pendente) {
        const html = montarHtmlSinastria(job);
        const pdf = await gerarPdfBuffer(html);
        if (COTA && COTA.registrarConversaoPdf) {
          try { await COTA.registrarConversaoPdf('sinastria'); } catch (e) { console.warn('[cota]', e.message); }
        }
        const envio = await enviarEmailSinastria(job, pdf);
        job.status = 'entregue';
      await carimbarEntregaSheets(job.sessionId);
        job.entrega = { em: new Date().toISOString(), para: job.email, envio };
        await salvarJob(redis, job);
        await atualizarSessao(redis, sessionId, { status: 'gerado', entregueEm: job.entrega.em });
        await redis.del('sinastria:ativo');
        return res.status(200).json({ status: 'entregue', sessionId, para: job.email, secoes: job.secoes.length, paginasFonte: html.length });
      }

      // ── Gera UMA parte ──
      const prompt = PROMPT.buildPromptSinastria(job.casal, job.blocos, job.tipo, pendente.parte, job.edicao || null);
      const resp = await chamarClaude(prompt, MAX_TOKENS);
      if (!resp) throw new Error('Claude sem resposta (rede/timeout após retries)');
      if (resp.__erro) throw new Error(resp.__erro);
      const texto = resp && resp.content && resp.content[0] && resp.content[0].text;
      const json = extrairJSON(texto);
      const secoes = json && Array.isArray(json.secoes)
        ? json.secoes.filter(s => s && s.titulo && s.conteudo)
        : [];

      if (secoes.length === 0) {
        pendente.tentativas += 1;
        pendente.ultimoErro = 'Não foi possível extrair as seções da resposta do Claude';
        if (pendente.tentativas >= MAX_TENTATIVAS) {
          job.status = 'erro';
          await salvarJob(redis, job);
          await redis.lPush('sinastria:erro', JSON.stringify({ sessionId, parte: pendente.parte, motivo: pendente.ultimoErro || 'tentativas esgotadas' }));
          await redis.del('sinastria:ativo');
          return res.status(200).json({ status: 'erro_definitivo', sessionId, parte: pendente.parte });
        }
        await salvarJob(redis, job);
        return res.status(200).json({ status: 'parte_falhou_vai_repetir', sessionId, parte: pendente.parte, tentativas: pendente.tentativas });
      }

      pendente.feito = true;
      job.secoes.push(...secoes);
      const restam = job.partes.filter(p => !p.feito).length;
      if (restam === 0) job.status = 'gerado_aguardando_montagem';
      await salvarJob(redis, job);
      return res.status(200).json({ status: 'parte_gerada', sessionId, parte: pendente.parte, secoes: secoes.length, restam });

    } finally {
      await redis.del('sinastria:lock');
    }

  } catch (error) {
    console.error('[worker-sinastria] erro:', error);
    try { await redis.del('sinastria:lock'); } catch (e) { /* já fechado */ }
    try { await redis.quit(); } catch (e) { /* já fechado */ }
    return res.status(500).json({ error: error.message });
  } finally {
    try { if (redis.isOpen) await redis.quit(); } catch (e) { /* já fechado */ }
  }
};
