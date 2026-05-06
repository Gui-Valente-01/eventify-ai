import type { EventTemplate } from "@/lib/templates";

export type AgentStatus = "ok" | "warning" | "error";

export type AgentStep = {
  id: string;
  agent: string;
  category: "product" | "marketing" | "monetization" | "internal" | "support";
  status: AgentStatus;
  summary: string;
  output?: Record<string, unknown>;
};

export type AgentEvento = {
  id?: string;
  nome: string;
  tipo: string;
  data: string;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
  };
  imagem?: string;
  selectedPlan?: string;
  briefing?: {
    estilo?: string;
    clima?: string;
    publico?: string;
    corPrincipal?: string;
    descricao?: string;
    detalhes?: Record<string, string>;
    planoSelecionado?: string;
  };
  convidados?: string[];
};

export type InterpretationOutput = {
  mood: string;
  styleDirection: string;
  audience: string;
  specificity: "low" | "medium" | "high";
  mustUseDetails: string[];
  risks: string[];
};

export type DesignPalette = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
};

export type DesignSpec = {
  palette: DesignPalette;
  fontDisplay: string;     // Família de fonte do display (com fallback)
  fontBody: string;
  scale: { h1: string; h2: string; h3: string; body: string };
  radius: { card: string; button: string };
  spacing: { sectionY: string; cardPad: string; gap: string };
  motionRules: string[];   // Diretivas concretas de animação
};

export type DesignOutput = {
  template: EventTemplate;
  layoutIntent: string;
  typography: {
    display: string;
    body: string;
  };
  visualRules: string[];
  differentiators: string[];
  spec: DesignSpec;
};

export type CopyOutput = {
  heroTitle: string;
  subtitle: string;
  description: string;
  invitationMessage: string;
  highlights: string[];
  ctaLabel: string;
  seoTitle: string;
  seoDescription: string;
};

export type LocationOutput = {
  address: string;
  mapUrl: string;
  confidence: "missing" | "partial" | "complete";
  issues: string[];
};

export type GuestOutput = {
  total: number;
  unique: number;
  duplicates: string[];
  normalizedGuests: string[];
};

export type ImageOutput = {
  mode: "uploaded" | "generated-placeholder";
  source: string;
  prompt: string;
  usageHint: string;
};

export type BuilderOutput = {
  sections: string[];
  qrTarget: string;
  publishReady: boolean;
  missingBlocks: string[];
};

export type QualityOutput = {
  score: number;
  level: "draft" | "good" | "premium";
  passed: string[];
  warnings: string[];
  blockers: string[];
  recommendations: string[];
};

export type BusinessOutput = {
  salesHooks: string[];
  upsells: string[];
  seoKeywords: string[];
  socialPosts: string[];
  nextActions: string[];
};

export type AgentRunSummary = {
  id: string;
  mode: "local" | "ai-assisted";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  eventType: string;
  templateId: string;
  agents: AgentStep[];
  interpretation: InterpretationOutput;
  design: Omit<DesignOutput, "template"> & {
    templateId: string;
    templateName: string;
  };
  location: LocationOutput;
  guests: GuestOutput;
  image: ImageOutput;
  builder: BuilderOutput;
  quality: QualityOutput;
  business: BusinessOutput;
};

export type AgentSiteOutput = CopyOutput & {
  templateId: string;
  templateName: string;
  layout: string;
  palette: EventTemplate["palette"];
  generatedBy: "local-agent";
  qualityScore: number;
  qualityWarnings: string[];
  businessSuggestions: string[];
  agentRun: AgentRunSummary;
};

export type AgentCompanyResult = {
  siteGerado: AgentSiteOutput;
  agentRun: AgentRunSummary;
  promptContext: string;
};
