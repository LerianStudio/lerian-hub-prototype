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

const app = appById("meetings");

export default function ReunioesPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle extra="atas e action items" />}
      />

      <KpiGrid>
        <Kpi value={5} label="Esta semana" />
        <Kpi value={2} label="Atas pendentes" tone="danger" />
        <Kpi value={7} label="Action items abertos" />
        <Kpi value={4} label="Transcrições" />
      </KpiGrid>

      <Panel title="Próximas reuniões">
        <Row
          id="◳"
          title="Acme · Revisão trimestral"
          sub="Daniel, Carla · hoje 15h"
          right={<Badge variant="info">Agendada</Badge>}
        />
        <Row
          id="◳"
          title="Globex · Kickoff de integração"
          sub="Bruno, time Globex · amanhã 10h"
          right={<Badge variant="info">Agendada</Badge>}
        />
        <Row
          id="◳"
          title="Initech · Follow-up de suporte"
          sub="Carla · ontem · Fireflies"
          right={<Badge variant="alert">Ata pendente</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
