// app/(auth)/register/page.tsx
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Регистрация — Pactum",
  description: "Создайте аккаунт в Pactum",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <RegisterForm />
    </div>
  );
}
