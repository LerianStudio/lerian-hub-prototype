/**
 * Illustrative client-status model + derivation logic for the Hub home.
 *
 * This is a UX prototype: ALL data here is illustrative (UX only), not real and
 * not fetched from any backend. The shapes and the Health Score formula mirror
 * what the `cs-platform` actually models (validated by deep-reading the code),
 * so the numbers stay internally consistent — the health score is COMPUTED from
 * each scenario's task counts, never hand-typed.
 *
 * What is real (mirrored here):
 *  - The 6 onboarding phases and their activity counts (47 total).
 *  - The dashboard Health Score formula (`dashboard.getSummary`, formula "D"):
 *      health = max(0, overallProgress
 *                       − min(overdue×3, 20)
 *                       − min(blocked×5, 15)
 *                       − min(criticalOverdue×5, 20))
 *
 * What is OUR product decision (not in the backend): the health bands
 * (Saudável / Atenção / Em risco) and their cut-offs.
 */

/** The 6 real onboarding phases with their illustrative activity counts. */
export interface OnboardingPhase {
  /** Phase name (pt-BR), matching the real onboarding template. */
  name: string;
  /** Total activities modelled for this phase. */
  total: number;
}

/** The 6 REAL onboarding phases (47 activities total). */
export const ONBOARDING_PHASES: readonly OnboardingPhase[] = [
  { name: "Kickoff e Escopo", total: 6 },
  { name: "Infraestrutura e Ambiente", total: 10 },
  { name: "Auth e Identidade", total: 4 },
  { name: "Deploy dos Produtos", total: 12 },
  { name: "Integração e Testes", total: 9 },
  { name: "Go-Live", total: 6 },
] as const;

/** Total onboarding activities across all phases (47). */
export const TOTAL_ACTIVITIES = ONBOARDING_PHASES.reduce(
  (sum, phase) => sum + phase.total,
  0,
);

/** Per-phase progress for a scenario: how many of the phase's tasks are done. */
export interface PhaseProgress {
  /** Activities completed in this phase. */
  done: number;
  /** Total activities in this phase (must match {@link ONBOARDING_PHASES}). */
  total: number;
}

/** Inputs to the Health Score formula (counts of problem tasks). */
export interface HealthInputs {
  /** Overall onboarding progress, 0–100 (done/total task percentage). */
  overallProgress: number;
  /** Tasks past their due date. */
  overdue: number;
  /** Tasks blocked by a dependency or external wait. */
  blocked: number;
  /** Critical-severity tasks that are also overdue. */
  criticalOverdue: number;
}

/**
 * The REAL Health Score formula from `cs-platform` `dashboard.getSummary`
 * (formula "D"). Progress is rewarded; overdue/blocked/critical work is
 * penalised, each capped. Result is clamped to 0–100.
 */
export function computeHealthScore({
  overallProgress,
  overdue,
  blocked,
  criticalOverdue,
}: HealthInputs): number {
  return Math.round(
    Math.max(
      0,
      overallProgress -
        Math.min(overdue * 3, 20) -
        Math.min(blocked * 5, 15) -
        Math.min(criticalOverdue * 5, 20),
    ),
  );
}

/** A health band: classification + label + the CSS color var to tint with. */
export interface HealthBand {
  band: "healthy" | "watch" | "risk";
  label: string;
  /** A `var(--color-system-*)` token for tinting rings/badges/text. */
  colorVar: string;
  /** The sindarian-ui <Badge> variant that matches this band. */
  badgeVariant: "success" | "alert" | "error";
}

/**
 * OUR product-decision bands (the backend defines none):
 *   ≥ 80 → Saudável · 60–79 → Atenção · < 60 → Em risco.
 */
export function healthBandFor(score: number): HealthBand {
  if (score >= 80) {
    return {
      band: "healthy",
      label: "Saudável",
      colorVar: "var(--color-system-success)",
      badgeVariant: "success",
    };
  }
  if (score >= 60) {
    return {
      band: "watch",
      label: "Atenção",
      colorVar: "var(--color-system-alert)",
      badgeVariant: "alert",
    };
  }
  return {
    band: "risk",
    label: "Em risco",
    colorVar: "var(--color-system-error)",
    badgeVariant: "error",
  };
}

/**
 * Home display mode, DERIVED from real signals (there is no lifecycle enum):
 *  - `implantacao` while onboarding `overallProgress < 100`.
 *  - `operacao` once onboarding is complete.
 *  - `overlay` when a manual `paused`/`churned` status overrides everything.
 */
