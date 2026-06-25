import { AppSubtitle, PageContainer, Panel, ScreenTitle } from "@/components/ui-app";
import { Placeholder } from "@/components/ui-app/placeholder";
import { appById } from "@/lib/apps";

const app = appById("onboarding");

export default function OnboardingPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title="Onboarding"
        subtitle={<AppSubtitle />}
      />

      <Panel title="Fluxos de implementação">
        <Placeholder
          glyph={app.glyph}
          color={app.color}
          darkGlyph={app.darkGlyph}
          subdomain={app.subdomain}
          description="Fluxos de implementação e ativação dos clientes."
        />
      </Panel>
    </PageContainer>
  );
}
