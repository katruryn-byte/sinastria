// ============================================================
// _cota.js — CONTADOR DE COTA DO PDFSHIFT COM ALARME AUTOMÁTICO
// ------------------------------------------------------------
// Cada PDF gerado incrementa o contador do mês no Redis. Ao cruzar
// os limiares (aviso e crítico), envia UM e-mail de alerta à dona
// (idempotente: cada limiar alerta uma única vez por mês).
//
// Filosofia: o contador NUNCA pode derrubar uma entrega. Toda falha
// aqui é engolida com console.error — o PDF do cliente vem primeiro.
//
// Chaves Redis:
//   pdfshift:uso:{AAAA-MM}      (int) conversões do mês, TTL 90d
//   pdfshift:alerta:{AAAA-MM}:{limiar}  (flag) alerta já enviado
//
// Observação honesta: este é o NOSSO espelho (conta conversões que
// pedimos). A fonte da verdade é o painel do PDFShift — arquivos
// muito grandes podem consumir mais de 1 crédito por conversão.
// ============================================================

const { createClient } = require('redis');

const COTA_MENSAL = parseInt(process.env.PDFSHIFT_COTA_MENSAL || '50', 10);
const LIMIAR_AVISO = Math.floor(COTA_MENSAL * 0.8);   // 40 de 50
const LIMIAR_CRITICO = Math.max(LIMIAR_AVISO + 1, COTA_MENSAL - 2); // 48 de 50
const EMAIL_DONA = process.env.ALERTA_EMAIL || 'katruryn@gmail.com';

function mesAtual() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

async function enviarAlerta(usados, limiar, critico) {
  if (!process.env.RESEND_API_KEY) return;
  const assunto = critico
    ? `\u26a0\ufe0f CR\u00cdTICO: cota de PDFs quase esgotada (${usados}/${COTA_MENSAL})`
    : `Aviso Astralia: ${usados} de ${COTA_MENSAL} PDFs usados neste m\u00eas`;
  const corpo = `
  <div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:24px;border:1px solid #e4d9cf;border-radius:12px;background:#fff">
    <div style="text-align:center;font-size:12px;letter-spacing:.25em;color:#b08431;text-transform:uppercase">Astralia &middot; Monitor de cota</div>
    <h2 style="color:#7d1733;text-align:center;margin:14px 0">${critico ? 'Cota de PDFs quase no fim' : 'Cota de PDFs em 80%'}</h2>
    <p style="font-size:15px;line-height:1.7;color:#2c2429">O sistema j\u00e1 gerou <b>${usados} de ${COTA_MENSAL}</b> PDFs neste m\u00eas (${mesAtual()}).</p>
    <p style="font-size:15px;line-height:1.7;color:#2c2429">${critico
      ? '<b>A pr\u00f3xima entrega pode falhar por falta de cr\u00e9ditos.</b> Fa\u00e7a o upgrade do plano no painel do PDFShift agora para n\u00e3o deixar cliente sem produto.'
      : 'Se as vendas continuarem neste ritmo, considere fazer o upgrade do plano no PDFShift antes do fim do m\u00eas.'}</p>
    <p style="font-size:12px;color:#8a8085;margin-top:18px;font-style:italic">Este contador \u00e9 o espelho interno; confira o n\u00famero oficial no painel do PDFShift. Alerta autom\u00e1tico \u2014 enviado uma \u00fanica vez por limiar, por m\u00eas.</p>
  </div>`;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Astralia <contato@astralia.online>',
      to: [EMAIL_DONA],
      subject: assunto,
      html: corpo
    })
  });
  if (!resp.ok) throw new Error('Resend ' + resp.status);
}

// Registra UMA conversão de PDF. Chamar logo após o PDFShift responder OK.
// Nunca lança erro — falha de contagem não pode quebrar a entrega.
async function registrarConversaoPdf(origem) {
  let redis;
  try {
    redis = createClient({ url: process.env.REDIS_URL || process.env.STORAGE_URL });
    redis.on('error', e => console.error('[cota] redis:', e.message));
    await redis.connect();

    const mes = mesAtual();
    const chave = 'pdfshift:uso:' + mes;
    const usados = await redis.incr(chave);
    if (usados === 1) await redis.expire(chave, 60 * 60 * 24 * 90);
    console.log(`[COTA] pdf #${usados}/${COTA_MENSAL} do m\u00eas ${mes} (origem: ${origem || '?'})`);

    for (const { limiar, critico } of [
      { limiar: LIMIAR_AVISO, critico: false },
      { limiar: LIMIAR_CRITICO, critico: true }
    ]) {
      if (usados >= limiar) {
        const flag = `pdfshift:alerta:${mes}:${limiar}`;
        const inedito = await redis.set(flag, '1', { NX: true, EX: 60 * 60 * 24 * 40 });
        if (inedito) {
          try { await enviarAlerta(usados, limiar, critico); }
          catch (e) { await redis.del(flag); console.error('[cota] alerta falhou:', e.message); }
        }
      }
    }

    await redis.quit();
    return usados;
  } catch (e) {
    console.error('[cota] falha ao registrar (entrega segue normal):', e.message);
    try { if (redis) await redis.quit(); } catch (e2) {}
    return null;
  }
}

// Lê o estado atual da cota (para o painel /api/cota).
async function lerCota() {
  const redis = createClient({ url: process.env.REDIS_URL || process.env.STORAGE_URL });
  redis.on('error', e => console.error('[cota] redis:', e.message));
  await redis.connect();
  const agora = new Date();
  const meses = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const mes = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const usados = parseInt(await redis.get('pdfshift:uso:' + mes) || '0', 10);
    meses.push({ mes, usados });
  }
  await redis.quit();
  return {
    cotaMensal: COTA_MENSAL,
    limiares: { aviso: LIMIAR_AVISO, critico: LIMIAR_CRITICO },
    mesAtual: meses[0],
    historico: meses
  };
}

module.exports = { registrarConversaoPdf, lerCota, COTA_MENSAL };
