export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .replace(/ /g, "-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function formatarData(data?: string): string {
  if (!data) return "Data a confirmar";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${data}T00:00:00`));
  } catch {
    return data;
  }
}

export function getTemplateId(
  evento?: { tipo?: string; siteGerado?: { templateId?: string } } | null
): string {
  const tipo = (evento?.tipo || "").toLowerCase();
  if (evento?.siteGerado?.templateId) return evento.siteGerado.templateId;
  if (tipo.includes("casamento")) return "casamento";
  if (tipo.includes("anivers")) return "aniversario";
  if (tipo.includes("corporativo") || tipo.includes("empresa")) return "corporativo";
  if (tipo.includes("relig")) return "religioso";
  return "festa";
}

export function mascararCEP(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function dataMinimaHoje(): string {
  return new Date().toISOString().split("T")[0];
}

export async function buscarCEP(
  valorCep: string
): Promise<{ logradouro: string; localidade: string; uf: string } | null> {
  const cepLimpo = valorCep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await res.json();
    if (dados.erro) return null;
    return dados;
  } catch {
    return null;
  }
}
