import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.coerce
    .number()
    .positive("Сумма должна быть положительной")
    .max(1000000, "Максимум 1 000 000 ₽"),
});

// Эмуляция вызова платёжного шлюза ЮKassa
async function processPaymentGateway(
  amount: number,
  userId: string,
): Promise<{ success: boolean; externalId: string }> {
  console.log(
    `[ЮKassa] Создание платежа для user ${userId} на сумму ${amount} ₽`,
  );

  // Имитация задержки сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Имитация успешного ответа от ЮKassa
  const externalId = `yk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[ЮKassa] Платёж ${externalId} успешно проведён`);

  return { success: true, externalId };
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "CLIENT") {
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

  // Шаг 1: Создаём транзакцию в статусе PENDING
  const pendingTx = await prisma.walletTransaction.create({
    data: {
      userId: session.id,
      type: "DEPOSIT",
      status: "PENDING",
      amount,
      description: `Пополнение баланса: ${amount.toLocaleString("ru-RU")} ₽`,
    },
  });

  try {
    // Шаг 2: Обращаемся к "платёжному шлюзу"
    const paymentResult = await processPaymentGateway(amount, session.id);

    if (!paymentResult.success) {
      await prisma.walletTransaction.update({
        where: { id: pendingTx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Платёж отклонён банком" },
        { status: 400 },
      );
    }

    // Шаг 3: При успехе — обновляем баланс и статус транзакции
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.id },
        data: { balance: { increment: amount } },
      });

      await tx.walletTransaction.update({
        where: { id: pendingTx.id },
        data: {
          status: "COMPLETED",
          description: `Пополнение баланса: ${amount.toLocaleString("ru-RU")} ₽ (платёж ${paymentResult.externalId})`,
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
      externalId: paymentResult.externalId,
    });
  } catch (error) {
    console.error("[ЮKassa] Ошибка обработки платежа:", error);

    await prisma.walletTransaction.update({
      where: { id: pendingTx.id },
      data: { status: "FAILED" },
    });

    return NextResponse.json(
      { error: "Ошибка обработки платежа" },
      { status: 500 },
    );
  }
}
