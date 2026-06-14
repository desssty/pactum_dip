"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { WithdrawModal } from "@/components/withdraw-modal";

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
  { label: string; icon: typeof TrendingUp; className: string }
> = {
  SERVICE_PAYOUT: {
    label: "Выплата за услугу",
    icon: TrendingUp,
    className: "text-green-600",
  },
  WITHDRAWAL: {
    label: "Вывод средств",
    icon: TrendingDown,
    className: "text-red-600",
  },
  BOOKING_REFUND: {
    label: "Возврат",
    icon: TrendingUp,
    className: "text-blue-600",
  },
};

const QUICK_AMOUNTS = [1000, 3000, 5000, 10000];

export default function LawyerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lawyer/wallet");
      const data = await res.json();
      setBalance(Number(data.balance));
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

  const withdrawAmount =
    customAmount !== "" ? parseFloat(customAmount) || 0 : (selectedAmount ?? 0);

  const handleOpenModal = () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Укажите сумму вывода");
      return;
    }
    if (withdrawAmount > balance) {
      toast.error("Недостаточно средств на балансе");
      return;
    }
    setModalOpen(true);
  };

  const handleWithdrawSuccess = () => {
    toast.success(
      `Заявка на вывод ${withdrawAmount.toLocaleString("ru-RU")} ₽ принята`,
    );
    setSelectedAmount(null);
    setCustomAmount("");
    fetchWallet();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Кошелёк</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Баланс + вывод */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#1E2A44]/10">
              <Wallet className="size-6 text-[#1E2A44]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Доступный баланс</p>
              <p className="text-3xl font-bold text-[#1E2A44]">
                {loading ? "..." : `${balance.toLocaleString("ru-RU")} ₽`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Сумма вывода</Label>

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
                  disabled={v > balance}
                  className={cn(
                    "rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                    v > balance
                      ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      : selectedAmount === v && customAmount === ""
                        ? "border-[#1E2A44] bg-[#1E2A44] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300",
                  )}
                >
                  {(v / 1000).toFixed(0)}К ₽
                </button>
              ))}
            </div>

            {/* Своя сумма */}
            <div className="relative">
              <input
                type="number"
                min="1"
                max={balance}
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
              disabled={
                loading ||
                !withdrawAmount ||
                withdrawAmount <= 0 ||
                withdrawAmount > balance
              }
              className="w-full gap-2 bg-[#1E2A44] hover:bg-[#162033] py-6 text-base"
            >
              <TrendingDown className="size-4" />
              {withdrawAmount > 0
                ? `Вывести ${withdrawAmount.toLocaleString("ru-RU")} ₽`
                : "Выберите сумму"}
            </Button>

            <p className="text-center text-xs text-slate-400">
              Вывод осуществляется на привязанный счёт в течение 1–3 дней
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
            <div className="py-8 text-center text-slate-400">
              Операций пока нет
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {transactions.map((tx) => {
                const cfg = TX_CONFIG[tx.type] ?? {
                  label: tx.type,
                  icon: Wallet,
                  className: "text-slate-600",
                };
                const Icon = cfg.icon;

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
                        tx.type === "WITHDRAWAL"
                          ? "text-red-600"
                          : "text-green-600",
                      )}
                    >
                      {tx.type === "WITHDRAWAL" ? "−" : "+"}
                      {Number(tx.amount).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WithdrawModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={withdrawAmount}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
