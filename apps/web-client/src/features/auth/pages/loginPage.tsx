import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <>
      <div className="bg-muted flex w-full h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-row gap-2 justify-center items-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-black">email test:</span> test@testing.com
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-black">password test:</span> testing123
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
