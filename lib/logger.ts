// Logger estruturado — saída JSON em uma linha pra Vercel/CloudWatch
// agrupar por scope/level. Em dev, console.error já mostra de forma legível.

type Level = "info" | "warn" | "error";

type LogPayload = {
  timestamp: string;
  level: Level;
  scope: string;
  message: string;
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
};

function serialize(level: Level, scope: string, message: string, data?: Record<string, unknown>, error?: unknown): string {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
  };
  if (data) payload.data = data;
  if (error instanceof Error) {
    payload.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  } else if (error !== undefined) {
    payload.error = { name: "Unknown", message: String(error) };
  }
  return JSON.stringify(payload);
}

export const logger = {
  info(scope: string, message: string, data?: Record<string, unknown>) {
    console.log(serialize("info", scope, message, data));
  },
  warn(scope: string, message: string, data?: Record<string, unknown>) {
    console.warn(serialize("warn", scope, message, data));
  },
  error(scope: string, message: string, error?: unknown, data?: Record<string, unknown>) {
    console.error(serialize("error", scope, message, data, error));

    // Persiste em error_logs via service_role (fire-and-forget).
    // Só roda no server — nunca tenta importar no client.
    if (typeof window === "undefined") {
      void persistServerError(scope, message, error, data);
    }
  },
};

async function persistServerError(
  scope: string,
  message: string,
  error: unknown,
  data?: Record<string, unknown>
) {
  try {
    // Lazy import pra evitar bundle no client
    const { reportError } = await import("@/lib/errorReporter");
    const errObj =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error !== undefined
          ? { name: "Unknown", message: String(error) }
          : null;

    await reportError({
      scope,
      level: "error",
      message,
      errorName: errObj?.name,
      errorMessage: errObj?.message,
      stack: errObj?.stack,
      context: data,
    });
  } catch {
    // Nunca quebra o logger
  }
}
