# Doces da Ale — Migração para CRA + Redesign de Vendas

Data: 2026-06-18

## Contexto

O site "Doces da Ale" está hoje em Next.js (App Router) com Tailwind CSS. O dono
quer recriar o projeto usando Create React App (CRA), na mesma estrutura de pastas
e ferramentas do projeto de referência `gramasp` (`public/index.html`, `src/App.js`,
`src/index.js`, `react-scripts`). Além da migração de stack, o site precisa parar de
parecer institucional ("nossa história", "como funciona") e focar em vender doces:
catálogo, promoções, opções de produtos e conversão via WhatsApp.

Outros dois problemas pontuais: o botão flutuante de WhatsApp tem uma estrelinha
decorativa que precisa sair, e falta a imagem de fundo do Hero (`hero-brigadeiros.webp`
nunca foi adicionada ao projeto — o `<Image>` está apontando para um arquivo
inexistente).

## Arquitetura

**Stack:** CRA (`react-scripts`) + React 18 + Tailwind CSS (mantido).
Tailwind é mantido porque já cobre 100% da estilização atual; reescrever tudo em CSS
puro (como o `gramasp`) custaria retrabalho alto sem ganho visual ou funcional —
decisão confirmada com o usuário.

**Estrutura de pastas (espelhando o `gramasp`):**

```
site-doces-mae/
├── public/
│   ├── index.html        # head com SEO, OG, JSON-LD, Google Fonts (link tags), favicon
│   ├── manifest.json
│   ├── favicon.ico, logo192.png, logo512.png   # gerados a partir do logo-icon.png (brigadeiro)
│   └── images/           # mesmas imagens locais hoje em public/images
├── src/
│   ├── index.js           # ReactDOM.createRoot + <App />
│   ├── index.css          # @tailwind base/components/utilities + :root vars (vindo de app/globals.css)
│   ├── App.js              # composição das seções (substitui app/page.jsx)
│   ├── App.test.js          # smoke test simples (renderiza <App /> sem erro), igual ao gramasp
│   ├── lib/whatsapp.js
│   └── components/
│       ├── icons/BrigadeiroIcon.jsx
│       ├── Navbar.jsx, MobileSidebar.jsx, Hero.jsx, Cardapio.jsx, Galeria.jsx,
│       │   Depoimentos.jsx, ComoFunciona.jsx (compacto), Faq.jsx, CtaFinal.jsx,
│       │   Footer.jsx, WhatsappFloat.jsx, Button.jsx, FadeIn.jsx, ImageWithFallback.jsx
├── package.json            # react-scripts, tailwindcss, postcss, autoprefixer
└── tailwind.config.js       # content: ['./src/**/*.{js,jsx}']
```

Removidos: `app/`, `next.config.mjs`, dependência `next`, `jsconfig.json` com alias
`@/*` (CRA não tem path alias por padrão sem customização extra — imports passam a
ser relativos, ex.: `../lib/whatsapp`).

**Substituições técnicas pontuais:**
- `next/image` (`<Image fill .../>`) → `<img>` simples com classes Tailwind
  (`absolute inset-0 h-full w-full object-cover`) fazendo o papel do `fill`.
- `next/font/google` → tags `<link rel="preconnect">` + `<link rel="stylesheet">`
  para Google Fonts (Playfair Display, Lato, Great Vibes) no `public/index.html`,
  e `font-family` mapeada direto no `tailwind.config.js` (sem variáveis CSS de fonte).
- Metadados de `app/layout.jsx` (title, description, OG, JSON-LD do schema.org tipo
  `Bakery`) → hardcoded como tags estáticas em `public/index.html` (site de uma
  página só, não perde nada migrando para estático).
- `'use client'` directives removidas (não existem em CRA).

## Conteúdo e estrutura de seções

Página final, em ordem:

1. **Navbar** — logo (ícone brigadeiro + "Doces da Ale"), links: Início, Cardápio,
   Depoimentos, Contato. Remove links "Sobre" e "Como Funciona".
2. **Hero** — nova imagem de fundo (pó caindo sobre brigadeiros), headline e CTAs
   (sem mudança de copy).
3. **Cardápio** — catálogo de produtos (sem alteração de conteúdo, já é a seção
   mais "venda" do site).
4. **Galeria** — mantida como está.
5. **Depoimentos** — mantida como está.
6. **Como Funciona (compacto)** — reduzido de seção cheia (título grande + textos)
   para uma faixa enxuta de 3 passos com ícones, menos respiro vertical, sem entrada
   no menu principal — funciona como reforço rápido antes do FAQ, não como destino.
7. **Sobre/"Nossa História"** — **removida** (arquivo `Sobre.jsx` apagado e import
   tirado do `App.js`).
8. **FAQ** — mantido (responde dúvidas de compra, não é institucional).
9. **CTA Final** — mantido.
10. **Footer** — corrige logo quebrada (`logo.jpg` que não existe) para usar o
    `BrigadeiroIcon` + texto, igual ao Navbar.
11. **WhatsApp flutuante** — redesenhado (ver abaixo).

## WhatsApp flutuante

Remove o `<svg>` da estrelinha (linhas 12–21 do `WhatsappFloat.jsx` atual) e o
`absolute -top-1.5 -left-1.5` associado. Mantém: círculo verde (`#25D366`), 58px,
ícone oficial do WhatsApp centralizado, posição `fixed bottom-6 right-6`, hover com
leve scale. Resultado: botão limpo, redondo, sem elementos decorativos extras.

## Logo

Usa o `BrigadeiroIcon.jsx` (SVG do brigadeiro, já existente) como marca, igual ao
padrão já aplicado no Navbar hoje (ícone + wordmark manuscrito "Doces da Ale").
Aplica o mesmo padrão no Footer. Favicon e ícones do `manifest.json`
(`favicon.ico`, `logo192.png`, `logo512.png`) são gerados a partir do
`public/images/logo-icon.png` existente (mesma arte do brigadeiro, fundo rosa).
Se o usuário enviar um arquivo de logo definitivo depois, a troca é isolada
(só os arquivos de imagem/ícone, sem tocar em componentes).

## Imagem de fundo do Hero

Imagem escolhida (Unsplash, licença gratuita, uso comercial sem atribuição
obrigatória): peneira despejando pó de cacau caindo sobre um doce, fundo escuro
dramático — composição muito próxima da referência enviada pelo usuário.

URL de origem: `https://images.unsplash.com/photo-1512223792601-592a9809eed4`

Baixar em alta resolução (`w=1920&q=80`) e salvar em
`public/images/hero-brigadeiros.jpg`. Apontar o `<img>` do `Hero.jsx` para esse
arquivo local (não hotlink).

## Testes / verificação

Sem testes automatizados de UI (site estático de marketing). Verificação manual:
1. `npm run build` sem erros depois da migração.
2. `npm start` e checar visualmente: Hero com imagem de fundo, navbar sem links
   removidos, seção de história ausente, Como Funciona compacto, botão de
   WhatsApp sem estrela, logo correta em Navbar/Footer/aba do navegador.
3. Conferir responsividade mobile (sidebar) e que os links de WhatsApp continuam
   funcionando.

## Fora de escopo (não pedido, não fazer)

- Trocar Tailwind por CSS puro.
- Adicionar backend/Supabase (gramasp tem, mas não foi pedido aqui).
- Mudar o copy/conteúdo do Cardápio, Galeria, Depoimentos, FAQ ou CTA Final.
- Configurar deploy/CI (fica para depois, se pedido).
