# Lerian Hub

Protótipo navegável da **Opção A** para o portal unificado da Lerian: um **shell fino compartilhado + SSO + apps independentes**.

A ideia central: em vez de um monólito que troca telas via `<div>`, cada app é um **deploy separado no seu próprio subdomínio**. O único elo entre eles é uma barra-shell compartilhada e uma sessão SSO única. Em produção, navegar entre apps seria um page load real para outro subdomínio; aqui usamos uma única aplicação Next.js para demonstrar a experiência ponta a ponta.

> Reconstrução do protótipo estático (HTML/CSS/JS) como uma **app Next.js 16 (App Router)** usando **`@lerianstudio/sindarian-ui`** (lib de componentes shadcn/Radix/Tailwind v4 com os tokens Lerian).

> ⚠️ Todos os dados (contagens, health scores, tickets, releases) são **ilustrativos de UX**, não reais.

## Como rodar local

**Pré-requisitos:** Node.js 20+ (testado no 24) e npm. O `@lerianstudio/sindarian-ui` é **público no npm**, então não é preciso configurar registry privado nem token.

```bash
git clone git@github.com:LerianStudio/lerian-hub-prototype.git
cd lerian-hub-prototype
npm install
npm run dev
```

Abra **http://localhost:3000**. Sem sessão, você é redirecionado para `/login`.

**Fluxo:**

1. **`/login`** — estado não-logado. "Entrar com a conta Lerian" cria a sessão SSO (mock em `localStorage`).
2. **`/`** — launcher: grade de apps + assistente Sindarian.
3. Clique em qualquer card → navega para o app.
4. **Sair** (menu da conta, no avatar) limpa a sessão e volta ao login.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build de produção |
| `npm run lint` | ESLint |

## Conceito

| Camada | O que é no protótipo | O que seria em produção |
|---|---|---|
| Shell compartilhado | `components/shell/` (barra superior + assistente Sindarian + menu da conta) | Lib/componente publicado, embutido por cada app |
| Sessão | `localStorage 'sin_auth'` (ver `components/auth/`) | Sessão SSO (cookie em `.lerian.studio`) |
| Apps | Rotas dentro de uma app Next.js | Deploys independentes por subdomínio |

O shell renderiza em toda página autenticada:

- **Barra superior** com logo Lerian, waffle launcher (switcher de apps), indicador de subdomínio (🔒) e menu de conta.
- **Assistente Sindarian** (drawer lateral, atalho `⌘K` / `Ctrl+K`) que responde com dados ilustrativos e roteia para o app relevante.
- **Auth guard** (`RouteGuard`): toda rota exige a sessão única do Hub; sem ela, redireciona para `/login`.

## Home customizável

A seção **"Seus apps"** da home é personalizável, com preferências persistidas em `localStorage` (`hub_app_prefs`):

- **Reordenar** e **mostrar/ocultar** cada app pelo modal **"Gerenciar apps"** (arraste pela alça ou use as setas do teclado).
- **Remover da home** direto pelo menu ⋯ de cada card, com **toast de "Desfazer"**.
- **Estado vazio** quando todos os apps são ocultados, com atalho para reabrir o modal.

## Rotas

| Rota | Subdomínio (produção) | App |
|---|---|---|
| `/login` | — | Login / criação da sessão SSO (sem shell) |
| `/` | `hub.lerian.studio` | Launcher (grade de apps + assistente) |
| `/tickets` | `tickets.lerian.studio` | Tickets |
| `/gantt` | `gantt.lerian.studio` | Gantt |
| `/releases` | `releases.lerian.studio` | Releases |
| `/client` | `cliente.lerian.studio` | Visão 360 |
| `/onboarding` | `onboarding.lerian.studio` | Onboarding |
| `/oncall` | `oncall.lerian.studio` | On-call |
| `/reunioes` | `reunioes.lerian.studio` | Reuniões |
| `/sla` | `sla.lerian.studio` | Saúde SLA |
| `/opspedia` | `opspedia.lerian.studio` | Opspedia |
| `/config` | — | Configurações da conta |

## Estrutura

```
.
├── app/
│   ├── layout.tsx          ← html/body, fontes, providers
│   ├── globals.css         ← importa o CSS da sindarian-ui + tokens de fonte
│   ├── login/page.tsx      ← login (sem shell)
│   └── (app)/              ← grupo autenticado (shell + RouteGuard)
│       ├── layout.tsx
│       ├── page.tsx        ← Home / launcher
│       ├── tickets/        gantt/        releases/
│       ├── client/         onboarding/   oncall/
│       ├── reunioes/       sla/          opspedia/
│       └── config/
├── components/
│   ├── auth/               ← AuthProvider + RouteGuard
│   ├── shell/              ← TopBar, WaffleLauncher, AccountMenu, Sindarian
│   ├── ui-app/             ← blocos reutilizáveis (ScreenTitle, Kpi, Panel, Row, spacing…)
│   └── home/               ← grade de apps, modal "Gerenciar apps", saudação, status
└── lib/
    ├── apps.ts             ← registro de apps + identidade do usuário
    ├── app-prefs.ts        ← preferências da home (ordem/visibilidade) em localStorage
    ├── sindarian.tsx       ← insights e respostas do assistente
    └── utils.ts            ← cn()
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `@lerianstudio/sindarian-ui` (shadcn/Radix) · dnd-kit (reordenar) · lucide-react.
