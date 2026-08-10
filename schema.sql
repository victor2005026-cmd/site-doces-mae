-- ============================================================
-- DOCES DA ALE — Schema Supabase
-- Rode este arquivo no SQL Editor do painel Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- Sequência para número de pedido (ex: PD-1042)
CREATE SEQUENCE IF NOT EXISTS numero_pedido_seq START WITH 1000;

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.produtos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  descricao     text,
  preco         numeric     NOT NULL,
  categoria     text        NOT NULL,   -- gourmet | caixas
  imagem_url    text,
  ativo         boolean     NOT NULL DEFAULT true,
  mais_vendido  boolean     NOT NULL DEFAULT false,
  ordem         int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.perfis (
  id                  uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome                text        NOT NULL,
  telefone            text        NOT NULL UNIQUE,
  telefone_formatado  text,
  endereco_padrao     jsonb,
  email               text,       -- só preenchido depois que o cliente CONFIRMA um e-mail real
                                   -- (ver fetchPerfil em AuthContext.jsx); usado pra recuperação de senha
  eh_admin            boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promocoes (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo             text        NOT NULL,
  descricao          text,
  produto_id         uuid        REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade         int         NOT NULL DEFAULT 1,  -- "leve N" — a partir de quantas unidades a promoção vale
  preco_promocional  numeric,    -- preço TOTAL pra "quantidade" unidades (não por unidade); só usado quando produto_id está preenchido
  ativa              boolean     NOT NULL DEFAULT true,
  ordem              int         NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cupons (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                  text        NOT NULL UNIQUE,
  tipo                    text        NOT NULL, -- percentual | fixo
  valor                   numeric     NOT NULL,
  valor_minimo_pedido     numeric     DEFAULT 0,
  data_inicio             timestamptz DEFAULT now(),
  data_fim                timestamptz,
  usos_maximos            int,        -- null = ilimitado
  usos_atuais             int         DEFAULT 0,
  telefone_cliente        text,       -- se preenchido, cupom só válido pra esse cliente
  descricao               text,
  ativo                   boolean     DEFAULT true,
  created_at              timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pedidos (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido           text        UNIQUE NOT NULL DEFAULT '',
  -- referencia perfis (não auth.users) para permitir embed pedidos->perfis via PostgREST
  usuario_id              uuid        REFERENCES public.perfis(id),
  dados_convidado         jsonb,       -- {nome, telefone, email} se guest
  origem                  text        NOT NULL DEFAULT 'site', -- site|whatsapp|instagram|manual
  status                  text        NOT NULL DEFAULT 'recebido',
  -- aguardando_pagamento|aguardando_confirmacao_pagamento|recebido|confirmado|
  -- preparando|pronto|saiu_entrega|entregue|cancelado
  tipo_entrega            text        NOT NULL, -- entrega|retirada
  endereco_entrega        jsonb,
  data_agendada           date        NOT NULL,
  periodo_agendado        text,        -- manha|tarde|noite
  horario_especifico      time,
  forma_pagamento         text        NOT NULL, -- único valor: 'pix' (pago integralmente antes do preparo)
  data_expiracao_pagamento timestamptz, -- prazo de 30min pro Pix antes de cancelar automaticamente
  comprovante_enviado     boolean     NOT NULL DEFAULT false,
  observacoes             text,
  subtotal                numeric     NOT NULL,
  taxa_entrega            numeric     NOT NULL DEFAULT 0,
  cupom_id                uuid        REFERENCES public.cupons(id),
  desconto_aplicado       numeric     NOT NULL DEFAULT 0,
  total                   numeric     NOT NULL,
  link_pagamento          text,
  pago                    boolean     NOT NULL DEFAULT false,
  pago_em                 timestamptz,
  id_pagamento_externo    text,
  notificacao_whatsapp_enviada_em timestamptz,
  confirmado_em           timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       uuid    NOT NULL REFERENCES public.pedidos ON DELETE CASCADE,
  produto_id      uuid    REFERENCES public.produtos,  -- nullable: produto pode ser deletado
  nome_produto    text    NOT NULL,    -- snapshot do nome na hora do pedido
  quantidade      int     NOT NULL,
  preco_unitario  numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id                          int     PRIMARY KEY DEFAULT 1,
  antecedencia_minima_horas   int     NOT NULL DEFAULT 48,
  taxa_entrega_padrao         numeric NOT NULL DEFAULT 5.00,  -- reserva; taxas_entrega tem prioridade
  pedido_minimo               numeric NOT NULL DEFAULT 0,     -- sem valor mínimo de pedido
  endereco_retirada           jsonb,  -- {rua, numero, complemento, bairro, cidade, cep, referencia}
  horario_funcionamento       jsonb,  -- {dias, abre, fecha, forceStatus, forceLabel}
  horario_retirada            jsonb,  -- {dias, abre, fecha} — se vazio, usa horario_funcionamento
  link_google_maps            text,   -- se vazio, gerado a partir de endereco_retirada ao salvar
  frete_ativo                 boolean NOT NULL DEFAULT false, -- false = entrega grátis em Santos (atual);
                                                               -- true = volta a cobrar por bairro via taxas_entrega
  modo_chuva_ativo            boolean NOT NULL DEFAULT false, -- sem UI no admin; ligar manualmente se precisar
  sobretaxa_chuva             numeric NOT NULL DEFAULT 3.00,
  pix_chave                   text,   -- sempre "+55DDDNNNNNNNNN", gerado a partir do WhatsApp no admin
  pix_tipo                    text,   -- sempre 'celular'
  pix_nome                    text,   -- nome do favorecido (máx. 25 caracteres)
  pix_cidade                  text,   -- sempre 'SANTOS'
  logo_url                    text,   -- Supabase Storage: bucket produtos, pasta site/
  banner_url                  text,
  banner_secundario_url       text,
  banner_ajuste               text    NOT NULL DEFAULT 'cover', -- 'cover' (corta) | 'contain' (mostra tudo)
  notif_email_ativo           boolean NOT NULL DEFAULT false, -- liga/desliga o envio de e-mail de pedido novo
  notif_email_destino         text,   -- e-mail da Ale que recebe o aviso de pedido novo
  emailjs_service_id          text,   -- painel do EmailJS (emailjs.com) → Email Services
  emailjs_template_id         text,   -- painel do EmailJS → Email Templates
  emailjs_public_key          text,   -- painel do EmailJS → Account → General → Public Key
  notif_whatsapp_ativo        boolean NOT NULL DEFAULT false,
  notif_whatsapp_numero       text    -- 11 dígitos; a API key fica em Secret, nunca nesta tabela
);

CREATE TABLE IF NOT EXISTS public.datas_bloqueadas (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date        UNIQUE NOT NULL,
  motivo      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.taxas_entrega (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bairro      text        NOT NULL UNIQUE,
  taxa        numeric     NOT NULL,
  ativa       boolean     NOT NULL DEFAULT true,
  ordem       int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================

-- Gera número de pedido automaticamente ao inserir
CREATE OR REPLACE FUNCTION public.fn_gerar_numero_pedido()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
    NEW.numero_pedido := 'PD-' || LPAD(nextval('numero_pedido_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_numero_pedido ON public.pedidos;
CREATE TRIGGER trg_numero_pedido
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.fn_gerar_numero_pedido();

-- Cria perfil automaticamente quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.fn_criar_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, telefone, telefone_formatado)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'telefone', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'telefone_formatado', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_criar_perfil ON auth.users;
CREATE TRIGGER trg_criar_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_criar_perfil();

-- Helper: verifica se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.eh_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND eh_admin = true
  );
$$;

-- Valida um cupom (sem consumir) e retorna o desconto calculado.
-- SECURITY DEFINER pra enxergar cupons inativos/expirados (a policy de
-- SELECT pública só mostra ativo=true) e dar uma mensagem de erro precisa.
CREATE OR REPLACE FUNCTION public.aplicar_cupom(p_codigo text, p_telefone text, p_valor_pedido numeric)
RETURNS TABLE (cupom_id uuid, codigo text, tipo text, valor numeric, desconto numeric, erro text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cupom public.cupons%ROWTYPE;
  v_desconto numeric;
BEGIN
  SELECT * INTO v_cupom FROM public.cupons WHERE lower(public.cupons.codigo) = lower(p_codigo);

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::numeric, 0::numeric, 'Cupom não encontrado';
    RETURN;
  END IF;
  IF NOT v_cupom.ativo THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::numeric, 0::numeric, 'Cupom inativo';
    RETURN;
  END IF;
  IF v_cupom.data_fim IS NOT NULL AND now() > v_cupom.data_fim THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::numeric, 0::numeric, 'Cupom expirado';
    RETURN;
  END IF;
  IF v_cupom.usos_maximos IS NOT NULL AND v_cupom.usos_atuais >= v_cupom.usos_maximos THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::numeric, 0::numeric, 'Cupom esgotado';
    RETURN;
  END IF;
  IF v_cupom.telefone_cliente IS NOT NULL AND v_cupom.telefone_cliente <> COALESCE(p_telefone, '') THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::numeric, 0::numeric, 'Cupom não válido pra esse telefone';
    RETURN;
  END IF;
  IF p_valor_pedido < COALESCE(v_cupom.valor_minimo_pedido, 0) THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, NULL::numeric, 0::numeric, 'Pedido não atinge o valor mínimo do cupom';
    RETURN;
  END IF;

  v_desconto := CASE WHEN v_cupom.tipo = 'percentual' THEN round(p_valor_pedido * v_cupom.valor / 100, 2) ELSE v_cupom.valor END;
  IF v_desconto > p_valor_pedido THEN v_desconto := p_valor_pedido; END IF;

  RETURN QUERY SELECT v_cupom.id, v_cupom.codigo, v_cupom.tipo, v_cupom.valor, v_desconto, NULL::text;
END;
$$;

-- Incrementa o contador de uso do cupom. Só é chamada depois que o pedido
-- foi de fato criado (não no "aplicar", que é só uma prévia).
CREATE OR REPLACE FUNCTION public.consumir_cupom(p_cupom_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cupons SET usos_atuais = usos_atuais + 1 WHERE id = p_cupom_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.aplicar_cupom(text, text, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consumir_cupom(uuid) TO anon, authenticated;

-- Consulta pública usada na tela "Esqueci minha senha" (cliente ainda não está
-- logado, por definição). Não retorna nada além do e-mail já CONFIRMADO —
-- se não devolver linha nenhuma, o telefone não está cadastrado.
CREATE OR REPLACE FUNCTION public.buscar_recuperacao_senha(p_telefone text)
RETURNS TABLE (email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM public.perfis p
  WHERE p.telefone = regexp_replace(p_telefone, '\D', '', 'g')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_recuperacao_senha(text) TO anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.produtos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datas_bloqueadas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas_entrega      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocoes          ENABLE ROW LEVEL SECURITY;

-- promocoes: leitura pública só das ativas; escrita só admin
CREATE POLICY "promocoes_select_public" ON public.promocoes FOR SELECT USING (ativa = true);
CREATE POLICY "promocoes_admin_all"     ON public.promocoes FOR ALL USING (public.eh_admin());

-- produtos: leitura pública, escrita só admin
CREATE POLICY "produtos_select_public"   ON public.produtos FOR SELECT USING (true);
CREATE POLICY "produtos_insert_admin"    ON public.produtos FOR INSERT WITH CHECK (public.eh_admin());
CREATE POLICY "produtos_update_admin"    ON public.produtos FOR UPDATE USING (public.eh_admin());
CREATE POLICY "produtos_delete_admin"    ON public.produtos FOR DELETE USING (public.eh_admin());

-- perfis: cada usuário vê/edita só o próprio; admin vê todos
CREATE POLICY "perfis_select_own"    ON public.perfis FOR SELECT USING (auth.uid() = id OR public.eh_admin());
CREATE POLICY "perfis_insert_own"    ON public.perfis FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "perfis_update_own"    ON public.perfis FOR UPDATE USING (auth.uid() = id OR public.eh_admin());

-- pedidos: usuário logado vê os seus; convidado vê os que ele mesmo criou
--          (usuario_id IS NULL — não há como amarrar a uma sessão anônima
--          específica, então o numero_pedido funciona como "chave" de acesso);
--          admin vê e atualiza todos
CREATE POLICY "pedidos_select_own"   ON public.pedidos FOR SELECT USING (auth.uid() = usuario_id OR usuario_id IS NULL OR public.eh_admin());
CREATE POLICY "pedidos_insert_own"   ON public.pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id OR usuario_id IS NULL);
CREATE POLICY "pedidos_update_admin" ON public.pedidos FOR UPDATE USING (public.eh_admin());

-- cliente (logado ou convidado) pode, só enquanto o pedido está aguardando
-- pagamento, marcar que enviou o comprovante ou cancelar — nada além disso
CREATE POLICY "pedidos_update_pagamento_cliente" ON public.pedidos
  FOR UPDATE
  USING (status = 'aguardando_pagamento' AND (auth.uid() = usuario_id OR usuario_id IS NULL))
  WITH CHECK (status IN ('aguardando_confirmacao_pagamento', 'cancelado'));

-- itens_pedido: segue o pedido pai
CREATE POLICY "itens_select" ON public.itens_pedido FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND (p.usuario_id = auth.uid() OR p.usuario_id IS NULL OR public.eh_admin()))
);
CREATE POLICY "itens_insert" ON public.itens_pedido FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND (p.usuario_id = auth.uid() OR p.usuario_id IS NULL))
);

-- configuracoes: leitura pública, update só admin
CREATE POLICY "config_select_public" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "config_update_admin"  ON public.configuracoes FOR UPDATE USING (public.eh_admin());

-- datas_bloqueadas: leitura pública, escrita só admin
CREATE POLICY "datas_select_public" ON public.datas_bloqueadas FOR SELECT USING (true);
CREATE POLICY "datas_insert_admin"  ON public.datas_bloqueadas FOR INSERT WITH CHECK (public.eh_admin());
CREATE POLICY "datas_update_admin"  ON public.datas_bloqueadas FOR UPDATE USING (public.eh_admin());
CREATE POLICY "datas_delete_admin"  ON public.datas_bloqueadas FOR DELETE USING (public.eh_admin());

-- taxas_entrega: leitura pública, escrita só admin
CREATE POLICY "taxas_select_public" ON public.taxas_entrega FOR SELECT USING (true);
CREATE POLICY "taxas_admin_all"     ON public.taxas_entrega FOR ALL USING (public.eh_admin());

-- cupons: leitura pública só dos ativos (validação de verdade acontece via
-- as funções aplicar_cupom/consumir_cupom, que rodam com SECURITY DEFINER);
-- escrita (criar, editar, desativar, excluir) só admin
CREATE POLICY "cupons_select_public" ON public.cupons FOR SELECT USING (ativo = true);
CREATE POLICY "cupons_admin_all"     ON public.cupons FOR ALL USING (public.eh_admin());

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Configurações padrão (uma linha só, id=1)
INSERT INTO public.configuracoes (id, antecedencia_minima_horas, taxa_entrega_padrao, pedido_minimo, endereco_retirada, horario_funcionamento)
VALUES (
  1,
  48,
  5.00,
  30.00,
  '{"rua": "Consultar no WhatsApp", "bairro": "Santos", "cidade": "Santos", "uf": "SP"}'::jsonb,
  '{"dias": [1,2,3,4,5,6], "abre": "09:00", "fecha": "18:00"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Produtos baseados no cardápio atual
INSERT INTO public.produtos (nome, descricao, preco, categoria, imagem_url, ativo, mais_vendido, ordem) VALUES
('Tradicional',       'O brigadeiro clássico de sempre, com granulado de chocolate',     4.50,  'gourmet', '/images/prod-tradicional.jpg',   true, false, 1),
('Beijinho',          'Coco com leite condensado, docinho de carinho',                   4.50,  'gourmet', '/images/prod-beijinho.jpg',       true, false, 2),
('Paçoca',            'Amendoim torrado moído em textura crocante',                      5.00,  'gourmet', '/images/prod-pacoca.jpg',         true, false, 3),
('Maracujá',          'Acidez tropical equilibrando o doce do chocolate',                5.00,  'gourmet', '/images/prod-maracuja.jpg',       true, false, 4),
('Romeu e Julieta',   'Goiabada e queijo, combinação clássica brasileira',               5.50,  'gourmet', '/images/prod-romeu-julieta.jpg',  true, false, 5),
('Leite Ninho',       'Cremoso, coberto com leite em pó',                                5.00,  'gourmet',      '/images/prod-leite-ninho.jpg',    true, true,  6),
('Churros',           'Canela e doce de leite, irresistível',                            5.50,  'gourmet',      '/images/prod-churros.jpg',        true, false, 7),
('Ferrero',           'Chocolate intenso com avelã, inspirado no clássico',              6.00,  'gourmet',      '/images/prod-ferrero.jpg',        true, false, 8),
('Pistache',          'Sabor sofisticado direto da Itália',                              6.50,  'gourmet',      '/images/prod-pistache.jpg',       true, true,  9),
('Caixa 12 unidades', 'Sortimento de sabores tradicionais e gourmet',                   48.00,  'caixas',       '/images/caixa-12.jpg',            true, false, 10),
('Caixa 24 unidades', 'Ideal para festas e comemorações',                               89.00,  'caixas',       '/images/caixa-24.jpg',            true, false, 11),
('Caixa 50 unidades', 'Para grandes celebrações',                                      175.00,  'caixas',       '/images/caixa-50.jpg',            true, false, 12)
ON CONFLICT DO NOTHING;

-- Taxas de entrega — só bairros de Santos (NÃO cadastrar São Vicente/Guarujá aqui)
INSERT INTO public.taxas_entrega (bairro, taxa, ordem) VALUES
  ('Gonzaga', 5.00, 1),
  ('José Menino', 5.00, 2),
  ('Pompeia', 5.00, 3),
  ('Aparecida', 6.00, 4),
  ('Embaré', 6.00, 5),
  ('Boqueirão', 6.00, 6),
  ('Vila Belmiro', 6.00, 7),
  ('Ponta da Praia', 8.00, 8),
  ('Marapé', 7.00, 9),
  ('Estuário', 7.00, 10),
  ('Encruzilhada', 7.00, 11),
  ('Campo Grande', 8.00, 12),
  ('Macuco', 8.00, 13),
  ('Vila Mathias', 7.00, 14),
  ('Centro Histórico', 8.00, 15)
ON CONFLICT (bairro) DO NOTHING;

-- Cupons de exemplo
INSERT INTO public.cupons (codigo, tipo, valor, descricao, valor_minimo_pedido) VALUES
  ('BEMVINDA10', 'percentual', 10, 'Cupom de boas-vindas - 10% off', 30),
  ('BRIGA20', 'fixo', 20, 'R$ 20 off em compras acima de R$ 100', 100)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- APÓS RODAR: tornar a Ale admin
-- Substitua pelo telefone real (só números, ex: 13912345678)
-- ============================================================
-- UPDATE public.perfis SET eh_admin = true WHERE telefone = '13912345678';

-- ============================================================
-- MIGRAÇÃO (projetos já existentes, criados antes de pedidos
-- referenciar perfis): troca a FK de pedidos.usuario_id de
-- auth.users para public.perfis, permitindo o embed
-- `pedidos?select=*,perfis(nome)` no PostgREST.
-- ============================================================
-- ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_usuario_id_fkey;
-- ALTER TABLE public.pedidos
--   ADD CONSTRAINT pedidos_usuario_id_fkey
--   FOREIGN KEY (usuario_id) REFERENCES public.perfis(id);

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): simplificação do MVP —
-- só Pix, sem sinal parcial, sem valor mínimo de pedido.
-- ============================================================
-- UPDATE public.pedidos SET forma_pagamento = 'pix'
--   WHERE forma_pagamento IN ('pix_entrega', 'pix_antecipado', 'debito', 'credito', 'dinheiro', 'cartao');
-- ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS data_expiracao_pagamento timestamptz;
-- ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS comprovante_enviado boolean NOT NULL DEFAULT false;
-- ALTER TABLE public.pedidos DROP COLUMN IF EXISTS valor_sinal;
-- ALTER TABLE public.pedidos DROP COLUMN IF EXISTS valor_restante;
-- ALTER TABLE public.pedidos DROP COLUMN IF EXISTS troco_para;
-- ALTER TABLE public.configuracoes DROP COLUMN IF EXISTS valor_minimo_sinal;
-- ALTER TABLE public.configuracoes DROP COLUMN IF EXISTS percentual_sinal;
-- UPDATE public.configuracoes SET pedido_minimo = 0;

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): banner com formato
-- flexível — permite escolher entre cortar a imagem (cover) ou
-- mostrar ela inteira sem cortar (contain), por foto.
-- ============================================================
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS banner_ajuste text NOT NULL DEFAULT 'cover';

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): troca o prefixo do número
-- do pedido de "DA-" pra "PD-". Só afeta pedidos NOVOS —
-- pedidos já existentes mantêm "DA-XXXX" (não renomeamos os
-- antigos pra não quebrar links de /pagamento/DA-XXXX já
-- enviados a clientes pelo WhatsApp).
-- ============================================================
-- CREATE OR REPLACE FUNCTION public.fn_gerar_numero_pedido()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
--     NEW.numero_pedido := 'PD-' || LPAD(nextval('numero_pedido_seq')::text, 4, '0');
--   END IF;
--   RETURN NEW;
-- END;
-- $$;

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): permite ao admin EDITAR
-- o motivo de um dia bloqueado (tela "Agenda / Dias bloqueados"),
-- sem precisar excluir e recriar o registro.
-- ============================================================
-- CREATE POLICY "datas_update_admin" ON public.datas_bloqueadas FOR UPDATE USING (public.eh_admin());

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): recuperação de senha
-- automática por e-mail (sem depender do WhatsApp manual da Ale).
-- ============================================================
-- ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS email text;
--
-- CREATE OR REPLACE FUNCTION public.buscar_recuperacao_senha(p_telefone text)
-- RETURNS TABLE (email text)
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT p.email
--   FROM public.perfis p
--   WHERE p.telefone = regexp_replace(p_telefone, '\D', '', 'g')
--   LIMIT 1;
-- $$;
--
-- GRANT EXECUTE ON FUNCTION public.buscar_recuperacao_senha(text) TO anon, authenticated;

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): remove o campo do Mercado
-- Pago (nunca usado de verdade) e ativa frete grátis em Santos
-- (taxas_entrega continua no banco, é só reativar frete_ativo
-- quando quiser voltar a cobrar por bairro).
-- ============================================================
-- ALTER TABLE public.configuracoes DROP COLUMN IF EXISTS mp_access_token;
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS frete_ativo boolean NOT NULL DEFAULT false;

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): tabela de promoções, usadas
-- na "mini tela" que abre ao clicar em "Promoções" no menu do site
-- e gerenciadas pelo admin na nova aba "Promoções".
-- ============================================================
-- CREATE TABLE IF NOT EXISTS public.promocoes (
--   id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
--   titulo             text        NOT NULL,
--   descricao          text,
--   produto_id         uuid        REFERENCES public.produtos(id) ON DELETE SET NULL,
--   quantidade         int         NOT NULL DEFAULT 1,
--   preco_promocional  numeric,
--   ativa              boolean     NOT NULL DEFAULT true,
--   ordem              int         NOT NULL DEFAULT 0,
--   created_at         timestamptz NOT NULL DEFAULT now()
-- );
-- ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "promocoes_select_public" ON public.promocoes FOR SELECT USING (ativa = true);
-- CREATE POLICY "promocoes_admin_all"     ON public.promocoes FOR ALL USING (public.eh_admin());
--
-- -- Se a tabela já existia (sem a coluna "quantidade"):
-- ALTER TABLE public.promocoes ADD COLUMN IF NOT EXISTS quantidade int NOT NULL DEFAULT 1;

-- ============================================================
-- MIGRAÇÃO (projetos já existentes): notificação de pedido novo
-- por e-mail via EmailJS (som/notificação do navegador não
-- precisam de banco, são só no código).
-- ============================================================
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS notif_email_ativo boolean NOT NULL DEFAULT false;
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS notif_email_destino text;
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS emailjs_service_id text;
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS emailjs_template_id text;
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS emailjs_public_key text;
--
-- Notificação de pedido novo por WhatsApp (CallMeBot):
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS notif_whatsapp_ativo boolean NOT NULL DEFAULT false;
-- ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS notif_whatsapp_numero text;
-- ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS notificacao_whatsapp_enviada_em timestamptz;
