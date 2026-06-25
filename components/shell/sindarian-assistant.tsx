"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Send, Sparkles } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@lerianstudio/sindarian-ui";

import { useSindarian } from "@/components/shell/sindarian-context";
import { answerFor, DAY_INSIGHTS } from "@/lib/sindarian";
import { CURRENT_USER } from "@/lib/apps";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  body: ReactNode;
  /** Optional action button (assistant replies route into an app). */
  action?: { label: string; route: string };
}

const INTRO_MESSAGE: ChatMessage = {
  id: 0,
  role: "assistant",
  body: "Posso puxar dados de Tickets, Gantt, Releases e Clientes — é só pedir.",
};

/** Sparkle avatar used for the assistant's bubbles and header. */
function SparkAvatar({ size = 26 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-lg bg-accent font-bold text-accent-foreground"
      style={{ width: size, height: size }}
    >
      <Sparkles className="size-3.5" />
    </span>
  );
}

/**
 * The Sindarian assistant drawer (right Sheet). Opens via the top-bar button or
 * ⌘K/Ctrl+K; closes via Esc / overlay / the X. Shows the "Resumo do seu dia"
 * insights and an intro bubble, and replies to canned keyword queries with a
 * button that routes into the relevant app.
 */
export function SindarianAssistant() {
  const { open, setOpen } = useSindarian();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the conversation scrolled to the latest message.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Focus the composer when the drawer opens.
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(timer);
    }
  }, [open]);

  function navigate(route: string) {
    setOpen(false);
    router.push(route);
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    const answer = answerFor(text);
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", body: text },
      {
        id: nextId.current++,
        role: "assistant",
        body: answer.body,
        action: { label: `Abrir ${answer.app} →`, route: answer.route },
      },
    ]);
    setDraft("");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-[380px] max-w-[92vw] flex-col gap-0 p-0"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b px-[18px] py-4">
          <SparkAvatar size={30} />
          <SheetTitle className="text-sm font-semibold text-body-title">
            Sindarian
          </SheetTitle>
          <span className="flex items-center gap-1.5 text-[11px] text-system-success">
            <span className="size-1.5 rounded-full bg-system-success" />
            online
          </span>
          {/* SheetContent renders its own close (X) button top-right. */}
        </div>
        <SheetDescription className="sr-only">
          Assistente Sindarian: resumo do dia e respostas sobre os apps do Hub.
        </SheetDescription>

        {/* Body */}
        <div
          ref={bodyRef}
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-[18px]"
        >
          {/* Daily summary */}
          <div className="rounded-[13px] border bg-secondary p-[15px]">
            <h3 className="mb-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-body-title">
              <Sparkles className="size-3.5 text-accent" aria-hidden />
              Resumo do seu dia
            </h3>
            {DAY_INSIGHTS.map((insight, index) => (
              <button
                key={index}
                type="button"
                onClick={() => navigate(insight.route)}
                className="flex w-full items-start gap-2.5 border-b py-2.5 text-left outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{ background: insight.dotColor }}
                />
                <span className="text-[13px] leading-snug text-container-text">
                  {insight.text}{" "}
                  <span className="font-semibold text-accent">
                    {insight.cta}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Conversation */}
          {messages.map((message) => (
            <Bubble key={message.id} message={message} onNavigate={navigate} />
          ))}
        </div>

        {/* Composer */}
        <div className="border-t px-4 py-3.5">
          <div className="flex items-center gap-2 rounded-full border border-shadcn-400 bg-secondary py-1.5 pl-3.5 pr-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-mute">
            <input
              ref={inputRef}
              type="text"
              aria-label="Pergunte à Sindarian"
              placeholder="Pergunte à Sindarian…"
              autoComplete="off"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-body-title outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={send}
              aria-label="Enviar"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Send className="size-3.5" />
            </button>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
            Acessa os dados dos apps em que você tem permissão (SSO)
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Bubble({
  message,
  onNavigate,
}: {
  message: ChatMessage;
  onNavigate: (route: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      {isUser ? (
        <span
          aria-hidden
          className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-body-text"
        >
          {CURRENT_USER.initials}
        </span>
      ) : (
        <SparkAvatar />
      )}
      <div
        className={cn(
          "rounded-xl border px-3 py-2.5 text-[13px] leading-relaxed",
          isUser
            ? "border-transparent bg-accent-mute text-body-title"
            : "bg-secondary text-container-text",
        )}
      >
        {message.body}
        {message.action ? (
          <div>
            <button
              type="button"
              onClick={() => onNavigate(message.action!.route)}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {message.action.label}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
