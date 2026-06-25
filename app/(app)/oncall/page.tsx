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

const app = appById("oncall");

export default function OncallPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle extra="escalação e plantão" />}
      />

      <KpiGrid>
        <Kpi value={3} label="Alertas ativos" tone="danger" />
        <Kpi value={2} label="Em plantão agora" />
        <Kpi value="4min" label="MTTA" />
        <Kpi value={18} label="Resolvidos (7d)" />
      </KpiGrid>

      <Panel title="Alertas ativos">
        <Row
          id="#A-204"
          title="Latência p99 acima do limite"
          sub="Midaz Ledger · Plataforma"
          right={<Badge variant="error">P1</Badge>}
        />
        <Row
          id="#A-203"
          title="Fila de webhooks acumulando"
          sub="Integrações · Bruno Lima"
          right={<Badge variant="alert">P2</Badge>}
        />
        <Row
          id="#A-201"
          title="Taxa de erro 5xx elevada"
          sub="Console · Carla Souza"
          right={<Badge variant="alert">P2</Badge>}
        />
      </Panel>

      <Panel title="Plantão atual">
        <Row
          id="◈"
          title="Carla Souza"
          sub="primário · até 18h"
          right={<Badge variant="info">Plantão</Badge>}
        />
        <Row
          id="◈"
          title="Bruno Lima"
          sub="secundário · backup"
          right={<Badge variant="info">Reserva</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
