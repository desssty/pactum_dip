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
import { CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
};

type Stage = "form" | "processing" | "success" | "error";

export function PaymentModal({ open, onClose, amount, onSuccess }: Props) {
  const [stage, setStage] = useState<Stage>("form");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const formatCardNumber = (v: string) => {
    return v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async () => {
    // Простая валидация
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Введите номер карты (16 цифр)");
      return;
    }
    if (cardExpiry.length !== 5) {
      toast.error("Введите срок действия (ММ/ГГ)");
      return;
    }
    if (cardCvc.length !== 3) {
      toast.error("Введите CVC (3 цифры)");
      return;
    }
    if (cardName.trim().length < 3) {
      toast.error("Введите имя владельца карты");
      return;
    }

    setStage("processing");

    try {
      // Реальный запрос на сервер
      const res = await fetch("/api/client/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStage("error");
        setTimeout(() => {
          toast.error(json.error || "Ошибка оплаты");
          handleClose();
        }, 1500);
        return;
      }

      setStage("success");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch {
      setStage("error");
      setTimeout(() => {
        toast.error("Ошибка сети");
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setStage("form");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-md bg-purple-600 px-2 py-1 text-xs font-bold text-white">
              ЮKassa
            </div>
            Оплата картой
          </DialogTitle>
          <DialogDescription>
            Сумма к оплате: {amount.toLocaleString("ru-RU")} ₽
          </DialogDescription>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4">
            {/* Визуализация карты */}
            <div className="relative h-44 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <CreditCard className="size-8 opacity-70" />
                <span className="text-sm opacity-70">VISA</span>
              </div>
              <div className="mt-6 font-mono text-lg tracking-wider">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>
              <div className="mt-4 flex justify-between text-xs">
                <div>
                  <p className="opacity-60">Владелец</p>
                  <p className="uppercase">{cardName || "IVAN IVANOV"}</p>
                </div>
                <div>
                  <p className="opacity-60">Срок</p>
                  <p>{cardExpiry || "ММ/ГГ"}</p>
                </div>
              </div>
            </div>

            {/* Поля ввода */}
            <div>
              <Label>Номер карты</Label>
              <Input
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                placeholder="4444 4444 4444 4444"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Срок действия</Label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="ММ/ГГ"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label>CVC</Label>
                <Input
                  value={cardCvc}
                  onChange={(e) =>
                    setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  placeholder="123"
                  inputMode="numeric"
                  type="password"
                />
              </div>
            </div>

            <div>
              <Label>Имя владельца</Label>
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="IVAN IVANOV"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handlePay}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Оплатить {amount.toLocaleString("ru-RU")} ₽
              </Button>
            </div>
          </div>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 size-12 animate-spin text-purple-600" />
            <p className="text-lg font-medium">Обработка платежа...</p>
            <p className="mt-2 text-sm text-slate-500">Не закрывайте окно</p>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-4 size-16 text-green-600" />
            <p className="text-lg font-medium">Оплата прошла успешно!</p>
            <p className="mt-2 text-sm text-slate-500">
              Баланс пополнен на {amount.toLocaleString("ru-RU")} ₽
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="mb-4 size-16 text-red-600" />
            <p className="text-lg font-medium">Ошибка оплаты</p>
            <p className="mt-2 text-sm text-slate-500">Попробуйте ещё раз</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
