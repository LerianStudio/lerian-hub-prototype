"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  Badge,
  Card,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lerianstudio/sindarian-ui";

import { Kpi, KpiGrid } from "@/components/ui-app";
import {
  ONBOARDING_PHASES,
  SCENARIOS,
  bannerCopyFor,
  computeHealthScore,
  currentPhaseIndex,
  deriveMode,
  healthBandFor,
  healthInputsFor,
  overallProgress,
  type ChecklistTask,
  type RecommendedAction,
  type Role,
  type Scenario,
} from "@/lib/client-status";
import { cn } from "@/lib/utils";

const ROLES: { id: Role; label: string }[] = [
  { id: "cliente", label: "Cliente" },
  { id: "cs", label: "Time CS" },
];

/**
 * A subtle, subordinate segmented control used only for the demo affordances
 * (Papel / Cenário). Label sits above a wrapping option group so it fits the
 * narrow demo menu. Styled muted so it reads as prototype chrome, not product.
 */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <div
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-0.5 rounded-xl border bg-muted/50 p-0.5"
      >
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-container-surface text-body-title shadow-sm"
                  : "text-muted-foreground hover:text-body-title",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Prototype-only demo controls (Papel / Cenário) as a fixed bottom-right button
 * that opens a small menu. Marked "Demo" so it reads as prototype chrome.
 */
function DemoMenu({
  role,
  onRole,
  scenarioId,
  onScenario,
}: {
  role: Role;
  onRole: (role: Role) => void;
  scenarioId: string;
  onScenario: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Popover>
        <PopoverTrigger
          aria-label="Controles de demonstração"
          className="flex size-11 items-center justify-center rounded-full border border-dashed bg-container-surface text-muted-foreground shadow-lg outline-none transition-colors hover:border-muted-foreground hover:text-body-title focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SlidersHorizontal className="size-[18px]" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          collisionPadding={12}
          className="w-[min(280px,calc(100vw-24px))] p-3.5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-dashed px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Demo
            </span>
            <span className="text-[11.5px] text-muted-foreground">
              Visualizar estados
            </span>
          </div>
          <div className="flex flex-col gap-3.5">
            <Segmented
              label="Papel"
              options={ROLES}
              value={role}
              onChange={onRole}
            />
            <Segmented
              label="Cenário"
              options={SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
              value={scenarioId}
              onChange={onScenario}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** A deep-link chip pointing at an existing Hub app. */
function AppLinkChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="ml-1.5 inline-flex items-center rounded-md bg-accent px-2 py-0.5 font-mono text-[10.5px] font-medium text-accent-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </Link>
  );
}

/** The colored state banner, tinted by mode + health band. */
function StateBanner({
  colorVar,
  eyebrow,
  title,
  sub,
  children,
}: {
  colorVar: string;
  eyebrow: string;
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{
        borderColor: colorVar,
        // A faint wash of the band color over the container surface.
        background: `color-mix(in srgb, ${colorVar} 8%, hsl(var(--container-surface)))`,
      }}
    >
      <div
        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: colorVar }}
      >
        {eyebrow}
      </div>
      <h3 className="mt-1 text-[17px] font-bold tracking-[-0.01em] text-body-title">
        {title}
      </h3>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</p>
      {children}
    </div>
  );
}

/** Thin progress bar used inside the implantação banner. */
function ProgressBar({ value, colorVar }: { value: number; colorVar: string }) {
  return (
    <div
      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: colorVar }}
      />
    </div>
  );
}

