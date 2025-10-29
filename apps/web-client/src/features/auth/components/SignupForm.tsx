import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useSignup } from "../hooks/useSignup";
import { signupSchema } from "../validation/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { SignupFormData } from "../types/auth.types";
import { Spinner } from "@/shared/components/ui/spinner";

export const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const signupMutation = useSignup();

  const onSubmit = (data: SignupFormData) => {
    // Pasar solo los campos necesarios para SignupCredentials
    const { name, email, password } = data;
    signupMutation.mutate({ name, email, password });
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">🏦 Finance App</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre y apellido</FieldLabel>
                <Input
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                </div>
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="************"
                  required
                />

                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="passwordConfirm">
                    Confirmar contraseña
                  </FieldLabel>
                </div>
                <Input
                  {...register("passwordConfirm")}
                  id="passwordConfirm"
                  type="password"
                  placeholder="************"
                  required
                />

                {errors.passwordConfirm && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? (
                    <>
                      <Spinner /> Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  ¿Ya tienes una cuenta? <a href="/">Inicia sesión</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
