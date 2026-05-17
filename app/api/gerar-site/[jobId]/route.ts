import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs/generationJobs";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await ctx.params;
  if (!jobId) {
    return NextResponse.json({ error: "jobId obrigatório" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job não encontrado" }, { status: 404 });
  }

  if (job.user_id !== user.id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    output: job.status === "done" ? job.output : null,
    error: job.error,
    createdAt: job.created_at,
    startedAt: job.started_at,
    completedAt: job.completed_at,
  });
}
