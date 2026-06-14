import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addMinutes, isBefore, parseISO, startOfDay } from "date-fns";

const createSlotsSchema = z.object({
  date: z.string().min(1, "Укажите дату"),
  startTime: z.string().min(1, "Укажите время начала"),
  endTime: z.string().min(1, "Укажите время конца"),
  duration: z.coerce
    .number()
    .int()
    .min(15, "Минимум 15 минут")
    .max(480, "Максимум 8 часов"),
});

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const slots = await prisma.slot.findMany({
    where: {
      lawyerId: session.id,
      ...(from && { startAt: { gte: new Date(from) } }),
      ...(to && { startAt: { lte: new Date(to) } }),
    },
    include: {
      booking: {
        select: {
          id: true,
          status: true,
          client: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, title: true } },
          paidAmount: true,
        },
      },
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "LAWYER") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSlotsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { date, startTime, endTime, duration } = parsed.data;

  // Проверяем что дата не в прошлом
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(parseISO(date));

  if (isBefore(selectedDay, today)) {
    return NextResponse.json(
      { error: "Нельзя создавать слоты на прошедшую дату" },
      { status: 400 },
    );
  }

  // Строим datetime из date + time
  const startAt = parseISO(`${date}T${startTime}:00`);
  const rangeEnd = parseISO(`${date}T${endTime}:00`);

  if (!isBefore(startAt, rangeEnd)) {
    return NextResponse.json(
      { error: "Время начала должно быть раньше времени окончания" },
      { status: 400 },
    );
  }

  // Если сегодня — не даём создать слоты, которые уже прошли
  const now = new Date();

  // Генерируем слоты
  const slotsToCreate: { lawyerId: string; startAt: Date; endAt: Date }[] = [];
  let current = startAt;

  while (isBefore(current, rangeEnd)) {
    const next = addMinutes(current, duration);
    if (isBefore(rangeEnd, next)) break;

    // Пропускаем слоты, время начала которых уже прошло
    if (!isBefore(current, now)) {
      slotsToCreate.push({
        lawyerId: session.id,
        startAt: current,
        endAt: next,
      });
    }

    current = next;
  }

  if (slotsToCreate.length === 0) {
    return NextResponse.json(
      {
        error:
          "Не удалось сгенерировать слоты — все указанные временные интервалы уже прошли",
      },
      { status: 400 },
    );
  }

  // Создаём, пропуская дубликаты
  const created = await prisma.slot.createMany({
    data: slotsToCreate,
    skipDuplicates: true,
  });

  return NextResponse.json(
    { created: created.count, total: slotsToCreate.length },
    { status: 201 },
  );
}
