import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import { fetchMyProfile } from "../services/profileService";
import { useAuthStore } from "@/app/store/authStore";
import { mapSupabaseUserToUser } from "../mappers/mapSupabaseUserToUser";

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authService.login,

    onSuccess: async (response) => {
      if (!response.data?.user) {
        throw new Error("No user data received from authentication");
      }

      const { user: supabaseUser, session } = response.data;
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("No access token received from authentication");
      }

      // Validar que el email haya sido verificado
      if (!supabaseUser.email_confirmed_at) {
        throw new Error("Email not confirmed");
      }

      // Mapear usuario de Supabase al tipo User del dominio
      const user = mapSupabaseUserToUser(supabaseUser);

      try {
        // Obtener perfil adicional del usuario
        const profile = await fetchMyProfile(user.id);

        // Actualizar user con datos del perfil
        const userWithProfile = {
          ...user,
          name: profile.name,
          defaultCurrency: profile.defaultCurrency,
        };

        setAuth(userWithProfile, accessToken, profile.defaultCurrency);
        toast.success(`¡Bienvenido, ${userWithProfile.name}!`);
      } catch (profileError) {
        console.warn("Failed to fetch profile:", profileError);
        // Continuar con login incluso si el perfil falla
        setAuth(user, accessToken);
        toast.success(`¡Bienvenido, ${user.name}!`);
      }

      navigate("/dashboard");
    },

    onError: (error: Error) => {
      if (error.message === "Email not confirmed") {
        toast.warning(
          "Tu correo electrónico aún no ha sido verificado. Revisa tu bandeja de entrada para confirmar tu cuenta."
        );
        return;
      }

      console.error("Login error:", error);
      toast.error(error.message || "Error al iniciar sesión");
    },
  });
};
