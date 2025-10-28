import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      toast.success(
        "Cuenta creada correctamente, revisa tu correo para verificar tu cuenta"
      );
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Error al crear la cuenta, intenta nuevamente"
      );
    },
  });
};
