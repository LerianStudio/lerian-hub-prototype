import { Badge } from "@lerianstudio/sindarian-ui";

import {
  AppSubtitle,
  PageContainer,
  Panel,
  Row,
  ScreenTitle,
} from "@/components/ui-app";
import { appById } from "@/lib/apps";

const app = appById("releases");

export default function ReleasesPage() {
  return (
    <PageContainer>
      <ScreenTitle
        glyph={app.glyph}
        color={app.color}
        darkGlyph={app.darkGlyph}
        title={app.name}
        subtitle={<AppSubtitle extra="4 versões publicadas esta semana" />}
      />

      <Panel title="Esta semana">
        <Row
          id="v2.14.1"
          title="Midaz · Console"
          sub="correções de UI + p50 -18ms"
          right={<Badge variant="success">Publicada</Badge>}
        />
        <Row
          id="v2.14.0"
          title="Midaz · Ledger"
          sub="novo endpoint de portfolios"
          right={<Badge variant="success">Publicada</Badge>}
        />
        <Row
          id="v1.3.0"
          title="Plugin · Reporter"
          sub="exportação CSV agendada"
          right={<Badge variant="success">Publicada</Badge>}
        />
        <Row
          id="v0.9.2"
          title="Plugin · Fireflies"
          sub="ingestão de reuniões"
          right={<Badge variant="info">Canary</Badge>}
        />
      </Panel>
    </PageContainer>
  );
}
