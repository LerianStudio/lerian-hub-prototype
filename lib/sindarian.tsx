import type { ReactNode } from "react";

/** Daily-summary insight shown at the top of the assistant. */
export interface SindarianInsight {
  /** CSS color for the leading dot. */
  dotColor: string;
  /** The insight text (rich nodes allow bold fragments). */
  text: ReactNode;
  /** Call-to-action label. */
  cta: string;
  /** Route the insight links to. */
  route: string;
}

/** A canned keyword-matched answer. */
export interface SindarianAnswer {
  /** Lowercased keywords that trigger this answer. */
  match: string[];
  /** Route the answer's action button links to. */
  route: string;
  /** App label for the action button ("Abrir <app> →"). */
  app: string;
  /** The reply text (rich nodes allow bold fragments). */
  body: ReactNode;
}

/** "Resumo do seu dia" — illustrative daily insights. */
export const DAY_INSIGHTS: SindarianInsight[] = [
  {
    dotColor: "hsl(var(--system-error))",
    text: (
      <>
        <b>1 ticket</b> com SLA vencendo em ~2h (Acme).
      </>
    ),
    cta: "Abrir Tickets →",
    route: "/tickets",
  },
  {
    dotColor: "hsl(var(--system-alert))",
    text: (
      <>
        Onboarding da <b>Acme</b> com 2 tarefas atrasadas.
      </>
    ),
    cta: "Abrir Gantt →",
    route: "/gantt",
  },
  {
    dotColor: "var(--color-sunglow-500)",
    text: (
      <>
        <b>2 clientes</b> entraram em risco.
      </>
    ),
    cta: "Ver carteira →",
    route: "/client",
  },
];

/** Canned keyword answers; first match wins, else the generic fallback. */
export const SINDARIAN_ANSWERS: SindarianAnswer[] = [
  {
    match: ["ticket", "chamado", "sla", "fila"],
    route: "/tickets",
    app: "Tickets",
    body: (
      <>
        Você tem <b>3 tickets abertos</b> — 1 com SLA vencendo em ~2h.
      </>
    ),
  },
  {
    match: ["gantt", "cronograma", "acme", "onboarding"],
    route: "/gantt",
    app: "Gantt",
    body: (
      <>
        O onboarding da <b>Acme</b> está em <b>72%</b>, com 2 tarefas atrasadas.
      </>
    ),
  },
  {
    match: ["release", "versão", "versao", "deploy"],
    route: "/releases",
    app: "Releases",
    body: (
      <>
        Saíram <b>4 releases</b> esta semana.
      </>
    ),
  },
  {
    match: ["health", "score", "cliente", "carteira", "risco"],
    route: "/client",
    app: "Visão 360",
    body: (
      <>
        <b>2 clientes</b> estão em risco (health &lt; 60).
      </>
    ),
  },
];

export const SINDARIAN_FALLBACK: SindarianAnswer = {
  match: [],
  route: "/tickets",
  app: "Tickets",
  body: "Posso ajudar com Tickets, Gantt, Releases e Clientes — pergunte algo específico.",
};

/** Resolve the canned answer for a user query (case-insensitive). */
export function answerFor(query: string): SindarianAnswer {
  const q = query.toLowerCase();
  return (
    SINDARIAN_ANSWERS.find((answer) =>
      answer.match.some((keyword) => q.includes(keyword)),
    ) ?? SINDARIAN_FALLBACK
  );
}
