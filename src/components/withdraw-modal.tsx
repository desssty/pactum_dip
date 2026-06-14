"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Building2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
};

type Stage = "form" | "processing" | "success" | "error";

export function WithdrawModal({ open, onClose, amount, onSuccess }: Props) {
  const [stage, setStage] = useState<Stage>("form");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bik, setBik] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    if (stage === "processing") return;
    setStage("form");
    setBankName("");
    setAccountNumber("");
    setBik("");
    setErrorMessage("");
    onClose();
  };

  const validate = (): string | null => {
    if (bankName.trim().length < 3) return "Введите название банка";
    if (accountNumber.replace(/\s/g, "").length !== 20)
      return "Номер счёта должен содержать 20 цифр";
    if (bik.replace(/\s/g, "").length !== 9)
      return "БИК должен содержать 9 цифр";
    return null;
  };

  const handleWithdraw = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setStage("processing");

    try {
      const res = await fetch("/api/lawyer/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Ошибка вывода");
        setStage("error");
        setTimeout(handleClose, 2500);
        return;
      }

      setStage("success");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1800);
    } catch {
      setErrorMessage("Ошибка сети. Проверьте подключение.");
      setStage("error");
      setTimeout(handleClose, 2500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#1E2A44]">
              <Building2 className="size-4 text-white" />
            </div>
            Вывод средств
          </DialogTitle>
          <DialogDescription>
            Сумма вывода:{" "}
            <span className="font-semibold text-slate-800">
              {amount.toLocaleString("ru-RU")} ₽
            </span>
          </DialogDescription>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4">
            {/* Предупреждение */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                Убедитесь, что реквизиты указаны верно. Средства будут зачислены
                в течение 1–3 рабочих дней.
              </p>
            </div>

            {/* Название банка */}
            <div className="space-y-1">
              <Label>Название банка</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Сбербанк"
                autoComplete="off"
              />
            </div>

            {/* Номер счёта */}
            <div className="space-y-1">
              <Label>Номер расчётного счёта (20 цифр)</Label>
              <Input
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 20),
                  )
                }
                placeholder="40817810000000000000"
                inputMode="numeric"
                className="font-mono tracking-wider"
              />
            </div>

            {/* БИК */}
            <div className="space-y-1">
              <Label>БИК банка (9 цифр)</Label>
              <Input
                value={bik}
                onChange={(e) =>
                  setBik(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                placeholder="044525225"
                inputMode="numeric"
                className="font-mono tracking-wider"
              />
            </div>

            {/* Тестовые реквизиты */}
            <div className="rounded-xl bg-slate-50 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Тестовые реквизиты
              </p>
              <button
                type="button"
                onClick={() => {
                  setBankName("Сбербанк");
                  setAccountNumber("40817810099910004312");
                  setBik("044525225");
                }}
                className="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <span className="font-medium">Сбербанк</span>
                <span className="ml-2 text-slate-400">
                  р/с 40817810099910004312 · БИК 044525225
                </span>
              </button>
            </div>

            {/* Кнопки */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1 bg-[#1E2A44] hover:bg-[#162033]"
              >
                Вывести {amount.toLocaleString("ru-RU")} ₽
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400">
              Тестовый режим · Реальное списание не происходит
            </p>
          </div>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center py-14">
            <Loader2 className="mb-4 size-12 animate-spin text-[#1E2A44]" />
            <p className="text-lg font-semibold">Создаём заявку...</p>
            <p className="mt-2 text-sm text-slate-500">
              Пожалуйста, не закрывайте окно
            </p>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">Заявка принята!</p>
            <p className="mt-2 text-center text-sm text-slate-500">
              {amount.toLocaleString("ru-RU")} ₽ поступят на счёт
              <br />в течение 1–3 рабочих дней
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-red-50">
              <XCircle className="size-12 text-red-600" />
            </div>
            <p className="text-xl font-bold text-slate-900">Ошибка вывода</p>
            <p className="mt-2 text-sm text-slate-500">
              {errorMessage || "Попробуйте ещё раз"}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
