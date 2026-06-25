# Lerian Hub

Protótipo navegável da **Opção A** para o portal unificado da Lerian: um **shell fino compartilhado + SSO + apps independentes**.

A ideia central: em vez de um monólito que troca telas via `<div>`, cada app é um **deploy separado no seu próprio subdomínio**. O único elo entre eles é uma barra-shell compartilhada e uma sessão SSO única. Em produção, navegar entre apps seria um page load real para outro subdomínio; aqui usamos uma única aplicação Next.js para demonstrar a experiência ponta a ponta.

> Esta é a reconstrução do protótipo estático (HTML/CSS/JS) como uma **app Next.js 16 (App Router)** usando **`@lerianstudio/sindarian-ui`** (lib de componentes shadcn/Radix/Tailwind v4 com os tokens Lerian).

## Conceito

| Camada | O que é no protótipo | O que seria em produção |
|---|---|---|
| Shell compartilhado | `components/shell/` (barra superior + assistente Sindarian + menu da conta) | Lib/componente publicado, embutido por cada app |
| Sessão | `localStorage 'sin_auth'` (ver `components/auth/`) | Sessão SSO (cookie em `.lerian.studio`) |
| Apps | Rotas dentro de uma app Next.js | Deploys independentes por subdomínio |

O shell renderiza em toda página autenticada:

- **Barra superior** com logo Lerian, switcher de apps, indicador de subdomínio (🔒) e menu de conta.
- **Assistente Sindarian** (drawer lateral, atalho `⌘K` / `Ctrl+K`) que responde com dados ilustrativos e roteia para o app relevante.
- **Auth guard** (`RouteGuard`): toda rota exige a sessão única do Hub; sem ela, redireciona para `/login`.

## Rotas

| Rota | Subdomínio (produção) | App |
|---|---|---|
| `/login` | — | Login / criação da sessão SSO (sem shell) |
| `/` | `hub.lerian.studio` | Launcher (cards de apps + assistente) |
| `/tickets` | `tickets.lerian.studio` | Tickets |
| `/gantt` | `gantt.lerian.studio` | Gantt |
| `/releases` | `releases.lerian.studio` | Releases |
| `/client` | `cliente.lerian.studio` | Visão do Cliente |
| `/onboarding` | `onboarding.lerian.studio` | Onboarding |
| `/midaz` | `midaz.lerian.studio` | Midaz (ledger, contas, transações) |

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Sem sessão, você é redirecionado para `/login`.

Fluxo:

1. **`/login`** — estado não-logado. "Entrar com a conta Lerian" cria a sessão SSO.
2. **`/`** — launcher: cards de apps + assistente Sindarian.
3. Clique em qualquer card/app → navega para o app.
4. **Sair** (menu da conta, no avatar) limpa a sessão e volta ao login.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |

## Estrutura

```
hub/
├── app/
│   ├── layout.tsx          ← html/body, fontes, providers
│   ├── globals.css         ← importa o CSS da sindarian-ui + tokens de fonte
│   ├── login/page.tsx      ← login (sem shell)
│   └── (app)/              ← grupo autenticado (shell + RouteGuard)
│       ├── layout.tsx
│       ├── page.tsx        ← Home / launcher
│       ├── tickets/page.tsx
│       ├── gantt/page.tsx
│       ├── releases/page.tsx
│       ├── client/page.tsx
│       ├── onboarding/page.tsx   ← placeholder
│       └── midaz/page.tsx        ← placeholder
├── components/
│   ├── auth/               ← AuthProvider + RouteGuard
│   ├── shell/              ← TopBar, AppSwitcher, AccountMenu, Sindarian
│   ├── ui-app/             ← blocos reutilizáveis (ScreenTitle, Kpi, Panel, Row…)
│   └── home/               ← cards e saudação da home
└── lib/
    ├── apps.ts             ← registro de apps + identidade do usuário
    ├── sindarian.tsx       ← insights e respostas do assistente
    └── utils.ts            ← cn()
```

> ⚠️ Todos os dados (contagens, health scores, tickets, releases) são **ilustrativos de UX**, não reais.
