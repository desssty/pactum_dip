// app/(auth)/login/page.tsx
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Вход — Pactum",
  description: "Войдите в свой аккаунт Pactum",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
