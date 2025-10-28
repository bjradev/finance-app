import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <>
      <div className="bg-muted flex w-full h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
