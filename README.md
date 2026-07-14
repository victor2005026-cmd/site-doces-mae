# Doces da Ale — Site + Admin

Cardápio digital com checkout completo, painel administrativo e integração Supabase.

## Como rodar localmente

```bash
npm install
npm start
```

Acesse `http://localhost:3000`.

---

## Configuração inicial (uma vez só)

### 1. Rodar o banco de dados no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) → seu projeto
2. Vá em **SQL Editor → New Query**
3. Cole o conteúdo do arquivo `schema.sql` e execute
4. Pronto — tabelas, triggers e dados iniciais criados

### 2. Criar a conta de admin (Ale)

1. Acesse o site → clique em **Entrar** no header
2. Crie uma conta com o telefone e senha que você quiser usar como admin
3. No Supabase, vá em **SQL Editor** e rode:

```sql
UPDATE public.perfis
SET eh_admin = true
WHERE telefone = '13912345678';  -- substitua pelo seu telefone real (só números)
```

Agora ao entrar em `/admin` com essa conta, o painel admin aparece.

### 3. (Opcional) Configurar o Mercado Pago

1. Acesse `/admin` → aba **Config.**
2. Cole seu **Access Token** do Mercado Pago (começa com `APP_USR-` para produção)
3. Para gerar o token: [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)

---

## Páginas do site

| URL | O que é |
|-----|---------|
| `/` | Cardápio digital |
| `/checkout` | Fluxo de pedido (5 etapas) |
| `/pedido/:id` | Confirmação e acompanhamento do pedido |
| `/meus-pedidos` | Histórico de pedidos (login necessário) |
| `/admin` | Painel administrativo |

---

## Painel Admin (`/admin`)

| Aba | Função |
|-----|--------|
| Dashboard | Stats do dia, faturamento, próximos pedidos |
| Pedidos | Lista, filtra, avança status, cria manual |
| Produtos | CRUD completo, ativar/desativar |
| Horário | Dias e horários de funcionamento |
| Imagens | Trocar fotos do banner e produtos |
| Config. | Taxa de entrega, antecedência, Mercado Pago |

### Fluxo de status dos pedidos

```
recebido → confirmado → preparando → pronto → saiu_entrega → entregue
                                                            ↘ cancelado
```

---

## Arquivos importantes

```
schema.sql              # SQL completo para rodar no Supabase
.env.local              # Credenciais (não commitar — já está no .gitignore)
src/lib/supabase.js     # Cliente Supabase
src/context/AuthContext.jsx     # Auth (telefone + senha)
src/pages/CheckoutPage.jsx      # Checkout 5 etapas
src/admin/AdminOrdersTab.jsx    # Gestão de pedidos
```

---

## O que fica para depois (Fase 3)

| Funcionalidade | Por quê fica para depois |
|---------------|--------------------------|
| Pagamento automático via Mercado Pago | Precisa de um servidor para receber o webhook de confirmação de pagamento |
| Notificações automáticas de WhatsApp | Requer WhatsApp Business API (paga) |
| Realtime de status para o cliente | O código já está preparado — basta testar em produção |
| Upload de imagens para Supabase Storage | Implementar no AdminProductList |

---

## Variáveis de ambiente

O arquivo `.env.local` já está configurado com as credenciais do projeto.
**Nunca commite este arquivo** — ele já está no `.gitignore`.
