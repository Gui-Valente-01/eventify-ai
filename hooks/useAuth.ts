"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Status = "loading" | "ready";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("ready");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("ready");
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setStatus("ready");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    signOut,
  };
}