export type Mode = "implantacao" | "operacao" | "overlay";

/** The manual client status field (3 values, mirrors the real schema). */
export type ClientStatus = "active" | "paused" | "churned";

/** Viewer role — changes COPY/framing only, never the underlying data. */
export type Role = "cliente" | "cs";

/** A checklist item shown in the implantação body. */
export interface ChecklistTask {
  /** Task label (pt-BR). */
  label: string;
  /** Whether it is already completed (struck through with a check). */
  done: boolean;
  /**
   * Optional deep-link to an existing Hub app for a pending task. Omitted for
   * done tasks (no action needed).
   */
  link?: { label: string; href: string };
}

/** A single KPI shown in the operação body. */
export interface ScenarioKpi {
  /** Big value (already formatted, e.g. "100%" or "0"). */
  value: string;
  /** Muted label below it. */
  label: string;
  /** Tint the value as critical when true. */
  danger?: boolean;
}

/** A recommended action (deep-link chip) for the at-risk operação body. */
export interface RecommendedAction {
  label: string;
  link: { label: string; href: string };
}

/** A full illustrative scenario for the demo toggle. */
export interface Scenario {
  /** Stable id used by the segmented control. */
  id: string;
  /** Short label for the demo control (pt-BR). */
  label: string;
  /** Illustrative client name. */
  client: string;
  /** Manual status field. */
  status: ClientStatus;
  /** Per-phase done/total — index-aligned with {@link ONBOARDING_PHASES}. */
  phases: PhaseProgress[];
  /** Problem-task counts feeding the Health Score formula. */
  overdue: number;
  blocked: number;
  criticalOverdue: number;
  /** Checklist items for the implantação body. */
  checklist: ChecklistTask[];
  /** KPI tiles for the operação body. */
  kpis: ScenarioKpi[];
  /** Recommended actions, only meaningful for an at-risk operação. */
  actions: RecommendedAction[];
}

/** Deep-link targets — existing Hub apps. */
const APP_LINKS = {
  onboarding: { label: "Onboarding", href: "/onboarding" },
  meetings: { label: "Reuniões", href: "/reunioes" },
  gantt: { label: "Gantt", href: "/gantt" },
  tickets: { label: "Tickets", href: "/tickets" },
} as const;

/** Sum of completed activities across all phases of a scenario. */
export function doneCount(phases: PhaseProgress[]): number {
  return phases.reduce((sum, phase) => sum + phase.done, 0);
}

/** Overall onboarding progress (0–100), done/total across all phases. */
export function overallProgress(phases: PhaseProgress[]): number {
  return Math.round((doneCount(phases) / TOTAL_ACTIVITIES) * 100);
}

/** 1-based index of the current (first not-yet-complete) phase, 1–6. */
export function currentPhaseIndex(phases: PhaseProgress[]): number {
  const idx = phases.findIndex((phase) => phase.done < phase.total);
  return idx === -1 ? phases.length : idx + 1;
}

/** Derive the home display mode from a scenario's real signals. */
export function deriveMode(scenario: Scenario): Mode {
  if (scenario.status !== "active") return "overlay";
  return overallProgress(scenario.phases) < 100 ? "implantacao" : "operacao";
}

/** Build the per-phase progress array from a "done up to N total" shorthand. */
function phaseProgress(donePerPhase: number[]): PhaseProgress[] {
  return ONBOARDING_PHASES.map((phase, i) => ({
    done: Math.min(donePerPhase[i] ?? 0, phase.total),
    total: phase.total,
  }));
}

/**
 * The illustrative demo scenarios. Health is COMPUTED per scenario, so the ring
 * number is always consistent with the task counts shown in the KPIs.
 */
