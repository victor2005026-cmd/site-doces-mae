-- ============================================================
-- DOCES DA ALE — Schema Supabase
-- Rode este arquivo no SQL Editor do painel Supabase:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- Sequência para número de pedido (ex: DA-1042)
CREATE SEQUENCE IF NOT EXISTS numero_pedido_seq START WITH 1000;

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.produtos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  descricao     text,
  preco         numeric     NOT NULL,
  categoria     text        NOT NULL,   -- tradicionais | gourmet | caixas | personalizados
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
  eh_admin            boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pedidos (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido           text        UNIQUE NOT NULL DEFAULT '',
  usuario_id              uuid        REFERENCES auth.users,
  dados_convidado         jsonb,       -- {nome, telefone, email} se guest
  origem                  text        NOT NULL DEFAULT 'site', -- site|whatsapp|instagram|manual
  status                  text        NOT NULL DEFAULT 'recebido',
  -- recebido|confirmado|preparando|pronto|saiu_entrega|entregue|cancelado
  tipo_entrega            text        NOT NULL, -- entrega|retirada
  endereco_entrega        jsonb,
  data_agendada           date        NOT NULL,
  periodo_agendado        text,        -- manha|tarde|noite
  horario_especifico      time,
  forma_pagamento         text        NOT NULL, -- pix|dinheiro|cartao
  troco_para              numeric,
  observacoes             text,
  subtotal                numeric     NOT NULL,
  taxa_entrega            numeric     NOT NULL DEFAULT 0,
  total                   numeric     NOT NULL,
  link_pagamento          text,
  pago                    boolean     NOT NULL DEFAULT false,
  pago_em                 timestamptz,
  id_pagamento_externo    text,
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
  taxa_entrega_padrao         numeric NOT NULL DEFAULT 5.00,
  pedido_minimo               numeric NOT NULL DEFAULT 30.00,
  endereco_retirada           jsonb,
  horario_funcionamento       jsonb,
  mp_access_token             text    -- Mercado Pago (preencher no admin)
);

CREATE TABLE IF NOT EXISTS public.datas_bloqueadas (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date        UNIQUE NOT NULL,
  motivo      text,
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
    NEW.numero_pedido := 'DA-' || LPAD(nextval('numero_pedido_seq')::text, 4, '0');
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.produtos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datas_bloqueadas   ENABLE ROW LEVEL SECURITY;

-- produtos: leitura pública, escrita só admin
CREATE POLICY "produtos_select_public"   ON public.produtos FOR SELECT USING (true);
CREATE POLICY "produtos_insert_admin"    ON public.produtos FOR INSERT WITH CHECK (public.eh_admin());
CREATE POLICY "produtos_update_admin"    ON public.produtos FOR UPDATE USING (public.eh_admin());
CREATE POLICY "produtos_delete_admin"    ON public.produtos FOR DELETE USING (public.eh_admin());

-- perfis: cada usuário vê/edita só o próprio; admin vê todos
CREATE POLICY "perfis_select_own"    ON public.perfis FOR SELECT USING (auth.uid() = id OR public.eh_admin());
CREATE POLICY "perfis_insert_own"    ON public.perfis FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "perfis_update_own"    ON public.perfis FOR UPDATE USING (auth.uid() = id OR public.eh_admin());

-- pedidos: usuário logado vê/insere os seus; convidado insere via service role;
--          admin vê e atualiza todos
CREATE POLICY "pedidos_select_own"   ON public.pedidos FOR SELECT USING (auth.uid() = usuario_id OR public.eh_admin());
CREATE POLICY "pedidos_insert_own"   ON public.pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id OR usuario_id IS NULL);
CREATE POLICY "pedidos_update_admin" ON public.pedidos FOR UPDATE USING (public.eh_admin());

-- itens_pedido: segue o pedido pai
CREATE POLICY "itens_select" ON public.itens_pedido FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id = pedido_id AND (p.usuario_id = auth.uid() OR public.eh_admin()))
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
CREATE POLICY "datas_delete_admin"  ON public.datas_bloqueadas FOR DELETE USING (public.eh_admin());

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
('Tradicional',       'O brigadeiro clássico de sempre, com granulado de chocolate',     4.50,  'tradicionais', '/images/prod-tradicional.jpg',   true, false, 1),
('Beijinho',          'Coco com leite condensado, docinho de carinho',                   4.50,  'tradicionais', '/images/prod-beijinho.jpg',       true, false, 2),
('Paçoca',            'Amendoim torrado moído em textura crocante',                      5.00,  'tradicionais', '/images/prod-pacoca.jpg',         true, false, 3),
('Maracujá',          'Acidez tropical equilibrando o doce do chocolate',                5.00,  'tradicionais', '/images/prod-maracuja.jpg',       true, false, 4),
('Romeu e Julieta',   'Goiabada e queijo, combinação clássica brasileira',               5.50,  'tradicionais', '/images/prod-romeu-julieta.jpg',  true, false, 5),
('Leite Ninho',       'Cremoso, coberto com leite em pó',                                5.00,  'gourmet',      '/images/prod-leite-ninho.jpg',    true, true,  6),
('Churros',           'Canela e doce de leite, irresistível',                            5.50,  'gourmet',      '/images/prod-churros.jpg',        true, false, 7),
('Ferrero',           'Chocolate intenso com avelã, inspirado no clássico',              6.00,  'gourmet',      '/images/prod-ferrero.jpg',        true, false, 8),
('Pistache',          'Sabor sofisticado direto da Itália',                              6.50,  'gourmet',      '/images/prod-pistache.jpg',       true, true,  9),
('Caixa 12 unidades', 'Sortimento de sabores tradicionais e gourmet',                   48.00,  'caixas',       '/images/caixa-12.jpg',            true, false, 10),
('Caixa 24 unidades', 'Ideal para festas e comemorações',                               89.00,  'caixas',       '/images/caixa-24.jpg',            true, false, 11),
('Caixa 50 unidades', 'Para grandes celebrações',                                      175.00,  'caixas',       '/images/caixa-50.jpg',            true, false, 12)
ON CONFLICT DO NOTHING;

-- ============================================================
-- APÓS RODAR: tornar a Ale admin
-- Substitua pelo telefone real (só números, ex: 13912345678)
-- ============================================================
-- UPDATE public.perfis SET eh_admin = true WHERE telefone = '13912345678';
