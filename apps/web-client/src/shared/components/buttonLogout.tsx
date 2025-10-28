import { Button } from "./ui/button";
import { authService } from "@/features/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { LogOutIcon } from "lucide-react";
import { Spinner } from "./ui/spinner";

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
      className="bg-[#FD4745]/90 hover:bg-[#FD4745]"
      onClick={async () => {
        logoutMutation.mutate();
      }}
    >
      {logoutMutation.isPending ? (
        <Spinner className="w-4 h-4 animate-spin" />
      ) : (
        <LogOutIcon className="w-4 h-4" />
      )}
    </Button>
  );
};