export const SCENARIOS: Scenario[] = [
  {
    // ~43% → 20 of 47 done, currently in "Deploy dos Produtos" (phase 4).
    id: "implantacao",
    label: "Implantação",
    client: "Acme",
    status: "active",
    phases: phaseProgress([6, 10, 4, 0, 0, 0]),
    overdue: 1,
    blocked: 1,
    criticalOverdue: 0,
    checklist: [
      { label: "Kickoff e definição de escopo", done: true },
      { label: "Provisionar infraestrutura e ambiente", done: true },
      { label: "Configurar Auth e identidade", done: true },
      {
        label: "Iniciar deploy dos produtos",
        done: false,
        link: APP_LINKS.onboarding,
      },
      {
        label: "Agendar reunião de deploy",
        done: false,
        link: APP_LINKS.meetings,
      },
      {
        label: "Acompanhar tarefas no cronograma",
        done: false,
        link: APP_LINKS.gantt,
      },
    ],
    kpis: [],
    actions: [],
  },
  {
    id: "operacao-saudavel",
    label: "Operação · saudável",
    client: "Acme",
    status: "active",
    phases: phaseProgress([6, 10, 4, 12, 9, 6]),
    overdue: 0,
    blocked: 0,
    criticalOverdue: 0,
    checklist: [],
    kpis: [
      { value: "100%", label: "Onboarding" },
      { value: "0", label: "Atrasadas" },
      { value: "0", label: "Bloqueadas" },
      { value: "2", label: "Reuniões na semana" },
    ],
    actions: [],
  },
  {
    id: "operacao-risco",
    label: "Operação · em risco",
    client: "Acme",
    status: "active",
    phases: phaseProgress([6, 10, 4, 12, 9, 6]),
    overdue: 4,
    blocked: 2,
    criticalOverdue: 3,
    checklist: [],
    kpis: [
      { value: "100%", label: "Onboarding" },
      { value: "4", label: "Atrasadas", danger: true },
      { value: "2", label: "Bloqueadas", danger: true },
      { value: "3", label: "Reuniões na semana" },
    ],
    actions: [
      { label: "Destravar tarefas bloqueadas", link: APP_LINKS.gantt },
      { label: "Resolver tickets em aberto", link: APP_LINKS.tickets },
      { label: "Agendar revisão com o cliente", link: APP_LINKS.meetings },
    ],
  },
  {
    id: "pausado",
    label: "Pausado",
    client: "Acme",
    status: "paused",
    phases: phaseProgress([6, 10, 4, 6, 0, 0]),
    overdue: 0,
    blocked: 0,
    criticalOverdue: 0,
    checklist: [],
    kpis: [],
    actions: [],
  },
];

/** Resolve the health inputs for a scenario from its phases + problem counts. */
export function healthInputsFor(scenario: Scenario): HealthInputs {
  return {
    overallProgress: overallProgress(scenario.phases),
    overdue: scenario.overdue,
    blocked: scenario.blocked,
    criticalOverdue: scenario.criticalOverdue,
  };
}

/** Role-dependent copy for the state banner and framing. */
export interface BannerCopy {
  /** Small mono eyebrow above the title. */
  eyebrow: string;
  /** Banner title. */
  title: string;
  /** Banner sub line. */
  sub: string;
}

/**
 * Compute the banner copy for a scenario + role. Role changes framing only:
 * the cliente sees "a sua operação", CS sees the client name they follow.
 */
export function bannerCopyFor(
  scenario: Scenario,
  mode: Mode,
  role: Role,
  score: number,
): BannerCopy {
  const isClient = role === "cliente";
  const subject = isClient ? "A sua operação" : `${scenario.client} · operação`;
  const possessive = isClient ? "a sua operação" : `a ${scenario.client}`;

  if (mode === "overlay") {
    const isPaused = scenario.status === "paused";
    return {
      eyebrow: isClient
        ? "A sua operação · pausada"
        : `${scenario.client} · pausado`,
      title: isPaused
        ? isClient
          ? "A sua operação está pausada"
          : `${scenario.client} está pausada`
        : isClient
          ? "A sua operação foi encerrada"
          : `${scenario.client} foi encerrada`,
      sub: "Sem checklist ou indicadores ativos no momento.",
    };
  }

  if (mode === "implantacao") {
    const phase = currentPhaseIndex(scenario.phases);
    const progress = overallProgress(scenario.phases);
    return {
      eyebrow: isClient
        ? "Você está em · Onboarding"
        : `${scenario.client} · Onboarding`,
      title: isClient
        ? "Vamos colocar a sua operação no ar"
        : `Vamos colocar ${possessive} no ar`,
      sub: `Fase ${phase} de ${ONBOARDING_PHASES.length} · ${progress}% concluído`,
    };
  }

  // operacao
  const band = healthBandFor(score);
  if (band.band === "healthy") {
    return {
      eyebrow: isClient ? "Sua operação · tudo certo" : `${subject} · tudo certo`,
      title: isClient ? "A sua operação está saudável" : `${scenario.client} está saudável`,
      sub: "Sem tarefas atrasadas ou bloqueadas.",
    };
  }
  return {
    eyebrow: isClient ? "Sua operação · atenção" : `${subject} · atenção`,
    title: isClient
      ? "A sua operação precisa de atenção"
      : `${scenario.client} precisa de atenção`,
    sub: "Tarefas críticas atrasadas puxaram o score.",
  };
}
