import { Badge } from "@lerianstudio/sindarian-ui";

import {
  AppSubtitle,
  PageContainer,
  Panel,
  Row,
  ScreenTitle,
} from "@/components/ui-app";
import { appById } from "@/lib/apps";

const app = appById("opspedia");

export default function OpspediaPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle extra="base de conhecimento interna" />}
      />

      <Panel title="Docs recentes">
        <Row
          id="▤"
          title="Runbook · Incidente P1"
          sub="Operações · Carla Souza"
          right={<Badge variant="success">Atualizado</Badge>}
        />
        <Row
          id="▤"
          title="Política de escalação de plantão"
          sub="Operações · Bruno Lima"
          right={<Badge variant="info">Assinado</Badge>}
        />
        <Row
          id="▤"
          title="Checklist de onboarding de cliente"
          sub="Customer Success · Daniel Antunes"
          right={<Badge variant="success">Atualizado</Badge>}
        />
        <Row
          id="▤"
          title="Guia de resposta a breach de SLA"
          sub="Operações · rascunho"
          right={<Badge variant="alert">Revisão</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
