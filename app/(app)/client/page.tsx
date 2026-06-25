import { Badge } from "@lerianstudio/sindarian-ui";

import {
  AppSubtitle,
  Kpi,
  KpiGrid,
  PageContainer,
  Panel,
  Row,
  ScreenTitle,
} from "@/components/ui-app";
import { appById } from "@/lib/apps";

const app = appById("client");

export default function ClientPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle extra="carteira consolidada" />}
      />

      <KpiGrid>
        <Kpi value={7} label="Clientes ativos" />
        <Kpi value={2} label="Em risco (< 60)" tone="danger" />
        <Kpi value={5} label="Saudáveis" />
        <Kpi value={3} label="Em onboarding" />
      </KpiGrid>

      <Panel title="Carteira">
        <Row
          id={app.glyph}
          title="Acme"
          sub="onboarding 72% · 3 tickets"
          right={<Badge variant="alert">Health 58</Badge>}
        />
        <Row
          id={app.glyph}
          title="Globex"
          sub="ativo · 1 ticket"
          right={<Badge variant="success">Health 81</Badge>}
        />
        <Row
          id={app.glyph}
          title="Initech"
          sub="ativo · sem pendências"
          right={<Badge variant="success">Health 88</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
