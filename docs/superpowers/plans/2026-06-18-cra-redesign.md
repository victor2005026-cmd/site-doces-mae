# Doces da Ale — Migração CRA + Redesign de Vendas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recriar o site "Doces da Ale" em Create React App (mesma estrutura de pastas/ferramentas do projeto `gramasp`), removendo o tom institucional ("Nossa História", "Como Funciona") em favor de um site de vendas, com botão de WhatsApp limpo (sem estrela), logo do brigadeiro consistente, e um fundo de Hero novo (pó de cacau caindo).

**Architecture:** SPA estática com `react-scripts` (CRA). Tailwind CSS é mantido (não reescrito em CSS puro) para preservar o visual atual com o mínimo de retrabalho. Todos os componentes de `components/*.jsx` são portados para `src/components/*.jsx`, trocando `next/image` por `<img>` nativo e imports `@/...` por imports relativos. `app/page.jsx` se torna `src/App.js`. Metadados de SEO/OG/JSON-LD que viviam em `app/layout.jsx` passam a ser tags estáticas em `public/index.html`.

**Tech Stack:** React 18.3.1, react-scripts 5.0.1, Tailwind CSS 3.4, PostCSS, autoprefixer.

## Global Constraints

- Manter Tailwind CSS — não reescrever classes em CSS puro (decisão confirmada com o usuário, ver spec).
- Não alterar o copy/conteúdo de Cardápio, Galeria, Depoimentos, FAQ ou CTA Final — só a camada técnica (next/image → img, imports).
- Remover a seção "Sobre" ("Nossa História") por completo — não portar `Sobre.jsx`.
- Remover os links de menu "Sobre" e "Como Funciona"; manter apenas Início, Cardápio, Depoimentos, Contato.
- O botão flutuante de WhatsApp não pode ter nenhum elemento decorativo extra (sem estrela/sparkle) — só o ícone oficial do WhatsApp em círculo verde.
- A logo em todo o site é o `BrigadeiroIcon` (SVG existente) + texto "Doces da Ale" — mesmo padrão já usado no Navbar atual.
- Imagem de fundo do Hero vem de `https://images.unsplash.com/photo-1512223792601-592a9809eed4` (licença Unsplash, uso comercial livre), baixada e salva localmente em `public/images/hero-brigadeiros.jpg` — não usar hotlink.
- Sem testes automatizados de UI pixel-a-pixel (site estático de marketing): a verificação é `npm run build` sem erros + 1 smoke test de render (`App.test.js`) + checklist manual de revisão visual no Task final.
- Commits frequentes, um por task, seguindo o padrão de mensagens já usado no projeto (mensagens curtas em português, imperativo).

---

### Task 1: Inicializar git e congelar o estado atual do projeto Next.js

**Files:**
- Create: `.git/` (via `git init`)
- Modify: nenhum arquivo de código

**Interfaces:** N/A (task de infraestrutura).

- [ ] **Step 1: Inicializar o repositório git**

```bash
cd /c/Users/victo/site-doces-mae
git init
```

- [ ] **Step 2: Conferir o que será versionado**

```bash
git status
```

Expected: lista `app/`, `components/`, `lib/`, `public/`, `*.config.js`, `package.json`, `docs/` etc. como untracked (não deve listar `node_modules/`, `.next/`, `build/` — já cobertos pelo `.gitignore` existente).

- [ ] **Step 3: Commit do baseline Next.js**

```bash
git add -A
git commit -m "chore: snapshot do projeto Next.js antes da migração para CRA"
```

- [ ] **Step 4: Confirmar o commit**

```bash
git log --oneline
```

Expected: 1 commit listado.

---

### Task 2: Scaffold do projeto CRA (estrutura de pastas, build config)

**Files:**
- Create: `package.json` (sobrescreve o atual)
- Create: `postcss.config.js` (mesmo conteúdo, mantido)
- Create: `tailwind.config.js` (sobrescreve, `content` apontando para `src/`)
- Create: `public/index.html`
- Create: `public/manifest.json`
- Create: `public/robots.txt`
- Create: `src/index.js`
- Create: `src/index.css`

**Interfaces:**
- Produces: `src/index.css` exporta as variáveis CSS `--bg-main`, `--text-primary`, `--gold` etc. e as classes utilitárias `.container-site`, `.container-site--narrow`, `.skip-link`, `.gold-line`, `.img-fallback` que todos os componentes das próximas tasks vão usar via `className`.
- Produces: `public/index.html` injeta as fontes Google (Playfair Display, Lato, Great Vibes) globalmente — componentes não precisam importar fontes.

- [ ] **Step 1: Sobrescrever `package.json`**

```json
{
  "name": "doces-da-ale",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^13.5.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.10",
    "tailwindcss": "^3.4.15"
  }
}
```

