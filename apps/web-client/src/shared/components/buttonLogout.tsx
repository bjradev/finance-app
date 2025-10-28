import { Button } from "./ui/button";
import { authService } from "@/features/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";

export const ButtonLogout = () => {
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      toast.success("Sesión cerrada correctamente");
      useAuthStore.getState().clearAuth();
      navigate("/");
    },
  });
  return (
    <Button
      variant="destructive"
      onClick={async () => {
        logoutMutation.mutate();
      }}
    >
      Cerrar sesión
    </Button>
  );
};
