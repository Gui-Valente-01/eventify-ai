export type CampoBriefing = {
  id: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "url";
  required?: boolean;
  hint?: string;
  maxLength?: number;
};

export type EventoTipoSchema = {
  tipo: string;
  titulo: string;
  subtitulo: string;
  campos: CampoBriefing[];
};

const CASAMENTO: EventoTipoSchema = {
  tipo: "Casamento",
  titulo: "Detalhes do casamento",
  subtitulo: "Conte a história de vocês — quanto mais detalhe, mais único o site fica.",
  campos: [
    { id: "noivos", label: "Nomes do casal", placeholder: "Ex: Mariana & Lucas", type: "text", required: true, maxLength: 120 },
    { id: "historia", label: "Como vocês se conheceram?", placeholder: "Conte a história em poucas linhas", type: "textarea", maxLength: 800, hint: "A IA usa isso pra escrever a seção 'Nossa história'." },
    { id: "pedido", label: "Como foi o pedido de casamento?", placeholder: "Local, data, quem pediu...", type: "textarea", maxLength: 600 },
    { id: "cerimonia", label: "Cerimônia", placeholder: "Ex: 16h, igreja matriz / civil ao ar livre", type: "text", maxLength: 200 },
    { id: "festa", label: "Festa/recepção", placeholder: "Ex: 19h, salão X, jantar e pista", type: "text", maxLength: 200 },
    { id: "dressCode", label: "Dress code", placeholder: "Ex: passeio completo, tons claros", type: "text", maxLength: 120 },
    { id: "presentes", label: "Lista de presentes / PIX", placeholder: "Link da lista ou chave PIX", type: "text", maxLength: 240, hint: "Aparece como botão 'Presentear'." },
    { id: "padrinhos", label: "Padrinhos e madrinhas", placeholder: "Separe por vírgula", type: "textarea", maxLength: 400 },
    { id: "hospedagem", label: "Sugestão de hospedagem", placeholder: "Hotéis parceiros, descontos", type: "textarea", maxLength: 400 },
    { id: "instagram", label: "Hashtag / Instagram", placeholder: "#MariEhLucas2026", type: "text", maxLength: 80 },
  ],
};

const ANIVERSARIO: EventoTipoSchema = {
  tipo: "Aniversário",
  titulo: "Detalhes do aniversário",
  subtitulo: "Quem é o aniversariante e como vai ser a festa?",
  campos: [
    { id: "aniversariante", label: "Nome do aniversariante", placeholder: "Ex: Sofia", type: "text", required: true, maxLength: 120 },
    { id: "idade", label: "Idade que está completando", placeholder: "Ex: 30", type: "text", maxLength: 20 },
    { id: "tema", label: "Tema da festa", placeholder: "Ex: anos 80, jardim encantado, neon", type: "text", maxLength: 120 },
    { id: "horario", label: "Horário", placeholder: "Ex: das 20h às 02h", type: "text", maxLength: 120 },
    { id: "atracoes", label: "Atrações / programação", placeholder: "DJ, banda, jantar, parabéns às 22h...", type: "textarea", maxLength: 800 },
    { id: "dressCode", label: "Dress code", placeholder: "Ex: black tie, casual chic, cores quentes", type: "text", maxLength: 120 },
    { id: "presentes", label: "Lista de presentes / PIX", placeholder: "Link ou chave PIX (opcional)", type: "text", maxLength: 240 },
    { id: "frase", label: "Frase ou mensagem do aniversariante", placeholder: "Algo pra abrir o site, em primeira pessoa", type: "textarea", maxLength: 400 },
  ],
};

