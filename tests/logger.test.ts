import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("info → console.log com JSON estruturado", () => {
    logger.info("test", "hello");
    expect(logSpy).toHaveBeenCalledOnce();
    const arg = logSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("info");
    expect(parsed.scope).toBe("test");
    expect(parsed.message).toBe("hello");
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("warn → console.warn", () => {
    logger.warn("scope-x", "ops", { foo: "bar" });
    expect(warnSpy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(warnSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe("warn");
    expect(parsed.data).toEqual({ foo: "bar" });
  });

  it("error com Error inclui name, message e stack", () => {
    const err = new Error("boom");
    logger.error("scope-y", "falhou", err);
    expect(errorSpy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.error.name).toBe("Error");
    expect(parsed.error.message).toBe("boom");
    expect(parsed.error.stack).toBeDefined();
  });

  it("error com unknown serializa via String()", () => {
    logger.error("s", "msg", "string-error");
    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.error.name).toBe("Unknown");
    expect(parsed.error.message).toBe("string-error");
  });

  it("info sem data não inclui campo data", () => {
    logger.info("s", "m");
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.data).toBeUndefined();
  });
});
