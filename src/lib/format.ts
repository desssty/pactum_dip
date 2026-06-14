export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(
  amount: number | string | null | undefined,
): string {
  if (amount === null || amount === undefined) return "—";
  return Number(amount).toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  });
}

export function roleName(role: string): string {
  const map: Record<string, string> = {
    CLIENT: "Клиент",
    LAWYER: "Юрист",
    ADMIN: "Администратор",
  };
  return map[role] || role;
}

export function slotStatusName(status: string): string {
  const map: Record<string, string> = {
    OPEN: "Свободен",
    BOOKED: "Забронирован",
    BLOCKED: "Заблокирован",
  };
  return map[status] || status;
}

export function bookingStatusName(status: string): string {
  const map: Record<string, string> = {
    BOOKED: "Забронирован",
    CANCELED: "Отменён",
    COMPLETED: "Завершён",
  };
  return map[status] || status;
}

export function walletTypeName(type: string): string {
  const map: Record<string, string> = {
    DEPOSIT: "Пополнение",
    WITHDRAWAL: "Вывод",
    BOOKING_PAYMENT: "Оплата бронирования",
    BOOKING_REFUND: "Возврат",
    SERVICE_PAYOUT: "Выплата юристу",
  };
  return map[type] || type;
}

export function walletStatusName(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Ожидание",
    COMPLETED: "Выполнена",
    CANCELED: "Отменена",
    FAILED: "Ошибка",
  };
  return map[status] || status;
}
