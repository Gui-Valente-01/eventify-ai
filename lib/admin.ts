import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminContext = {
  userId: string;
  email: string;
};

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login?next=/admin");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/acesso-negado");

  return { userId: user.id, email: user.email ?? "" };
}
