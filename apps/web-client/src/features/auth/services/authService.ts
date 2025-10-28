import { supabaseClient } from "@/shared/lib/supabaseClient";
import type { LoginCredentials, SignupCredentials } from "../types/auth.types";

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await supabaseClient.auth.signInWithPassword(credentials);

    if (response.error?.message === "Invalid login credentials") {
      throw new Error("Correo electrónico o contraseña incorrectos");
    }

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  },

  signup: async (credentials: SignupCredentials) => {
    const { name, email, password } = credentials;

    const response = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  },

  logout: () => supabaseClient.auth.signOut(),
};
