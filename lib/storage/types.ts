import type { GeneratedSite } from "@/lib/siteAgent";

export type Endereco = {
  cep?: string;
  rua?: string;
  numero?: string;
  cidade?: string;
  estado?: string;
};

export type Briefing = {
  estilo?: string;
  clima?: string;
  publico?: string;
  corPrincipal?: string;
  descricao?: string;
  detalhes?: Record<string, string>;
  planoSelecionado?: string;
  /** ID do template visual selecionado na galeria (lib/templateGallery). */
  templateId?: string;
  /** Customização salva (cores + fontes) — sobrescreve as defaults do template. */
  customTemplate?: {
    nome?: string;
    paleta?: string[]; // [fundo, superficie, ?, texto, acento]
    fontDisplayId?: string;
    fontBodyId?: string;
    /** Profile da última análise por referência. */
    referenceProfile?: {
      vibe: string;
      estilo: string;
      inspiracaoParaIA: string;
    };
    salvoEm?: string; // ISO datetime
  };
};

export type EventStatus = "draft" | "preview" | "paid" | "published" | "archived";

export type EventoDados = {
  id?: string;
  nome: string;
  tipo: string;
  data: string;
  status?: EventStatus;
  endereco?: Endereco;
  imagem?: string;
  selectedPlan?: string;
  briefing?: Briefing;
  convidados?: string[];
  siteGerado?: GeneratedSite;
  siteHtml?: string;
  ownerId?: string;
  paidAt?: string;
  publishedAt?: string;
  paidPlan?: string;
};

export type StorageBackend = {
  list(): Promise<EventoDados[]>;
  getBySlug(slug: string): Promise<EventoDados | null>;
  create(evento: EventoDados): Promise<EventoDados>;
  update(id: string, partial: Partial<EventoDados>): Promise<EventoDados>;
  remove(id: string): Promise<void>;
  addConvidado(eventoId: string, nome: string): Promise<void>;
  removeConvidado(eventoId: string, nome: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
};
