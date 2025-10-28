// features/auth/services/profileService.ts
import { supabaseClient } from "@/shared/lib/supabaseClient";
import type { ProfileData } from "@/shared/types/user.types";

export async function fetchMyProfile(userId: string): Promise<ProfileData> {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, name, default_currency")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    throw new Error("Profile not found");
  }

  return {
    id: data.id,
    name: data.name,
    defaultCurrency: data.default_currency,
  };
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<ProfileData, "name" | "defaultCurrency">>
) {
  const { error } = await supabaseClient
    .from("profiles")
    .update({
      name: updates.name,
      default_currency: updates.defaultCurrency,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}