/** The implantação checklist: done items struck through, pending with chips. */
function Checklist({ items }: { items: ChecklistTask[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item.label}
          className="relative pl-7 text-[13px] leading-snug"
        >
          <span
            aria-hidden
            className={cn(
              "absolute left-0 top-px inline-flex size-[18px] items-center justify-center rounded-[5px] border text-[11px] font-bold text-white",
              item.done && "border-transparent",
            )}
            style={
              item.done
                ? { backgroundColor: "var(--color-system-success)" }
                : undefined
            }
          >
            {item.done ? "✓" : ""}
          </span>
          <span
            className={cn(
              item.done
                ? "text-muted-foreground line-through"
                : "text-body-title",
            )}
          >
            {item.label}
          </span>
          {!item.done && item.link ? (
            <AppLinkChip label={item.link.label} href={item.link.href} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Inline SVG circular Health Score ring, colored by band. */
function HealthRing({ score, colorVar }: { score: number; colorVar: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);
  return (
    <div className="relative size-[84px] shrink-0">
      <svg
        width="84"
        height="84"
        viewBox="0 0 84 84"
        className="-rotate-90"
        role="img"
        aria-label={`Health Score ${score} de 100`}
      >
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="9"
        />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke={colorVar}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        className="absolute inset-0 grid place-items-center text-2xl font-bold tabular-nums"
        style={{ color: colorVar }}
      >
        {score}
      </div>
    </div>
  );
}

/** "Ações recomendadas" list (at-risk operação only). */
function RecommendedActions({ actions }: { actions: RecommendedAction[] }) {
  return (
    <div>
      <h4 className="mb-2 text-[13px] font-semibold text-body-title">
        Ações recomendadas
      </h4>
      <ul className="flex flex-col gap-1.5">
        {actions.map((action) => (
          <li
            key={action.label}
            className="relative pl-4 text-[12.5px] text-body-title"
          >
            <span
              aria-hidden
              className="absolute left-0 font-bold"
              style={{ color: "var(--color-system-error)" }}
            >
              →
            </span>
            {action.label}
            <AppLinkChip label={action.link.label} href={action.link.href} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * State-aware client status section for the Hub home.
 *
 * Prototype-only: holds internal demo state (role + scenario) and re-derives the
 * mode, Health Score (computed via the real formula from the scenario's task
 * counts) and band on every switch. No data fetching, no backend.
 */
export function ClientStatus() {
  const [role, setRole] = useState<Role>("cliente");
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);

  const scenario: Scenario =
    SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const { mode, score, band, copy, progress, phase } = useMemo(() => {
    const derivedMode = deriveMode(scenario);
    const computedScore = computeHealthScore(healthInputsFor(scenario));
    return {
      mode: derivedMode,
      score: computedScore,
      band: healthBandFor(computedScore),
      copy: bannerCopyFor(scenario, derivedMode, role, computedScore),
      progress: overallProgress(scenario.phases),
      phase: currentPhaseIndex(scenario.phases),
    };
  }, [scenario, role]);

  // Banner tint: implantação uses the brand info color; operação uses the
  // health band color; overlay stays neutral/muted.
  const bannerColor =
    mode === "implantacao"
      ? "var(--color-system-info)"
      : mode === "overlay"
        ? "hsl(var(--muted-foreground))"
        : band.colorVar;

  return (
    <section aria-label="Estado do cliente" className="mt-7">
      <DemoMenu
        role={role}
        onRole={setRole}
        scenarioId={scenarioId}
        onScenario={setScenarioId}
      />

      <Card className="gap-0 rounded-2xl p-4 sm:p-5">
        <StateBanner
          colorVar={bannerColor}
          eyebrow={copy.eyebrow}
          title={copy.title}
          sub={copy.sub}
        >
          {mode === "implantacao" ? (
            <ProgressBar value={progress} colorVar={bannerColor} />
          ) : null}
        </StateBanner>

        {mode === "implantacao" ? (
          <div className="mt-4">
            <h4 className="mb-2.5 text-[13px] font-semibold text-body-title">
              Próximas tarefas ·{" "}
              <span className="font-normal text-muted-foreground">
                fase {phase} de {ONBOARDING_PHASES.length}
              </span>
            </h4>
            <Checklist items={scenario.checklist} />
          </div>
        ) : null}

        {mode === "operacao" ? (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <HealthRing score={score} colorVar={band.colorVar} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-body-title">
                    Health Score
                  </span>
                  <Badge variant={band.badgeVariant}>{band.label}</Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Calculado a partir do progresso de onboarding, com penalidade
                  por tarefas atrasadas e bloqueadas.
                </p>
              </div>
            </div>

            <KpiGrid>
              {scenario.kpis.map((kpi) => (
                <Kpi
                  key={kpi.label}
                  value={kpi.value}
                  label={kpi.label}
                  tone={kpi.danger ? "danger" : "default"}
                />
              ))}
            </KpiGrid>

            {band.band === "risk" && scenario.actions.length > 0 ? (
              <RecommendedActions actions={scenario.actions} />
            ) : null}
          </div>
        ) : null}
      </Card>
    </section>
  );
}
