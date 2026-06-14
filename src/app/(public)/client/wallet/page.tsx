"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpFromLine,
  CreditCard,
} from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
  booking: { serviceTitleSnapshot: string } | null;
};

const TX_CONFIG: Record<
  string,
  { label: string; icon: typeof TrendingUp; className: string; sign: string }
> = {
  DEPOSIT: {
    label: "Пополнение",
    icon: TrendingUp,
    className: "text-green-600",
    sign: "+",
  },
  BOOKING_PAYMENT: {
    label: "Оплата",
    icon: TrendingDown,
    className: "text-red-600",
    sign: "−",
  },
  BOOKING_REFUND: {
    label: "Возврат",
    icon: TrendingUp,
    className: "text-blue-600",
    sign: "+",
  },
};

const QUICK_AMOUNTS = [500, 1000, 3000, 5000];

export default function ClientWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/wallet");
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Итоговая сумма: кастомная или выбранная
  const payAmount =
    customAmount !== "" ? parseFloat(customAmount) || 0 : (selectedAmount ?? 0);

  const handleOpenModal = () => {
    if (!payAmount || payAmount <= 0) {
      toast.error("Укажите сумму пополнения");
      return;
    }
    if (payAmount > 1_000_000) {
      toast.error("Максимальная сумма — 1 000 000 ₽");
      return;
    }
    setModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast.success(`Баланс пополнен на ${payAmount.toLocaleString("ru-RU")} ₽`);
    setSelectedAmount(null);
    setCustomAmount("");
    fetchWallet();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Кошелёк</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Баланс + пополнение */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#1E2A44]/10">
              <Wallet className="size-6 text-[#1E2A44]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ваш баланс</p>
              <p className="text-3xl font-bold text-[#1E2A44]">
                {loading ? "..." : `${balance.toLocaleString("ru-RU")} ₽`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Сумма пополнения</Label>

            {/* Быстрые суммы */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(v);
                    setCustomAmount("");
                  }}
                  className={cn(
                    "rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                    selectedAmount === v && customAmount === ""
                      ? "border-[#1E2A44] bg-[#1E2A44] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300",
                  )}
                >
                  {v.toLocaleString("ru-RU")} ₽
                </button>
              ))}
            </div>

            {/* Своя сумма */}
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000000"
                step="1"
                placeholder="Другая сумма"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className={cn(
                  "w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all",
                  customAmount !== ""
                    ? "border-[#1E2A44] bg-white"
                    : "border-slate-200 focus:border-slate-300",
                )}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ₽
              </span>
            </div>

            <Button
              onClick={handleOpenModal}
              disabled={loading || !payAmount || payAmount <= 0}
              className="w-full gap-2 bg-[#1E2A44] hover:bg-[#162033] py-6 text-base"
            >
              <ArrowUpFromLine className="size-4" />
              {payAmount > 0
                ? `Пополнить ${payAmount.toLocaleString("ru-RU")} ₽`
                : "Выберите сумму"}
            </Button>

            <p className="text-center text-xs text-slate-400">
              Безопасное пополнение через ЮKassa
            </p>
          </div>
        </div>

        {/* История */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-800">
            История операций
          </h2>

          {loading ? (
            <div className="py-8 text-center text-slate-400">Загрузка...</div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center">
              <CreditCard className="mx-auto mb-3 size-8 text-slate-300" />
              <p className="text-slate-400">Операций пока нет</p>
            </div>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {transactions.map((tx) => {
                const cfg = TX_CONFIG[tx.type] ?? {
                  label: tx.type,
                  icon: Wallet,
                  className: "text-slate-600",
                  sign: "",
                };
                const Icon = cfg.icon;
                const isExpense = tx.type === "BOOKING_PAYMENT";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("size-4 shrink-0", cfg.className)} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {tx.description || cfg.label}
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(tx.createdAt), "d MMM yyyy, HH:mm", {
                            locale: ru,
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        isExpense ? "text-red-600" : "text-green-600",
                      )}
                    >
                      {cfg.sign}
                      {Number(tx.amount).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={payAmount}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
