import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type JobStatus = "pending" | "running" | "done" | "failed" | "stale";

export type GenerationJob = {
  id: string;
  user_id: string | null;
  evento_id: string | null;
  status: JobStatus;
  input: unknown;
  output: unknown | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

const STALE_AFTER_MS = 5 * 60 * 1000;

function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function createJob(args: {
  userId: string;
  eventoId: string | null;
  input: unknown;
}): Promise<GenerationJob | null> {
  const supa = adminClient();
  if (!supa) return null;
  const { data, error } = await supa
    .from("generation_jobs")
    .insert({
      user_id: args.userId,
      evento_id: args.eventoId,
      input: args.input,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data as GenerationJob;
}

export async function getJob(jobId: string): Promise<GenerationJob | null> {
  const supa = adminClient();
  if (!supa) return null;
  const { data, error } = await supa
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (error) return null;

  if (data && data.status === "running" && data.started_at) {
    const ageMs = Date.now() - new Date(data.started_at).getTime();
    if (ageMs > STALE_AFTER_MS) {
      await supa
        .from("generation_jobs")
        .update({ status: "stale" })
        .eq("id", jobId)
        .eq("status", "running");
      data.status = "stale";
    }
  }

  return data as GenerationJob | null;
}

export async function markRunning(jobId: string): Promise<void> {
  const supa = adminClient();
  if (!supa) return;
  await supa
    .from("generation_jobs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", jobId);
}

export async function markDone(jobId: string, output: unknown): Promise<void> {
  const supa = adminClient();
  if (!supa) return;
  await supa
    .from("generation_jobs")
    .update({
      status: "done",
      output,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

export async function markFailed(jobId: string, error: string): Promise<void> {
  const supa = adminClient();
  if (!supa) return;
  await supa
    .from("generation_jobs")
    .update({
      status: "failed",
      error,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}
