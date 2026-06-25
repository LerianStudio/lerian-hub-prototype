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

const app = appById("tickets");

export default function TicketsPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle />}
      />

      <KpiGrid>
        <Kpi value={3} label="Abertos pra você" />
        <Kpi value={1} label="SLA vencendo < 2h" tone="danger" />
        <Kpi value={12} label="Resolvidos (7d)" />
        <Kpi value="94%" label="Dentro do SLA" />
      </KpiGrid>

      <Panel title="Fila ativa">
        <Row
          id="#4821"
          title="Integração de webhook falhando"
          sub="Acme · alta prioridade"
          right={<Badge variant="error">SLA 1h47</Badge>}
        />
        <Row
          id="#4818"
          title="Dúvida sobre limites de conta"
          sub="Globex · normal"
          right={<Badge variant="alert">Aguardando</Badge>}
        />
        <Row
          id="#4805"
          title="Solicitação de novo ledger"
          sub="Initech · normal"
          right={<Badge variant="info">Em análise</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
