// app/(auth)/register/register-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, Eye, EyeOff, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PASSWORD_RULES = [
  {
    label: "Минимум 6 символов",
    test: (pw: string) => pw.length >= 6,
  },
  {
    label: "Заглавная буква",
    test: (pw: string) => /[A-ZА-ЯЁ]/.test(pw),
  },
  {
    label: "Строчная буква",
    test: (pw: string) => /[a-zа-яё]/.test(pw),
  },
  {
    label: "Цифра",
    test: (pw: string) => /\d/.test(pw),
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("CLIENT");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const allPasswordChecksPassed = passwordChecks.every((c) => c.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    allPasswordChecksPassed &&
    passwordsMatch &&
    agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allPasswordChecksPassed) {
      setError("Пароль не соответствует требованиям");
      return;
    }

    if (!passwordsMatch) {
      setError("Пароли не совпадают");
      return;
    }

    if (!agreedToTerms) {
      setError("Необходимо принять пользовательское соглашение");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Аккаунт создан, но не удалось войти автоматически");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1E2A44]">
            <Scale className="size-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#1E2A44]">Pactum</span>
        </Link>
        <CardTitle className="text-2xl font-bold">Создание аккаунта</CardTitle>
        <CardDescription>
          Заполните форму для регистрации в системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Имя */}
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {/* Пароль */}
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Придумайте пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2 space-y-1.5 rounded-lg bg-slate-50 p-3">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    {check.passed ? (
                      <Check className="size-3.5 text-green-600" />
                    ) : (
                      <X className="size-3.5 text-slate-400" />
                    )}
                    <span
                      className={
                        check.passed ? "text-green-700" : "text-slate-500"
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`h-11 pr-10 ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? "border-green-500 focus-visible:ring-green-500"
                      : "border-red-400 focus-visible:ring-red-400"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-sm text-red-500">Пароли не совпадают</p>
            )}
            {passwordsMatch && (
              <p className="flex items-center gap-1 text-sm text-green-600">
                <Check className="size-3.5" />
                Пароли совпадают
              </p>
            )}
          </div>

          {/* Роль */}
          <div className="space-y-2">
            <Label htmlFor="role">Кто вы?</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="CLIENT">Клиент — ищу юридические услуги</option>
              <option value="LAWYER">
                Юрист — оказываю юридические услуги
              </option>
            </select>
          </div>

          {/* Согласие с правилами */}
          <div className="space-y-2">
            <label
              htmlFor="terms"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-50"
            >
              <div className="relative mt-0.5 flex shrink-0">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="peer size-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-colors checked:border-[#1E2A44] checked:bg-[#1E2A44] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Check className="pointer-events-none absolute left-0.5 top-0.5 hidden size-3 text-white peer-checked:block" />
              </div>
              <span className="text-sm leading-snug text-slate-600">
                Я ознакомился(-ась) и принимаю{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-[#1E2A44] underline underline-offset-4 hover:text-[#162033]"
                  onClick={(e) => e.stopPropagation()}
                >
                  Пользовательское соглашение
                </Link>{" "}
                и даю согласие на обработку персональных данных
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-[#1E2A44] text-base hover:bg-[#162033]"
            disabled={loading || !isFormValid}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-medium text-[#1E2A44] underline underline-offset-4"
            >
              Войти
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
