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

const app = appById("sla");

export default function SlaPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle extra="conformidade de SLA" />}
      />

      <KpiGrid>
        <Kpi value="96%" label="Conformidade" />
        <Kpi value={2} label="Breaches (semana)" tone="danger" />
        <Kpi value={2} label="Políticas em risco" />
        <Kpi value="3h12" label="Resolução média" />
      </KpiGrid>

      <Panel title="Políticas em risco">
        <Row
          id="P1"
          title="Resposta inicial · alta prioridade"
          sub="Acme · 1h47 restante"
          right={<Badge variant="alert">WATCH</Badge>}
        />
        <Row
          id="P2"
          title="Resolução · webhooks"
          sub="Globex · prazo excedido"
          right={<Badge variant="error">BREACHED</Badge>}
        />
        <Row
          id="P2"
          title="Resposta inicial · normal"
          sub="Initech · folga confortável"
          right={<Badge variant="success">HEALTHY</Badge>}
        />
        <Row
          id="P3"
          title="Resolução · dúvidas gerais"
          sub="Umbrella · monitorando"
          right={<Badge variant="info">URGENT</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
