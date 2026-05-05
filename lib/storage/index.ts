import { isSupabaseConfigured } from "@/lib/supabase/config";
import { localBackend } from "./local";
import { supabaseBackend } from "./supabase";

export const storage = isSupabaseConfigured ? supabaseBackend : localBackend;
export { isSupabaseConfigured };
export type { EventoDados, Endereco, EventStatus, StorageBackend } from "./types";
