"use client";

import type { Control, FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  Button,
  Form,
  InputField,
  SelectField,
  SelectItem,
} from "@lerianstudio/sindarian-ui";

import { PageContainer, Panel, ScreenTitle } from "@/components/ui-app";
import { CURRENT_USER } from "@/lib/apps";

/** Fuso horário options offered in the profile form (illustrative). */
const TIMEZONES = [
  "America/Sao_Paulo",
  "America/New_York",
  "Europe/Lisbon",
  "UTC",
];

/**
 * Account settings ("Configurações"). An account-level page (not a launcher
 * app) reached from the avatar menu; it renders inside the authed shell with
 * the home pseudo-app TopBar. Prototype only — "Salvar" is a no-op confirmation.
 */
export default function ConfigPage() {
  const form = useForm({
    defaultValues: {
      firstName: CURRENT_USER.firstName,
      lastName: CURRENT_USER.lastName,
      phone: CURRENT_USER.phone,
      email: CURRENT_USER.email,
      role: CURRENT_USER.role,
      company: CURRENT_USER.company,
      department: CURRENT_USER.department,
      timezone: CURRENT_USER.timezone,
    },
  });

  // sindarian-ui's *Field components type `control` as `Control<any>`; RHF
  // 7.80's `Control` is invariant, so a concrete control is not assignable.
  // Widen to the field-agnostic `Control<FieldValues>` the library expects.
  const control = form.control as unknown as Control<FieldValues>;

  function onSubmit() {
    // UX prototype — no backend; confirm the (simulated) save.
    window.alert("Alterações salvas.");
  }

  return (
    <PageContainer>
      <ScreenTitle
        glyph="⚙"
        color="var(--color-accent)"
        darkGlyph
        title="Configurações"
        subtitle="Sua conta Lerian · SSO único em todos os apps"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Panel title="Dados pessoais">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-[18px]">
              <InputField
                control={control}
                name="firstName"
                label="Nome"
                placeholder="Nome"
              />
              <InputField
                control={control}
                name="lastName"
                label="Sobrenome"
                placeholder="Sobrenome"
              />
              <InputField
                control={control}
                name="phone"
                type="tel"
                label="Telefone"
                placeholder="+55 11 90000-0000"
              />
              <InputField
                control={control}
                name="email"
                type="email"
                label="Email"
                description="Definido pelo SSO — não editável aqui."
                readOnly
                disabled
              />
            </div>
          </Panel>

          <Panel title="Trabalho">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-[18px]">
              <InputField
                control={control}
                name="role"
                label="Cargo"
                placeholder="Cargo"
              />
              <InputField
                control={control}
                name="company"
                label="Empresa"
                placeholder="Empresa"
              />
              <InputField
                control={control}
                name="department"
                label="Departamento"
                placeholder="Departamento"
              />
              <SelectField
                control={control}
                name="timezone"
                label="Fuso horário"
                placeholder="Selecione"
              >
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
