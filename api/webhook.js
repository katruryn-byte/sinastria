const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('redis');
const { registrarCompra } = require('./cliente');

const PRODUTO_ID = 'sinastria';

// ── Registro na planilha (Google Apps Script) — DUAS linhas por compra ──
// O Apps Script lê os cabeçalhos da linha 1 e faz upsert pela coluna "Sessao ID".
// Como as duas pessoas compartilham a compra, a Pessoa 2 ganha sufixo "-B" na
// chave (senão a segunda linha sobrescreveria a primeira). Valor e CPF só na
// linha 1. Email Enviado Em / Status Entrega são carimbados depois, pelo worker.
// Fire-and-forget: falha na planilha NUNCA derruba a esteira.
function registrarNoSheets(dados, codigoCliente, preco, recorrente, sessionId, paymentId) {
  try {
    if (!process.env.APPS_SCRIPT_URL) return;
    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
    const tipoBase = 'sinastria-' + (dados.tipo || 'eros') + (dados.edicao ? '-' + dados.edicao : '');
    const flagRecorrente = recorrente ? 'Sim' : 'Não';

    let tzDe = () => '';
    try {
      const { getTimezoneCoord } = require('./timezone-coord');
      tzDe = (p) => {
        try { return (p && p.lat && p.lon) ? String(getTimezoneCoord(p.lat, p.lon, p.data, p.hora)) : ''; }
        catch (e) { return ''; }
      };
    } catch (e) {}

    const linhaDe = (p, papel, valor, cpf, chave) => ({
      'Data': agora,
      'Nome': (p && p.nome) || dados.nome || '',
      'WhatsApp': dados.whatsapp || '',
      'Email': dados.email || '',
      'Cidade': (p && p.cidade) || '',
      'Nascimento': (p && p.data) || '',
      'Hora': (p && p.hora) || '',
      'Tipo': tipoBase + ' · ' + papel,
      'Valor': valor,
      'Codigo Cliente': codigoCliente || '',
      'Genero': dados.genero || '',
      'Cliente Recorrente': flagRecorrente,
      'Lat': (p && p.lat) || '',
      'Lon': (p && p.lon) || '',
      'Timezone': tzDe(p),
      'CPF': cpf || '',
      'Status Pagamento': 'approved',
      'Payment ID MP': paymentId ? String(paymentId) : '',
      'Sessao ID': chave,
      'Status Entrega': 'em produção'
    });

    const linhas = [];
    if (dados.pessoaA) {
      linhas.push(linhaDe(dados.pessoaA, 'Pessoa 1', Number(preco || 0).toFixed(2), dados.cpf || '', sessionId || ''));
      if (dados.pessoaB) linhas.push(linhaDe(dados.pessoaB, 'Pessoa 2', '', '', (sessionId || '') + '-B'));
    } else {
      linhas.push(linhaDe(dados, 'Pessoa 1', Number(preco || 0).toFixed(2), dados.cpf || '', sessionId || ''));
    }

    (async () => {
      for (const linha of linhas) {
        await fetch(process.env.APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linha)
        });
      }
    })().catch(e => console.log('Sheets (Apps Script):', e.message));
  } catch (e) {
    console.log('Sheets (montagem):', e.message);
  }
}

// Marca pago + registra cliente + enfileira para geracao (manual no inicio; n8n depois).
// NAO gera a leitura aqui: produto premium e assincrono (Opus, 48h, PDF por email).
async function processarAprovacao(sessionId, paymentId, redisUrl) {
  const rc = createClient({ url: redisUrl });
  rc.on('error', err => console.error('Redis:', err));
  await rc.connect();
  const existing = await rc.get(`session:${sessionId}`);
  const sessionObj = existing ? JSON.parse(existing) : {};

  // Idempotencia: se ja foi processado, nao enfileira de novo
  if (sessionObj.status === 'pago_aguardando_geracao' || sessionObj.status === 'gerado') {
    await rc.quit();
    return;
  }

  if (sessionObj.dados) {
    try {
      // Enriquecimento: os dados de nascimento da compradora moram em pessoaA;
      // espelha no nivel raiz para o cadastro do cliente (Redis) ficar completo.
      const pA = sessionObj.dados.pessoaA || {};
      const dadosReg = {
        ...sessionObj.dados,
        data: sessionObj.dados.data || pA.data,
        hora: sessionObj.dados.hora || pA.hora,
        cidade: sessionObj.dados.cidade || pA.cidade,
        lat: sessionObj.dados.lat || pA.lat,
        lon: sessionObj.dados.lon || pA.lon,
        preco: sessionObj.preco
      };
      const reg = await registrarCompra(dadosReg, PRODUTO_ID);
      sessionObj.codigoCliente = reg.codigo;
      sessionObj.novoCliente = reg.novoCliente;

      // Ponte com o Google Sheets: duas linhas (Pessoa 1 e Pessoa 2)
      registrarNoSheets(sessionObj.dados, reg.codigo, sessionObj.preco, !reg.novoCliente, sessionId, paymentId);
    } catch (e) { console.error('Erro ao registrar cliente:', e.message); }
  }

  sessionObj.status = 'pago_aguardando_geracao';
  sessionObj.paymentId = String(paymentId);
  sessionObj.paidAt = new Date().toISOString();
  await rc.setEx(`session:${sessionId}`, 60 * 60 * 24 * 30, JSON.stringify(sessionObj));

  await rc.lPush('fila:sinastria', JSON.stringify({
    sessionId, codigoCliente: sessionObj.codigoCliente, dados: sessionObj.dados,
    preco: sessionObj.preco, paidAt: sessionObj.paidAt
  }));
  await rc.quit();
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const query = req.query;
    const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL;
    let paymentId = null;

    if (body?.type === 'payment' && body?.data?.id) {
      paymentId = body.data.id;
    } else if (query?.topic === 'payment' && query?.id) {
      paymentId = query.id;
    } else if (body?.type === 'merchant_order' || query?.topic === 'merchant_order') {
      const orderId = body?.data?.id || query?.id;
      if (!orderId) return res.status(200).json({ status: 'no_order_id' });
      const mpResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const orderData = await mpResponse.json();
      const aprovados = (orderData.payments || []).filter(p => p.status === 'approved');
      if (aprovados.length === 0) return res.status(200).json({ status: 'pending_payment' });
      paymentId = aprovados[0].id;
      if (orderData.external_reference) {
        await processarAprovacao(orderData.external_reference, paymentId, redisUrl);
        return res.status(200).json({ status: 'success' });
      }
      return res.status(200).json({ status: 'no_external_reference' });
    } else {
      return res.status(200).json({ status: 'ignored' });
    }

    if (!paymentId) return res.status(200).json({ status: 'no_payment_id' });

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });
    if (payment.status !== 'approved') return res.status(200).json({ status: 'not_approved' });

    const sessionId = payment.external_reference;
    if (!sessionId) return res.status(200).json({ status: 'no_session' });

    await processarAprovacao(sessionId, paymentId, redisUrl);
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook erro:', error.message);
    return res.status(200).json({ status: 'error', message: error.message });
  }
}

module.exports.processarAprovacao = processarAprovacao;