- [ ] **Step 2: Manter `postcss.config.js` (sem alteração de conteúdo)**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Sobrescrever `tailwind.config.js` (mesmo design tokens, `content` para `src/`)**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#FDF8F0',
        'bg-secondary': '#F5EDE3',
        'text-primary': '#3C2415',
        'text-secondary': '#6B4F3A',
        gold: {
          DEFAULT: '#C9A96E',
          dark: '#B08A52',
        },
        rose: '#D4A5A5',
      },
      fontFamily: {
        title: ['"Playfair Display"', 'serif'],
        body: ['Lato', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      boxShadow: {
        sm: '0 2px 10px rgba(60, 36, 21, 0.08)',
        DEFAULT: '0 2px 10px rgba(60, 36, 21, 0.08)',
        md: '0 10px 30px rgba(60, 36, 21, 0.12)',
        lg: '0 20px 50px rgba(60, 36, 21, 0.18)',
      },
      borderRadius: {
        site: '18px',
      },
      maxWidth: {
        site: '1240px',
        'site-narrow': '760px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollHint: {
          '0%': { opacity: '1', top: '8px' },
          '100%': { opacity: '0', top: '24px' },
        },
        waPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(201, 169, 110, 0.55)' },
          '70%': { boxShadow: '0 0 0 18px rgba(201, 169, 110, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(201, 169, 110, 0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.9s ease forwards',
        scrollHint: 'scrollHint 1.8s infinite',
        waPulse: 'waPulse 2.4s infinite',
      },
    },
  },
  plugins: [],
};
```

Nota: `fontFamily` deixou de referenciar variáveis CSS de `next/font` (`var(--font-playfair)` etc.) e passou a usar os nomes das fontes direto, já que essas fontes agora são carregadas via `<link>` do Google Fonts no `public/index.html` (Step 5).

- [ ] **Step 4: Criar `public/manifest.json`**

```json
{
  "short_name": "Doces da Ale",
  "name": "Doces da Ale - Brigadeiros Gourmet e Doces Finos Artesanais",
  "icons": [
    { "src": "favicon.ico", "sizes": "32x32", "type": "image/x-icon" },
    { "src": "logo192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "logo512.png", "type": "image/png", "sizes": "512x512" }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3C2415",
  "background_color": "#FDF8F0"
}
```

- [ ] **Step 5: Criar `public/index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3C2415" />
    <meta
      name="description"
      content="Brigadeiros gourmet, doces finos e bolos personalizados feitos à mão em Santos/SP. Encomende pelo WhatsApp e transforme seu momento especial em uma lembrança inesquecível."
    />
    <meta
      name="keywords"
      content="brigadeiros gourmet Santos, doces finos artesanais, confeitaria Santos SP, doces personalizados, trufas artesanais, kits de doces para presentear"
    />
    <link rel="canonical" href="https://www.docesdaale.com.br/" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Doces da Ale | Brigadeiros Gourmet e Doces Finos Artesanais" />
    <meta
      property="og:description"
      content="Doces feitos com amor para transformar momentos em lembranças inesquecíveis. Encomende pelo WhatsApp em Santos e região."
    />
    <meta property="og:image" content="%PUBLIC_URL%/images/logo-icon.png" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:url" content="https://www.docesdaale.com.br/" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
      href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet"
    />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Bakery",
        "name": "Doces da Ale",
        "image": "https://www.docesdaale.com.br/images/logo-icon.png",
        "description": "Brigadeiros gourmet, doces finos e bolos personalizados artesanais em Santos/SP.",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Santos",
          "addressRegion": "SP",
          "addressCountry": "BR"
        },
        "telephone": "+5513999999999",
        "priceRange": "R$4,50 - R$150",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "09:00",
          "closes": "18:00"
        },
        "sameAs": ["https://www.instagram.com/docesdaale"]
      }
    </script>
    <title>Doces da Ale | Brigadeiros Gourmet e Doces Finos Artesanais em Santos/SP</title>
  </head>
  <body>
    <noscript>Você precisa habilitar o JavaScript para rodar este site.</noscript>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 6: Criar `public/robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 7: Criar `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Cores */
  --bg-main: #fdf8f0;
  --bg-secondary: #f5ede3;
  --text-primary: #3c2415;
  --text-secondary: #6b4f3a;
  --gold: #c9a96e;
  --gold-dark: #b08a52;
  --accent-rose: #d4a5a5;
  --white: #ffffff;

  /* Sombras */
  --shadow-sm: 0 2px 10px rgba(60, 36, 21, 0.08);
  --shadow-md: 0 10px 30px rgba(60, 36, 21, 0.12);
  --shadow-lg: 0 20px 50px rgba(60, 36, 21, 0.18);

  /* Espaçamento */
  --section-padding: clamp(60px, 10vw, 120px);
  --radius: 18px;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg-main);
  color: var(--text-primary);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  font-family: 'Lato', sans-serif;
}

