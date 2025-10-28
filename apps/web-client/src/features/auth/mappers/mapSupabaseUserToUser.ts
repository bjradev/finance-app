import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/shared/types/user.types";

export const mapSupabaseUserToUser = (
  supabaseUser: SupabaseUser | null
): User => {
  const metadata =
    (supabaseUser?.user_metadata as Record<string, string>) || {};

  return {
    id: supabaseUser?.id ?? "",
    email: supabaseUser?.email ?? "",
    name: metadata.name ?? supabaseUser?.email?.split("@")[0] ?? "",
    role: metadata.role ?? "user",
  };
};
