import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function resposta(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return resposta({ enviado: false, motivo: 'metodo_invalido' }, 405);

  const apiKey = Deno.env.get('CALLMEBOT_APIKEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!apiKey || !supabaseUrl || !serviceRole) {
    console.error('Segredo CALLMEBOT_APIKEY ou credenciais do Supabase ausentes.');
    return resposta({ enviado: false, motivo: 'nao_configurado' }, 503);
  }

  const { pedido_id: pedidoId } = await req.json().catch(() => ({}));
  if (typeof pedidoId !== 'string' || !pedidoId) {
    return resposta({ enviado: false, motivo: 'pedido_invalido' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRole);
  const { data: config, error: configError } = await admin
    .from('configuracoes')
    .select('notif_whatsapp_ativo, notif_whatsapp_numero')
    .eq('id', 1)
    .single();
  if (configError) {
    console.error('Erro ao ler configurações:', configError.message);
    return resposta({ enviado: false, motivo: 'configuracao_indisponivel' }, 500);
  }
  if (!config?.notif_whatsapp_ativo || !config?.notif_whatsapp_numero) {
    return resposta({ enviado: false, motivo: 'desativado' });
  }

  // A atualização condicional é a trava contra duplicidade: um pedido só pode
  // disparar um WhatsApp, mesmo se o navegador reenviar a chamada.
  const agora = new Date().toISOString();
  const { data: pedido, error: pedidoError } = await admin
    .from('pedidos')
    .update({ notificacao_whatsapp_enviada_em: agora })
    .eq('id', pedidoId)
    .is('notificacao_whatsapp_enviada_em', null)
    .select('numero_pedido, total, tipo_entrega, data_agendada, periodo_agendado, dados_convidado, perfis(nome, telefone)')
    .maybeSingle();

  if (pedidoError) {
    console.error('Erro ao reservar notificação:', pedidoError.message);
    return resposta({ enviado: false, motivo: 'pedido_indisponivel' }, 500);
  }
  if (!pedido) return resposta({ enviado: false, motivo: 'ja_enviado_ou_nao_encontrado' });

  const telefone = String(config.notif_whatsapp_numero).replace(/\D/g, '');
  const telefoneInternacional = telefone.startsWith('55') ? `+${telefone}` : `+55${telefone}`;
  const cliente = pedido.dados_convidado?.nome ?? pedido.perfis?.nome ?? 'Cliente';
  const telefoneCliente = pedido.dados_convidado?.telefone ?? pedido.perfis?.telefone ?? '';
  const entrega = pedido.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada no local';
  const total = Number(pedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const mensagem = [
    'Novo pedido no site',
    `Pedido: ${pedido.numero_pedido}`,
    `Cliente: ${cliente}${telefoneCliente ? ` (${telefoneCliente})` : ''}`,
    `Total: ${total}`,
    `${entrega} — ${pedido.data_agendada}${pedido.periodo_agendado ? ` (${pedido.periodo_agendado})` : ''}`,
  ].join('\n');

  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', telefoneInternacional);
  url.searchParams.set('text', mensagem);
  url.searchParams.set('apikey', apiKey);

  try {
    const callmebot = await fetch(url, { method: 'GET' });
    const texto = await callmebot.text();
    if (!callmebot.ok) throw new Error(`CallMeBot ${callmebot.status}: ${texto}`);
    return resposta({ enviado: true });
  } catch (error) {
    console.error('Falha no CallMeBot:', error);
    // Permite nova tentativa pelo pedido; não informa o detalhe ao navegador.
    await admin.from('pedidos').update({ notificacao_whatsapp_enviada_em: null }).eq('id', pedidoId);
    return resposta({ enviado: false, motivo: 'falha_no_envio' }, 502);
  }
});
