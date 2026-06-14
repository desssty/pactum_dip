import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.coerce.number().positive("Сумма должна быть положительной"),
});

// Эмуляция запроса на вывод средств через ЮKassa
async function processWithdrawal(
  amount: number,
  userId: string,
): Promise<{ success: boolean; externalId: string }> {
  console.log(`[ЮKassa] Запрос вывода ${amount} ₽ для user ${userId}`);

  // Имитация задержки сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const externalId = `wd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[ЮKassa] Заявка на вывод ${externalId} создана`);

  return { success: true, externalId };
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { amount } = parsed.data;

  // Проверяем баланс
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { balance: true },
  });

  if (!user || Number(user.balance) < amount) {
    return NextResponse.json(
      { error: "Недостаточно средств на балансе" },
      { status: 400 },
    );
  }

  // Создаём транзакцию в PENDING
  const pendingTx = await prisma.walletTransaction.create({
    data: {
      userId: session.id,
      type: "WITHDRAWAL",
      status: "PENDING",
      amount,
      description: `Вывод средств: ${amount.toLocaleString("ru-RU")} ₽`,
    },
  });

  try {
    // Обращаемся к "ЮKassa"
    const result = await processWithdrawal(amount, session.id);

    if (!result.success) {
      await prisma.walletTransaction.update({
        where: { id: pendingTx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Не удалось обработать вывод" },
        { status: 400 },
      );
    }

    // Списываем средства и завершаем транзакцию
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.id },
        data: { balance: { decrement: amount } },
      });

      await tx.walletTransaction.update({
        where: { id: pendingTx.id },
        data: {
          status: "COMPLETED",
          description: `Вывод средств: ${amount.toLocaleString("ru-RU")} ₽ (заявка ${result.externalId})`,
        },
      });
    });

    const updated = await prisma.user.findUnique({
      where: { id: session.id },
      select: { balance: true },
    });

    return NextResponse.json({
      success: true,
      balance: Number(updated?.balance ?? 0),
      externalId: result.externalId,
    });
  } catch (error) {
    console.error("[ЮKassa] Ошибка вывода:", error);

    await prisma.walletTransaction.update({
      where: { id: pendingTx.id },
      data: { status: "FAILED" },
    });

    return NextResponse.json(
      { error: "Ошибка обработки вывода" },
      { status: 500 },
    );
  }
}