const CORPORATIVO: EventoTipoSchema = {
  tipo: "Evento Corporativo",
  titulo: "Detalhes do evento corporativo",
  subtitulo: "Informações que dão credibilidade e ajudam o convidado a se preparar.",
  campos: [
    { id: "empresa", label: "Empresa organizadora", placeholder: "Ex: Acme Tech", type: "text", required: true, maxLength: 120 },
    { id: "objetivo", label: "Objetivo do evento", placeholder: "Ex: lançamento de produto, summit anual, kick-off", type: "text", required: true, maxLength: 200 },
    { id: "publicoAlvo", label: "Público-alvo", placeholder: "Ex: clientes enterprise, parceiros, imprensa", type: "text", maxLength: 200 },
    { id: "agenda", label: "Agenda / programação", placeholder: "09h Credenciamento\n10h Abertura\n11h Palestra X...", type: "textarea", required: true, maxLength: 1500, hint: "Use uma linha por bloco." },
    { id: "palestrantes", label: "Palestrantes / convidados-chave", placeholder: "Nome — cargo — empresa, separar por linha", type: "textarea", maxLength: 1000 },
    { id: "patrocinadores", label: "Patrocinadores / parceiros", placeholder: "Separe por vírgula", type: "textarea", maxLength: 600 },
    { id: "linkInscricao", label: "Link de inscrição externa (opcional)", placeholder: "https://...", type: "url", maxLength: 240 },
    { id: "contato", label: "Contato (e-mail/telefone)", placeholder: "eventos@empresa.com", type: "text", maxLength: 200 },
  ],
};

const FESTA: EventoTipoSchema = {
  tipo: "Festa",
  titulo: "Detalhes da festa",
  subtitulo: "Line-up, ingressos e regras pra deixar tudo claro.",
  campos: [
    { id: "nomeFestival", label: "Nome / edição", placeholder: "Ex: Pulse Festival 2026 — Edição Verão", type: "text", maxLength: 160 },
    { id: "horario", label: "Horário", placeholder: "Ex: das 22h às 06h", type: "text", maxLength: 120 },
    { id: "lineup", label: "Line-up por horário", placeholder: "22h DJ A\n00h DJ B\n02h Live act C", type: "textarea", required: true, maxLength: 1200 },
    { id: "ingressos", label: "Ingressos / lotes", placeholder: "1º lote R$80, 2º R$120, na hora R$150", type: "textarea", maxLength: 600 },
    { id: "linkIngresso", label: "Link de venda de ingresso (opcional)", placeholder: "https://...", type: "url", maxLength: 240 },
    { id: "idadeMinima", label: "Idade mínima", placeholder: "Ex: +18", type: "text", maxLength: 20 },
    { id: "regras", label: "Regras / o que levar", placeholder: "Documento com foto obrigatório, sem garrafas...", type: "textarea", maxLength: 600 },
    { id: "estrutura", label: "Estrutura / atrações extras", placeholder: "Food trucks, área VIP, fotógrafo...", type: "textarea", maxLength: 600 },
  ],
};

const RELIGIOSO: EventoTipoSchema = {
  tipo: "Religioso",
  titulo: "Detalhes do evento religioso",
  subtitulo: "Tradições e mensagens que dão alma ao site.",
  campos: [
    { id: "ocasiao", label: "Ocasião", placeholder: "Ex: batismo, primeira comunhão, bar mitzvá", type: "text", required: true, maxLength: 160 },
    { id: "homenageado", label: "Homenageado(s)", placeholder: "Nome de quem está sendo celebrado", type: "text", required: true, maxLength: 160 },
    { id: "celebrante", label: "Celebrante / oficiante", placeholder: "Padre/pastor/rabino — nome", type: "text", maxLength: 200 },
    { id: "horario", label: "Horário da cerimônia", placeholder: "Ex: 10h", type: "text", maxLength: 120 },
    { id: "liturgia", label: "Programação litúrgica", placeholder: "Entrada, leitura, homilia, bênção...", type: "textarea", maxLength: 1000 },
    { id: "versiculo", label: "Versículo / mensagem central", placeholder: "Texto sagrado ou frase que guia a celebração", type: "textarea", maxLength: 600 },
    { id: "padrinhos", label: "Padrinhos / testemunhas", placeholder: "Separe por vírgula", type: "textarea", maxLength: 400 },
    { id: "recepcao", label: "Recepção / confraternização", placeholder: "Local, horário, detalhes", type: "textarea", maxLength: 400 },
  ],
};

const SCHEMAS: Record<string, EventoTipoSchema> = {
  Casamento: CASAMENTO,
  "Aniversário": ANIVERSARIO,
  "Evento Corporativo": CORPORATIVO,
  Festa: FESTA,
  Religioso: RELIGIOSO,
};

export function getBriefingSchema(tipo: string): EventoTipoSchema | null {
  return SCHEMAS[tipo] ?? null;
}

export const TIPOS_EVENTO = Object.keys(SCHEMAS);
