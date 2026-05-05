import type { EventStatus } from "@/lib/storage/types";

export const PUBLISHABLE_STATUSES: EventStatus[] = ["paid", "published"];

export function isPublishedStatus(status?: EventStatus | string | null) {
  return status === "paid" || status === "published";
}

export function normalizeStatus(status?: EventStatus | string | null): EventStatus {
  if (
    status === "draft" ||
    status === "preview" ||
    status === "paid" ||
    status === "published" ||
    status === "archived"
  ) {
    return status;
  }
  return "preview";
}

export function getStatusLabel(status?: EventStatus | string | null) {
  const normalized = normalizeStatus(status);
  const labels: Record<EventStatus, string> = {
    draft: "Rascunho",
    preview: "Preview",
    paid: "Pago",
    published: "Publicado",
    archived: "Arquivado",
  };
  return labels[normalized];
}