@layer components {
  .container-site {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .container-site--narrow {
    max-width: 760px;
  }

  .skip-link {
    position: absolute;
    left: -999px;
    top: 0;
    background: var(--gold);
    color: var(--text-primary);
    padding: 10px 18px;
    z-index: 2000;
  }
  .skip-link:focus {
    left: 0;
  }

  .gold-line {
    width: 70px;
    height: 3px;
    background: var(--gold);
    margin: 18px 0 28px;
    border-radius: 2px;
  }

  /* Imagem com fallback (quando foto real ainda não foi adicionada) */
  .img-fallback {
    position: relative;
    background: linear-gradient(145deg, var(--bg-secondary), var(--gold));
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img-fallback img {
    display: none;
  }
  .img-fallback::after {
    content: attr(data-placeholder);
    font-size: 3rem;
    opacity: 0.75;
  }
}

/* Respeita preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

Nota: foi adicionado `font-family: 'Lato', sans-serif;` no `body` (Task 2 substitui o que antes era `font-body` aplicado via `className="font-body"` no `<body>` do `layout.jsx` do Next.js — em CRA não há esse `<body className>`, então a fonte padrão do body é fixada aqui).

- [ ] **Step 8: Criar `src/index.js`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Criar um `src/App.js` temporário (será substituído na Task 10) só para validar o scaffold**

```jsx
export default function App() {
  return <h1>Doces da Ale</h1>;
}
```

- [ ] **Step 10: Instalar dependências**

```bash
npm install
```

Expected: termina sem erro, cria `node_modules/` e `package-lock.json`.

- [ ] **Step 11: Validar build e dev server**

```bash
npm run build
```

Expected: `Compiled successfully` e pasta `build/` criada.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json postcss.config.js tailwind.config.js public/index.html public/manifest.json public/robots.txt src/index.js src/index.css src/App.js
git commit -m "chore: scaffold do projeto CRA (package.json, tailwind, index.html, manifest)"
```

---

### Task 3: Migrar utilitários e átomos compartilhados

**Files:**
- Create: `src/lib/whatsapp.js`
- Create: `src/components/icons/BrigadeiroIcon.jsx`
- Create: `src/components/Button.jsx`
- Create: `src/components/FadeIn.jsx`
- Create: `src/components/ImageWithFallback.jsx`

**Interfaces:**
- Produces: `waLink(message?: string): string` em `src/lib/whatsapp.js` — usado por Navbar, MobileSidebar, Hero, Cardapio, ComoFunciona, CtaFinal, Footer, WhatsappFloat.
- Produces: `<BrigadeiroIcon className?: string />` em `src/components/icons/BrigadeiroIcon.jsx` — usado por Navbar e Footer.
- Produces: `<Button href, variant?, size?, pulse?, className?, ...rest>` em `src/components/Button.jsx` — usado por Navbar, Hero, Cardapio, ComoFunciona (removido), CtaFinal.
- Produces: `<FadeIn as?, className?, ...rest>` em `src/components/FadeIn.jsx` — usado por Sobre (removido), Cardapio, Galeria, Depoimentos, Faq, CtaFinal, ComoFunciona.
- Produces: `<ImageWithFallback src, alt, placeholder?, fill?, width?, height?, className?, wrapperClassName? />` em `src/components/ImageWithFallback.jsx` — usado por Cardapio e Galeria para imagens locais.

- [ ] **Step 1: Criar `src/lib/whatsapp.js`**

```js
// TODO: substituir pelo número real do WhatsApp da loja (com DDI 55 + DDD + número)
export const WHATSAPP_NUMBER = '5513999999999';

export function waLink(message = 'Olá! Gostaria de mais informações sobre os doces.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Criar `src/components/icons/BrigadeiroIcon.jsx`**

```jsx
export default function BrigadeiroIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-hidden="true">
      <rect width="200" height="200" fill="#F8DCE0" />

      <circle cx="100" cy="100" r="58" fill="#4A2C18" />

      <g stroke="#C9A96E" strokeWidth="4" strokeLinecap="round">
        <line x1="78" y1="62" x2="86" y2="70" />
        <line x1="110" y1="56" x2="116" y2="65" />
        <line x1="138" y1="78" x2="146" y2="85" />
        <line x1="146" y1="112" x2="155" y2="116" />
        <line x1="128" y1="138" x2="134" y2="147" />
        <line x1="96" y1="146" x2="100" y2="156" />
        <line x1="64" y1="130" x2="56" y2="137" />
        <line x1="52" y1="100" x2="42" y2="102" />
        <line x1="58" y1="72" x2="50" y2="78" />
        <line x1="100" y1="90" x2="106" y2="98" />
        <line x1="118" y1="108" x2="124" y2="115" />
        <line x1="82" y1="112" x2="76" y2="119" />
      </g>

      <ellipse cx="82" cy="80" rx="16" ry="10" fill="#FFFFFF" opacity="0.18" />
    </svg>
  );
}
```

- [ ] **Step 3: Criar `src/components/Button.jsx`**

```jsx
const VARIANTS = {
  gold: 'bg-gold text-text-primary shadow-sm hover:bg-gold-dark hover:-translate-y-[3px] hover:shadow-md',
  'gold-outline':
    'block mt-[18px] bg-transparent border-2 border-gold text-text-primary px-6 py-3 hover:bg-gold hover:-translate-y-[2px]',
  outline: 'border-2 border-white text-white bg-transparent hover:bg-white/15 hover:-translate-y-[3px]',
};

export default function Button({
  href = '#',
  variant = 'gold',
  size,
  pulse = false,
  className = '',
  children,
  ...rest
}) {
  const sizeClasses = size === 'lg' ? 'px-[42px] py-[18px] text-[1.05rem]' : 'px-[30px] py-[14px] text-[0.95rem]';

  return (
    <a
      href={href}
      className={`inline-block rounded-full text-center font-bold tracking-[0.3px] transition-all duration-250 ease-in-out ${sizeClasses} ${VARIANTS[variant]} ${
        pulse ? 'animate-waPulse' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 4: Criar `src/components/FadeIn.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react';

export default function FadeIn({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 5: Criar `src/components/ImageWithFallback.jsx`**

```jsx
import { useState } from 'react';

export default function ImageWithFallback({
  src,
  alt,
  placeholder = '🍫',
  fill,
  width,
  height,
  className = '',
  wrapperClassName = '',
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`img-fallback ${wrapperClassName}`}
        data-placeholder={placeholder}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading="lazy"
        className={`${fill ? 'absolute inset-0 h-full w-full' : ''} ${className}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
```

- [ ] **Step 6: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully` (esses arquivos ainda não são importados por nada, então o build deve passar igual à Task 2).

- [ ] **Step 7: Commit**

```bash
git add src/lib src/components/icons src/components/Button.jsx src/components/FadeIn.jsx src/components/ImageWithFallback.jsx
git commit -m "feat: migrar utilitarios e atomos compartilhados para CRA"
```

---

### Task 4: Migrar Navbar e MobileSidebar (menu enxuto)

**Files:**
- Create: `src/components/Navbar.jsx`
- Create: `src/components/MobileSidebar.jsx`

**Interfaces:**
- Consumes: `BrigadeiroIcon` (`./icons/BrigadeiroIcon`), `Button` (`./Button`), `waLink` (`../lib/whatsapp`) — todos de Task 3.
- Produces: `<Navbar />` sem props — usado por `App.js` na Task 10.
- Produces: `<MobileSidebar isOpen: boolean, onClose: () => void, links: {href: string, label: string}[] />` — usado só pelo próprio `Navbar.jsx`.

- [ ] **Step 1: Criar `src/components/MobileSidebar.jsx`**

```jsx
import { waLink } from '../lib/whatsapp';

export default function MobileSidebar({ isOpen, onClose, links }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[1100] bg-[rgba(60,36,21,0.55)] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="mobile-sidebar"
        aria-label="Menu mobile"
        className={`fixed top-0 right-0 h-full w-[min(320px,80vw)] bg-bg-main z-[1200] px-8 pt-20 pb-8 shadow-lg transition-transform duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute top-6 right-6 text-[2rem] leading-none text-text-primary"
        >
          &times;
        </button>
        <nav className="flex flex-col gap-[26px]" aria-label="Navegação mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="font-title text-[1.2rem] font-semibold text-text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener"
            onClick={onClose}
            className="inline-block rounded-full bg-gold px-[30px] py-[14px] text-center text-[0.95rem] font-bold tracking-[0.3px] text-text-primary shadow-sm transition-all hover:-translate-y-[3px] hover:bg-gold-dark hover:shadow-md"
          >
            Encomendar
          </a>
        </nav>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Criar `src/components/Navbar.jsx` com menu reduzido (sem "Sobre" e "Como Funciona")**

```jsx
import { useEffect, useState } from 'react';
import BrigadeiroIcon from './icons/BrigadeiroIcon';
import MobileSidebar from './MobileSidebar';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

const NAV_LINKS = [
  { href: '#hero', label: 'Início' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#contato', label: 'Contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
  }, [sidebarOpen]);

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          scrolled ? 'bg-[rgba(253,248,240,0.85)] backdrop-blur-md shadow-sm py-[10px]' : 'py-4'
        }`}
      >
        <div className="max-w-site mx-auto flex items-center justify-between gap-5 px-6">
          <a
            href="#hero"
            className="flex items-center gap-2.5 transition-colors duration-300"
            aria-label="Doces da Ale - Início"
          >
            <span className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-full shadow-sm">
              <BrigadeiroIcon className="h-full w-full" />
            </span>
            <span
              className={`font-script text-[1.9rem] leading-none transition-colors duration-300 ${
                scrolled ? 'text-gold-dark' : 'text-white'
              }`}
            >
              Doces da Ale
            </span>
          </a>

          <nav className="hidden min-[992px]:flex items-center gap-5" aria-label="Navegação principal">
            {NAV_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center gap-5">
                <a
                  href={link.href}
                  className={`group relative py-1.5 text-[0.95rem] font-bold transition-colors duration-300 hover:text-gold ${
                    scrolled ? 'text-text-secondary' : 'text-white'
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </a>
                {index < NAV_LINKS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`h-4 w-px ${scrolled ? 'bg-text-secondary/30' : 'bg-white/40'}`}
                  />
                )}
              </span>
            ))}
          </nav>

          <Button
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener"
            className="hidden min-[992px]:inline-block whitespace-nowrap"
          >
            Encomendar
          </Button>

          <button
            id="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            className="flex min-[992px]:hidden h-6 w-[30px] flex-col justify-center gap-1.5"
          >
            <span className={`block h-[2px] w-full transition-colors duration-300 ${scrolled ? 'bg-text-primary' : 'bg-white'}`} />
            <span className={`block h-[2px] w-full transition-colors duration-300 ${scrolled ? 'bg-text-primary' : 'bg-white'}`} />
            <span className={`block h-[2px] w-full transition-colors duration-300 ${scrolled ? 'bg-text-primary' : 'bg-white'}`} />
          </button>
        </div>
      </header>

      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} links={NAV_LINKS} />
    </>
  );
}
```

- [ ] **Step 3: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.jsx src/components/MobileSidebar.jsx
git commit -m "feat: migrar Navbar e MobileSidebar com menu enxuto (sem Sobre/Como Funciona)"
```

---

### Task 5: Baixar a imagem de fundo do Hero e migrar `Hero.jsx`

**Files:**
- Create: `public/images/hero-brigadeiros.jpg`
- Create: `src/components/Hero.jsx`

**Interfaces:**
- Consumes: `Button` (`./Button`), `waLink` (`../lib/whatsapp`).
- Produces: `<Hero />` sem props — usado por `App.js` na Task 10. Contém `<h1>Doces da Ale</h1>`, usado pelo smoke test da Task 10.

- [ ] **Step 1: Baixar a imagem de fundo**

```bash
curl -sL -o public/images/hero-brigadeiros.jpg "https://images.unsplash.com/photo-1512223792601-592a9809eed4?fm=jpg&q=80&w=1920&auto=format&fit=crop"
```

- [ ] **Step 2: Confirmar o arquivo**

```bash
file public/images/hero-brigadeiros.jpg
```

Expected: `JPEG image data` com largura em torno de 1920px.

- [ ] **Step 3: Criar `src/components/Hero.jsx`**

```jsx
import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src="/images/hero-brigadeiros.jpg"
        alt="Pó de cacau caindo sobre doces artesanais da Doces da Ale"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(20,12,8,0.8)] via-[rgba(20,12,8,0.55)] via-50% to-[rgba(20,12,8,0.88)]" />

      <div className="relative z-[2] max-w-[800px] px-6 text-center text-white">
        <p
          className="mb-4 text-[0.8rem] font-bold uppercase tracking-[3px] text-gold opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.1s' }}
        >
          Confeitaria Artesanal &middot; Santos/SP
        </p>
        <h1
          className="mb-[18px] font-title text-[clamp(2.8rem,8vw,5.5rem)] [text-shadow:0_4px_24px_rgba(0,0,0,0.35)] opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.25s' }}
        >
          Doces da Ale
        </h1>
        <p
          className="mx-auto mb-3 max-w-[640px] font-title text-[clamp(1.2rem,2.6vw,1.7rem)] italic opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.4s' }}
        >
          Doces feitos com amor para transformar momentos em lembranças inesquecíveis
        </p>
        <p
          className="mb-9 text-[1.05rem] text-[#F0E4D3] opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.55s' }}
        >
          Brigadeiros gourmet e doces finos artesanais em Santos e região
        </p>
        <div
          className="flex flex-wrap justify-center gap-[18px] opacity-0 animate-fadeUp max-[600px]:flex-col max-[600px]:w-full"
          style={{ animationDelay: '0.7s' }}
        >
          <Button
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener"
            size="lg"
            className="max-[600px]:w-full"
          >
            Fazer Encomenda pelo WhatsApp
          </Button>
          <Button href="#cardapio" variant="outline" size="lg" className="max-[600px]:w-full">
            Ver Cardápio
          </Button>
        </div>
      </div>

      <a
        href="#cardapio"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-8 left-1/2 z-[2] h-[42px] w-[26px] -translate-x-1/2 rounded-2xl border-2 border-white/70"
      >
        <span className="absolute left-1/2 top-2 h-[5px] w-[5px] -ml-[2.5px] animate-scrollHint rounded-full bg-gold" />
      </a>
    </section>
  );
}
```

Nota: o link da setinha de scroll mudou de `#sobre` para `#cardapio`, porque a seção "Sobre" foi removida e o Cardápio passa a ser a próxima seção depois do Hero.

- [ ] **Step 4: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add public/images/hero-brigadeiros.jpg src/components/Hero.jsx
git commit -m "feat: adicionar imagem de fundo do Hero e migrar componente"
```

---

### Task 6: Migrar Cardápio e Galeria

**Files:**
- Create: `src/components/Cardapio.jsx`
- Create: `src/components/Galeria.jsx`

**Interfaces:**
- Consumes: `FadeIn` (`./FadeIn`), `ImageWithFallback` (`./ImageWithFallback`), `Button` (`./Button`), `waLink` (`../lib/whatsapp`).
- Produces: `<Cardapio />`, `<Galeria />` sem props — usados por `App.js` na Task 10.

- [ ] **Step 1: Criar `src/components/Cardapio.jsx`**

```jsx
import FadeIn from './FadeIn';
import ImageWithFallback from './ImageWithFallback';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

const ITEMS = [
  {
    title: 'Brigadeiros Gourmet',
    description: 'Receita exclusiva em mais de 15 sabores irresistíveis',
    price: 'A partir de R$ 4,50/un',
    image: '/images/brigadeiro-3.jpg',
    placeholder: '🍬',
    alt: 'Brigadeiros gourmet decorados à mão em diversos sabores',
    local: true,
    waMessage: 'Olá! Tenho interesse nos Brigadeiros Gourmet',
  },
  {
    title: 'Doces Finos',
    description: 'Sofisticação e sabor para eventos inesquecíveis',
    price: 'A partir de R$ 5,00/un',
    image: '/images/brigadeiro-2.jpg',
    placeholder: '🍮',
    alt: 'Doces finos artesanais decorados para eventos especiais',
    local: true,
    waMessage: 'Olá! Tenho interesse nos Doces Finos',
  },
  {
    title: 'Bolos Personalizados',
    description: 'Feitos sob medida para seu momento especial',
    price: 'Sob consulta',
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=600&q=80',
    alt: 'Bolo personalizado decorado para festas',
    local: false,
    waMessage: 'Olá! Tenho interesse em Bolos Personalizados',
  },
  {
    title: 'Copos da Felicidade',
    description: 'Camadas de sabor em cada colherada',
    price: 'A partir de R$ 15,00',
    image: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?auto=format&fit=crop&w=600&q=80',
    alt: 'Copo da felicidade em camadas de sabores',
    local: false,
    waMessage: 'Olá! Tenho interesse nos Copos da Felicidade',
  },
  {
    title: 'Trufas Artesanais',
    description: 'Puro chocolate em formato de presente',
    price: 'A partir de R$ 6,00/un',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    alt: 'Trufas artesanais de chocolate fino',
    local: false,
    waMessage: 'Olá! Tenho interesse nas Trufas Artesanais',
  },
  {
    title: 'Kits para Presentear',
    description: 'Surpreenda quem você ama com doçura',
    price: 'A partir de R$ 49,90',
    image: '/images/brigadeiro-1.jpg',
    placeholder: '🎁',
    alt: 'Kit de doces decorados para presentear em caixa especial',
    local: true,
    waMessage: 'Olá! Tenho interesse nos Kits para Presentear',
  },
];

export default function Cardapio() {
  return (
    <section id="cardapio" className="bg-bg-secondary py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary mb-3.5">
          Nossos Doces
        </FadeIn>
        <FadeIn as="p" className="mb-14 text-center text-[1.1rem] text-text-secondary">
          Cada sabor é uma experiência única
        </FadeIn>

        <div className="grid grid-cols-1 gap-9 min-[601px]:grid-cols-2 min-[992px]:grid-cols-3">
          {ITEMS.map((item) => (
            <FadeIn
              key={item.title}
              as="article"
              className="group overflow-hidden rounded-site bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                {item.local ? (
                  <ImageWithFallback
                    src={item.image}
                    alt={item.alt}
                    fill
                    placeholder={item.placeholder}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    wrapperClassName="h-full w-full"
                  />
                ) : (
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                )}
              </div>
              <div className="px-[26px] pb-[30px] pt-[26px]">
                <h3 className="mb-2 text-[1.3rem]">{item.title}</h3>
                <p className="mb-3.5 text-[0.95rem] text-text-secondary">{item.description}</p>
                <span className="block text-[1rem] font-bold text-gold-dark">{item.price}</span>
                <Button
                  href={waLink(item.waMessage)}
                  target="_blank"
                  rel="noopener"
                  variant="gold-outline"
                >
                  Quero esse!
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Criar `src/components/Galeria.jsx`**

```jsx
import { useEffect, useState } from 'react';
import FadeIn from './FadeIn';
import ImageWithFallback from './ImageWithFallback';

const ITEMS = [
  {
    src: '/images/brigadeiro-1.jpg',
    full: '/images/brigadeiro-1.jpg',
    alt: 'Kit de doces brancos decorados com desenhos dourados',
    caption: 'Kit especial de presente',
    placeholder: '🍫',
    local: true,
    tall: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=900&q=80',
    alt: 'Bandeja de doces artesanais finos',
    caption: 'Confeitaria artesanal',
    local: false,
    tall: false,
  },
  {
    src: '/images/brigadeiro-2.jpg',
    full: '/images/brigadeiro-2.jpg',
    alt: 'Doces finos em formatos temáticos decorados à mão',
    caption: 'Doces temáticos personalizados',
    placeholder: '🌽',
    local: true,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=600&q=90',
    alt: 'Sobremesa gourmet com chocolate',
    caption: 'Sobremesa gourmet',
    local: false,
    tall: true,
  },
  {
    src: '/images/brigadeiro-3.jpg',
    full: '/images/brigadeiro-3.jpg',
    alt: 'Brigadeiros decorados com tema esportivo em azul e dourado',
    caption: 'Brigadeiros temáticos',
    placeholder: '⚽',
    local: true,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=90',
    alt: 'Close de chocolate artesanal sendo preparado',
    caption: 'Chocolate artesanal',
    local: false,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1599629954294-14df9ec8bc05?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1599629954294-14df9ec8bc05?auto=format&fit=crop&w=600&q=90',
    alt: 'Trufas finas de chocolate em exposição',
    caption: 'Trufas finas',
    local: false,
    tall: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=90',
    alt: 'Variedade de doces artesanais finos',
    caption: 'Doces variados',
    local: false,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?auto=format&fit=crop&w=600&q=90',
    alt: 'Fatia de doce especial decorada',
    caption: 'Fatia especial',
    local: false,
    tall: false,
  },
];

export default function Galeria() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selected]);

  return (
    <section id="galeria" className="bg-bg-main py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="mb-3.5 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">
          Momentos Doces
        </FadeIn>
        <FadeIn as="p" className="mb-14 text-center text-[1.1rem] text-text-secondary">
          Um pouco do nosso carinho em cada detalhe
        </FadeIn>

        <div className="grid grid-cols-2 auto-rows-[160px] gap-[18px] min-[601px]:auto-rows-[200px] min-[992px]:grid-cols-4">
          {ITEMS.map((item) => (
            <FadeIn key={item.alt} className={item.tall ? 'row-span-2' : ''}>
              <button
                onClick={() => setSelected(item)}
                className="group relative block h-full w-full overflow-hidden rounded-2xl"
              >
                {item.local ? (
                  <ImageWithFallback
                    src={item.src}
                    alt={item.alt}
                    fill
                    placeholder={item.placeholder}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    wrapperClassName="h-full w-full"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-[rgba(60,36,21,0)] text-[1.8rem] text-white opacity-0 transition-opacity duration-300 group-hover:bg-[rgba(60,36,21,0.4)] group-hover:opacity-100">
                  ✦
                </span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(20,12,7,0.92)] p-6 transition-opacity duration-300 ${
          selected ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <button
          onClick={() => setSelected(null)}
          aria-label="Fechar imagem"
          className="absolute right-8 top-6 text-[2.4rem] leading-none text-white"
        >
          &times;
        </button>
        {selected && (
          <figure>
            <img
              src={selected.full}
              alt={selected.alt}
              className="max-h-[85vh] max-w-[min(900px,92vw)] rounded-[10px] shadow-lg"
            />
            <figcaption className="mt-3.5 text-center font-title italic text-white">
              {selected.caption}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Cardapio.jsx src/components/Galeria.jsx
git commit -m "feat: migrar Cardapio e Galeria para CRA"
```

---

### Task 7: Migrar Depoimentos e FAQ

**Files:**
- Create: `src/components/Depoimentos.jsx`
- Create: `src/components/Faq.jsx`

**Interfaces:**
- Consumes: `FadeIn` (`./FadeIn`).
- Produces: `<Depoimentos />`, `<Faq />` sem props — usados por `App.js` na Task 10.

- [ ] **Step 1: Criar `src/components/Depoimentos.jsx`**

```jsx
import FadeIn from './FadeIn';

const TESTIMONIALS = [
  {
    name: 'Camila R.',
    avatar: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=120&q=80',
    text: 'Os brigadeiros da Ale salvaram o aniversário da minha filha! Chegaram lindos, embalados com tanto carinho, e o sabor é simplesmente surreal. Já virei cliente fiel.',
  },
  {
    name: 'Rodrigo M.',
    avatar: 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=120&q=80',
    text: 'Encomendei um kit para presentear minha esposa e o resultado foi além do que eu esperava. Atendimento rápido pelo WhatsApp e entrega no horário certinho.',
  },
  {
    name: 'Fernanda S.',
    avatar: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=120&q=80',
    text: 'Doces finos impecáveis para o casamento da minha irmã. Todos os convidados elogiaram, e o cuidado na decoração de cada docinho fez toda a diferença.',
  },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="bg-bg-secondary py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="mb-14 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">
          O que dizem nossos clientes
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 min-[992px]:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <FadeIn
              key={t.name}
              as="article"
              className="rounded-site bg-white px-7 py-9 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md"
            >
              <div className="relative mx-auto mb-4 h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-gold">
                <img
                  src={t.avatar}
                  alt={`Foto de ${t.name}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="mb-3.5 tracking-[2px] text-gold" aria-label="Avaliação 5 de 5 estrelas">
                ★★★★★
              </div>
              <p className="mb-4 italic text-text-secondary">&ldquo;{t.text}&rdquo;</p>
              <p className="font-bold text-text-primary">{t.name}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Criar `src/components/Faq.jsx`**

```jsx
import { useRef, useState } from 'react';
import FadeIn from './FadeIn';

const FAQS = [
  {
    question: 'Qual o prazo mínimo para encomendas?',
    answer: 'Recomendamos pelo menos 3 dias de antecedência para garantir a qualidade e frescor dos doces.',
  },
  {
    question: 'Vocês fazem entrega?',
    answer: 'Sim! Entregamos em Santos e região. Consulte a taxa pelo WhatsApp.',
  },
  {
    question: 'Posso personalizar os doces?',
    answer: 'Com certeza! Fazemos doces personalizados para festas, casamentos, aniversários e eventos corporativos.',
  },
  {
    question: 'Quais formas de pagamento?',
    answer: 'Aceitamos Pix, cartão e dinheiro.',
  },
  {
    question: 'Os doces contêm glúten/lactose?',
    answer: 'Alguns produtos contêm. Consulte opções especiais pelo WhatsApp.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const panelRefs = useRef([]);

  return (
    <section id="faq" className="bg-bg-secondary py-[clamp(60px,10vw,120px)]">
      <div className="container-site container-site--narrow">
        <FadeIn as="h2" className="mb-14 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">
          Perguntas Frequentes
        </FadeIn>

        <div>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <FadeIn key={faq.question} className="mb-3.5 overflow-hidden rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-[26px] py-5 text-left font-title text-[1.05rem] font-semibold text-text-primary"
                >
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className={`ml-4 flex-shrink-0 text-[1.4rem] text-gold-dark transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  ref={(el) => (panelRefs.current[index] = el)}
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? `${panelRefs.current[index]?.scrollHeight ?? 0}px` : '0px' }}
                >
                  <p className="px-[26px] pb-[22px] text-text-secondary">{faq.answer}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Depoimentos.jsx src/components/Faq.jsx
git commit -m "feat: migrar Depoimentos e FAQ para CRA"
```

---

### Task 8: Criar ComoFunciona compacto e migrar CtaFinal

**Files:**
- Create: `src/components/ComoFunciona.jsx`
- Create: `src/components/CtaFinal.jsx`

**Interfaces:**
- Consumes: `FadeIn` (`./FadeIn`), `Button` (`./Button`), `waLink` (`../lib/whatsapp`).
- Produces: `<ComoFunciona />`, `<CtaFinal />` sem props — usados por `App.js` na Task 10.

- [ ] **Step 1: Criar `src/components/ComoFunciona.jsx` (versão enxuta, sem título grande nem CTA duplicado)**

```jsx
import FadeIn from './FadeIn';

const STEPS = [
  { icon: '🍫', title: 'Escolha seus doces', text: 'Veja o cardápio e escolha seus favoritos' },
  { icon: '📱', title: 'Fale no WhatsApp', text: 'Envie seu pedido de forma rápida e simples' },
  { icon: '🎁', title: 'Receba ou retire', text: 'Entrega em Santos e região, ou retirada no local' },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-bg-main py-12">
      <div className="container-site">
        <FadeIn as="h2" className="mb-8 text-center font-title text-[clamp(1.5rem,3vw,2rem)] text-text-primary">
          Pedir é simples
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 min-[992px]:grid-cols-3">
          {STEPS.map((step) => (
            <FadeIn
              key={step.title}
              className="flex items-center gap-4 min-[992px]:flex-col min-[992px]:text-center"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-gold bg-white text-[1.5rem] shadow-sm">
                <span aria-hidden="true">{step.icon}</span>
              </div>
              <div>
                <h3 className="text-[1.05rem]">{step.title}</h3>
                <p className="text-[0.9rem] text-text-secondary">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Criar `src/components/CtaFinal.jsx`**

```jsx
import FadeIn from './FadeIn';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function CtaFinal() {
  return (
    <section
      id="contato"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-[clamp(60px,10vw,120px)] text-center"
    >
      <img
        src="https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=1920&q=80"
        alt="Doces artesanais finos da Doces da Ale"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(60,36,21,0.88)] to-[rgba(176,138,82,0.55)]" />

      <FadeIn className="relative z-[2] max-w-[720px] px-6 text-white">
        <h2 className="mb-[18px] text-[clamp(1.8rem,4vw,2.6rem)]">
          Seu próximo momento especial merece um doce inesquecível
        </h2>
        <p className="mb-8 text-[1.1rem] text-[#F0E4D3]">Faça sua encomenda agora e surpreenda quem você ama</p>
        <Button
          href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
          target="_blank"
          rel="noopener"
          size="lg"
          pulse
        >
          Encomendar pelo WhatsApp
        </Button>
      </FadeIn>
    </section>
  );
}
```

- [ ] **Step 3: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ComoFunciona.jsx src/components/CtaFinal.jsx
git commit -m "feat: criar ComoFunciona compacto e migrar CtaFinal"
```

---

### Task 9: Migrar Footer (logo corrigida) e redesenhar WhatsappFloat (sem estrela)

**Files:**
- Create: `src/components/Footer.jsx`
- Create: `src/components/WhatsappFloat.jsx`

**Interfaces:**
- Consumes: `BrigadeiroIcon` (`./icons/BrigadeiroIcon`), `waLink` (`../lib/whatsapp`).
- Produces: `<Footer />`, `<WhatsappFloat />` sem props — usados por `App.js` na Task 10.

- [ ] **Step 1: Criar `src/components/Footer.jsx` (logo trocada de `/images/logo.jpg`, que não existe, para o `BrigadeiroIcon`)**

```jsx
import BrigadeiroIcon from './icons/BrigadeiroIcon';
import { waLink } from '../lib/whatsapp';

export default function Footer() {
  return (
    <footer className="bg-text-primary pt-[70px] text-[#E8D9C5]">
      <div className="container-site grid grid-cols-1 gap-8 border-b border-white/10 pb-[50px] min-[601px]:grid-cols-2 min-[992px]:grid-cols-[1.4fr_1fr_1fr_1fr] min-[992px]:gap-10">
        <div className="flex flex-col items-start gap-2.5">
          <span className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-gold">
            <BrigadeiroIcon className="h-full w-full" />
          </span>
          <span className="font-title text-[1.3rem] text-white">Doces da Ale</span>
          <p className="font-script text-[1.3rem] text-gold">Doces artesanais feitos com amor</p>
        </div>

        <div>
          <h4 className="mb-3.5 text-[1rem] tracking-[0.5px] text-white">Contato</h4>
          <a
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale')}
            target="_blank"
            rel="noopener"
            className="mb-2 block text-[0.95rem] text-[#C9B79F] hover:text-gold"
          >
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/docesdaale"
            target="_blank"
            rel="noopener"
            className="mb-2 block text-[0.95rem] text-[#C9B79F] hover:text-gold"
          >
            Instagram @docesdaale
          </a>
        </div>

        <div>
          <h4 className="mb-3.5 text-[1rem] tracking-[0.5px] text-white">Localização</h4>
          <p className="mb-2 text-[0.95rem] text-[#C9B79F]">Santos, SP</p>
          <p className="mb-2 text-[0.95rem] text-[#C9B79F]">Atendemos toda a região da Baixada Santista</p>
        </div>

        <div>
          <h4 className="mb-3.5 text-[1rem] tracking-[0.5px] text-white">Horário</h4>
          <p className="mb-2 text-[0.95rem] text-[#C9B79F]">Seg a Sáb, 9h às 18h</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-site flex-wrap justify-between gap-2.5 px-6 py-6 text-[0.85rem] text-[#B09D85]">
        <p>&copy; 2026 Doces da Ale. Todos os direitos reservados.</p>
        <p>Feito com 🤎</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Criar `src/components/WhatsappFloat.jsx` sem a estrela decorativa**

```jsx
import { waLink } from '../lib/whatsapp';

export default function WhatsappFloat() {
  return (
    <a
      href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-[26px] right-[26px] z-[999] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#25D366] shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
    >
      <svg viewBox="0 0 448 512" width="32" height="32" aria-hidden="true" focusable="false">
        <path
          fill="#fff"
          d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.2 10.3 77.5 29.8 111L0 480l117.7-30.9c32.1 17.5 68.2 26.8 105.1 26.8h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-66.1-156.8zM223.9 438.3h0c-32.8 0-65-8.8-92.9-25.5l-6.7-4-69.8 18.3 18.6-68-4.3-7C50.1 320.3 41 274.6 41 226.1 41 124.6 123.6 42 224 42c48.7 0 94.4 19 128.7 53.4 34.3 34.4 53.2 80.1 53.2 128.7 0 101.5-84.5 184.2-182 184.2zm101.6-138c-5.6-2.8-33-16.3-38.1-18.1-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18.1-17.5 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.9-9.7-1.9-2.8-12.6-30.3-17.3-41.5-4.6-11-9.3-9.5-12.8-9.7-3.3-.2-7.1-.2-10.9-.2-3.7 0-9.8 1.4-15 6.9-5.1 5.6-19.6 19.2-19.6 46.6 0 27.5 20 54 22.8 57.7 2.8 3.7 38.7 59.1 95.8 80.5 47.5 17.9 57.2 14.4 67.6 13.4 10.4-1 33-13.6 37.7-26.7 4.7-13.1 4.7-24.4 3.3-26.7-1.4-2.3-5.1-3.7-10.7-6.5z"
        />
      </svg>
    </a>
  );
}
```

- [ ] **Step 3: Build de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.jsx src/components/WhatsappFloat.jsx
git commit -m "fix: corrigir logo do Footer e remover estrela do botao de WhatsApp"
```

---

### Task 10: Montar `App.js` final, smoke test e gerar ícones/favicon a partir da logo

**Files:**
- Modify: `src/App.js` (substitui o placeholder da Task 2)
- Create: `src/App.test.js`
- Create: `public/favicon.ico`
- Create: `public/logo192.png`
- Create: `public/logo512.png`

**Interfaces:**
- Consumes: todos os componentes das Tasks 3–9 (`Navbar`, `Hero`, `Cardapio`, `Galeria`, `Depoimentos`, `ComoFunciona`, `Faq`, `CtaFinal`, `Footer`, `WhatsappFloat`).
- Produces: `<App />` — ponto de entrada renderizado por `src/index.js` (Task 2).

- [ ] **Step 1: Sobrescrever `src/App.js`**

```jsx
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Cardapio from './components/Cardapio';
import Galeria from './components/Galeria';
import Depoimentos from './components/Depoimentos';
import ComoFunciona from './components/ComoFunciona';
import Faq from './components/Faq';
import CtaFinal from './components/CtaFinal';
import Footer from './components/Footer';
import WhatsappFloat from './components/WhatsappFloat';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <Cardapio />
        <Galeria />
        <Depoimentos />
        <ComoFunciona />
        <Faq />
        <CtaFinal />
      </main>

      <Footer />
      <WhatsappFloat />
    </>
  );
}
```

- [ ] **Step 2: Escrever o smoke test em `src/App.test.js`**

```jsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza o titulo principal do Hero', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /doces da ale/i, level: 1 });
  expect(heading).toBeInTheDocument();
});

test('nao renderiza mais a secao Sobre/Nossa Historia', () => {
  render(<App />);
  expect(screen.queryByText(/nossa história/i)).not.toBeInTheDocument();
});

test('botao do whatsapp flutuante nao tem svg de estrela decorativa', () => {
  render(<App />);
  const waLink = screen.getByLabelText(/falar no whatsapp/i);
  const svgs = waLink.querySelectorAll('svg');
  expect(svgs).toHaveLength(1);
});
```

- [ ] **Step 3: Rodar os testes**

```bash
CI=true npx react-scripts test --watchAll=false
```

Expected: `Tests: 3 passed, 3 total`.

- [ ] **Step 4: Gerar `favicon.ico`, `logo192.png` e `logo512.png` a partir de `public/images/logo-icon.png`**

```bash
npm install --no-save sharp
node -e "
const sharp = require('sharp');
Promise.all([
  sharp('public/images/logo-icon.png').resize(512, 512).png().toFile('public/logo512.png'),
  sharp('public/images/logo-icon.png').resize(192, 192).png().toFile('public/logo192.png'),
  sharp('public/images/logo-icon.png').resize(32, 32).png().toFile('public/favicon.ico'),
]).then(() => console.log('icones gerados')).catch((e) => { console.error(e); process.exit(1); });
"
```

Expected: imprime `icones gerados`. Note que `favicon.ico` é, na prática, um PNG 32x32 com extensão `.ico` — todos os browsers modernos servem isso normalmente via `<link rel="icon">` (detecção por conteúdo), e isso evita depender de uma ferramenta de conversão para o formato ICO real, que não está disponível neste ambiente.

- [ ] **Step 5: Confirmar os arquivos gerados**

```bash
file public/favicon.ico public/logo192.png public/logo512.png
```

Expected: três `PNG image data` com 32x32, 192x192 e 512x512 respectivamente.

- [ ] **Step 6: Build final de sanidade**

```bash
npm run build
```

Expected: `Compiled successfully`.

- [ ] **Step 7: Commit**

```bash
git add src/App.js src/App.test.js public/favicon.ico public/logo192.png public/logo512.png
git commit -m "feat: montar App final, smoke tests e gerar favicon/icones a partir da logo"
```

---

### Task 11: Remover arquivos antigos do Next.js e verificação manual final

**Files:**
- Delete: `app/` (inteira)
- Delete: `next.config.mjs`
- Delete: `jsconfig.json`
- Delete: `components/` (pasta antiga na raiz, incluindo `Sobre.jsx`)
- Delete: `lib/` (pasta antiga na raiz)

**Interfaces:** N/A (limpeza, sem código novo).

- [ ] **Step 1: Remover os arquivos e pastas do Next.js**

```bash
git rm -r app next.config.mjs jsconfig.json components lib
```

- [ ] **Step 2: Confirmar que nada mais referencia `next` no projeto**

```bash
grep -r "next/" src/ package.json || echo "nenhuma referencia a next/ encontrada"
```

Expected: `nenhuma referencia a next/ encontrada`.

- [ ] **Step 3: Reinstalar do zero para garantir que o `node_modules` não tem resíduo do `next` ou do `sharp` de teste**

```bash
rm -rf node_modules
npm install
```

Expected: termina sem erro; `package.json` final só lista `react`, `react-dom`, `react-scripts` como dependencies.

- [ ] **Step 4: Build final**

```bash
npm run build
```

Expected: `Compiled successfully`, pasta `build/` atualizada.

- [ ] **Step 5: Rodar o site localmente e revisar visualmente**

```bash
npm start
```

Abrir `http://localhost:3000` no navegador e confirmar manualmente:
- Hero exibe a imagem de fundo nova (pó caindo, fundo escuro) — não está quebrada/sem imagem.
- Menu do Navbar mostra só Início, Cardápio, Depoimentos, Contato (sem "Sobre" nem "Como Funciona").
- Rolando a página, não existe nenhuma seção "Nossa História".
- Existe uma faixa compacta "Pedir é simples" com 3 passos, sem ocupar a tela toda.
- O botão flutuante de WhatsApp (canto inferior direito) é só o círculo verde com o ícone do WhatsApp — sem nenhuma estrela/sparkle no canto.
- Logo no Navbar e no Footer é o ícone do brigadeiro + "Doces da Ale".
- A aba do navegador mostra o favicon do brigadeiro.
- Testar em largura mobile (DevTools, ~375px): menu hambúrguer abre a sidebar, botão de WhatsApp continua visível e clicável.
- Clicar no botão "Fazer Encomenda pelo WhatsApp" e em "Quero esse!" de qualquer item do Cardápio abre `https://wa.me/...` corretamente.

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "chore: remover arquivos do Next.js apos migracao completa para CRA"
```

---

## Self-Review (executado durante a escrita do plano)

- **Cobertura do spec:** estrutura CRA (Tasks 1–2, 11), conteúdo sem história/como funciona (Tasks 4, 8, 11), botão de WhatsApp sem estrela (Task 9), logo do brigadeiro consistente (Tasks 4, 9, 10), imagem de fundo do Hero (Task 5) — todos os itens do spec têm uma task correspondente.
- **Placeholders:** nenhum "TBD"/"implementar depois" — única exceção intencional é o comentário `// TODO: substituir pelo número real do WhatsApp` em `whatsapp.js`, que já existia no código original e não foi pedido para ser resolvido agora (número real da loja não foi fornecido).
- **Consistência de tipos/nomes:** `waLink(message?)`, `BrigadeiroIcon({ className })`, `Button({ href, variant, size, pulse, className, ...rest })`, `FadeIn({ as, className, ...rest })`, `ImageWithFallback({ src, alt, placeholder, fill, width, height, className, wrapperClassName })` são usados de forma idêntica em todas as tasks que os consomem.
