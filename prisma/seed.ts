// prisma/seed.ts

import {
  PrismaClient,
  UserRole,
  SlotStatus,
  BookingStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаем seed...\n");

  // ═══════════════════════════════════════
  // 1. ПАРОЛИ
  // ═══════════════════════════════════════
  const password = await bcrypt.hash("password123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  // ═══════════════════════════════════════
  // 2. АДМИН
  // ═══════════════════════════════════════
  const admin = await prisma.user.upsert({
    where: { email: "admin@pactum.ru" },
    update: {},
    create: {
      name: "Администратор",
      email: "admin@pactum.ru",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // ═══════════════════════════════════════
  // 3. ЮРИСТЫ
  // ═══════════════════════════════════════
  const lawyersData = [
    {
      name: "Иванов Алексей Сергеевич",
      email: "ivanov@pactum.ru",
      bio: "Адвокат с 15-летним стажем. Специализируюсь на семейных спорах, разделе имущества и вопросах опеки. Более 500 успешно завершённых дел. Член Адвокатской палаты г. Москвы.",
      balance: 45000,
    },
    {
      name: "Петрова Мария Владимировна",
      email: "petrova@pactum.ru",
      bio: "Кандидат юридических наук. Специализация — уголовное право и защита бизнеса. Опыт работы в прокуратуре 7 лет. Веду дела любой сложности.",
      balance: 78000,
    },
    {
      name: "Сидоров Дмитрий Анатольевич",
      email: "sidorov@pactum.ru",
      bio: "Эксперт в области трудового права. Помогаю работникам и работодателям решать споры. Провёл более 300 консультаций. Автор статей по трудовому законодательству.",
      balance: 32000,
    },
    {
      name: "Козлова Анна Игоревна",
      email: "kozlova@pactum.ru",
      bio: "Специалист по жилищному и земельному праву. Помогу с оформлением сделок с недвижимостью, приватизацией, спорами с застройщиками. Стаж 10 лет.",
      balance: 56000,
    },
    {
      name: "Морозов Николай Петрович",
      email: "morozov@pactum.ru",
      bio: "Наследственное и гражданское право. Оформление наследства, завещания, споры между наследниками. Работаю с клиентами по всей России дистанционно.",
      balance: 23000,
    },
    {
      name: "Волкова Екатерина Дмитриевна",
      email: "volkova@pactum.ru",
      bio: "Корпоративный юрист. Регистрация бизнеса, договорная работа, налоговые споры. Опыт работы в крупных юридических фирмах более 8 лет.",
      balance: 67000,
    },
  ];

  const lawyers = [];
  for (const data of lawyersData) {
    const lawyer = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        passwordHash: password,
        role: UserRole.LAWYER,
        bio: data.bio,
        balance: data.balance,
      },
    });
    lawyers.push(lawyer);
  }

  // ═══════════════════════════════════════
  // 4. КЛИЕНТЫ
  // ═══════════════════════════════════════
  const clientsData = [
    { name: "Смирнов Андрей", email: "smirnov@mail.ru", balance: 15000 },
    { name: "Кузнецова Ольга", email: "kuznetsova@mail.ru", balance: 25000 },
    { name: "Новиков Павел", email: "novikov@mail.ru", balance: 8000 },
    { name: "Федорова Елена", email: "fedorova@mail.ru", balance: 50000 },
    { name: "Михайлов Сергей", email: "mikhailov@mail.ru", balance: 3000 },
    { name: "Соколова Дарья", email: "sokolova@mail.ru", balance: 12000 },
    { name: "Лебедев Артём", email: "lebedev@mail.ru", balance: 30000 },
    { name: "Егорова Наталья", email: "egorova@mail.ru", balance: 7500 },
  ];

  const clients = [];
  for (const data of clientsData) {
    const client = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        passwordHash: password,
        role: UserRole.CLIENT,
        balance: data.balance,
      },
    });
    clients.push(client);
  }

  // ═══════════════════════════════════════
  // 5. КАТЕГОРИИ
  // ═══════════════════════════════════════
  const categoriesData = [
    {
      name: "Семейное право",
      description: "Разводы, алименты, раздел имущества, опека и усыновление",
    },
    {
      name: "Уголовное право",
      description:
        "Защита по уголовным делам, обжалование приговоров, представительство в суде",
    },
    {
      name: "Трудовое право",
      description:
        "Споры с работодателем, незаконное увольнение, взыскание зарплаты",
    },
    {
      name: "Жилищное право",
      description:
        "Сделки с недвижимостью, приватизация, споры с застройщиками и соседями",
    },
    {
      name: "Наследственное право",
      description:
        "Оформление наследства, составление завещаний, споры между наследниками",
    },
    {
      name: "Корпоративное право",
      description:
        "Регистрация бизнеса, договоры, налоговые споры, ликвидация компаний",
    },
    {
      name: "Защита прав потребителей",
      description: "Возврат товаров, некачественные услуги, споры с продавцами",
    },
  ];

  const categories = [];
  for (const data of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    categories.push(category);
  }

  // ═══════════════════════════════════════
  // 6. УСЛУГИ
  // ═══════════════════════════════════════
  const servicesData = [
    // Иванов — семейное право
    {
      title: "Консультация по разводу",
      description:
        "Подробная консультация по процедуре расторжения брака. Разберём вашу ситуацию, обсудим раздел имущества, вопросы опеки над детьми и алиментов. Подготовлю план действий и список необходимых документов.",
      price: 3000,
      lawyerIndex: 0,
      categoryIndex: 0,
    },
    {
      title: "Раздел имущества супругов",
      description:
        "Полное сопровождение процедуры раздела совместно нажитого имущества. Оценка имущества, подготовка искового заявления, представительство в суде. Защита ваших интересов на каждом этапе.",
      price: 15000,
      lawyerIndex: 0,
      categoryIndex: 0,
    },
    {
      title: "Взыскание алиментов",
      description:
        "Помощь во взыскании алиментов на содержание детей или нетрудоспособного супруга. Подготовка заявления, расчёт размера алиментов, представительство в суде.",
      price: 8000,
      lawyerIndex: 0,
      categoryIndex: 0,
    },

    // Петрова — уголовное право
    {
      title: "Защита по уголовному делу",
      description:
        "Профессиональная защита на всех стадиях уголовного процесса. Участие в допросах, подготовка ходатайств, обжалование решений. Гарантирую конфиденциальность и полную вовлечённость в дело.",
      price: 25000,
      lawyerIndex: 1,
      categoryIndex: 1,
    },
    {
      title: "Консультация по уголовному делу",
      description:
        "Первичная консультация по вашему делу. Оценка перспектив, анализ доказательной базы, рекомендации по линии защиты. Конфиденциально.",
      price: 5000,
      lawyerIndex: 1,
      categoryIndex: 1,
    },
    {
      title: "Обжалование приговора",
      description:
        "Подготовка и подача апелляционной или кассационной жалобы. Анализ приговора на предмет нарушений, подготовка правовой позиции, участие в заседании.",
      price: 20000,
      lawyerIndex: 1,
      categoryIndex: 1,
    },

    // Сидоров — трудовое право
    {
      title: "Консультация по трудовому спору",
      description:
        "Разберём вашу ситуацию с работодателем. Незаконное увольнение, невыплата зарплаты, нарушение условий трудового договора. Подскажу оптимальный путь решения.",
      price: 2500,
      lawyerIndex: 2,
      categoryIndex: 2,
    },
    {
      title: "Восстановление на работе",
      description:
        "Полное сопровождение дела о незаконном увольнении. Подготовка иска, сбор доказательств, представительство в суде. Взыскание компенсации за вынужденный прогул.",
      price: 12000,
      lawyerIndex: 2,
      categoryIndex: 2,
    },
    {
      title: "Взыскание невыплаченной зарплаты",
      description:
        "Помогу взыскать задолженность по заработной плате, отпускным, премиям. Досудебная претензия и судебное разбирательство.",
      price: 7000,
      lawyerIndex: 2,
      categoryIndex: 2,
    },

    // Козлова — жилищное право
    {
      title: "Сопровождение сделки с недвижимостью",
      description:
        "Проверка юридической чистоты объекта, подготовка и анализ договора купли-продажи, присутствие на сделке. Защита от мошенничества и скрытых рисков.",
      price: 10000,
      lawyerIndex: 3,
      categoryIndex: 3,
    },
    {
      title: "Приватизация жилья",
      description:
        "Полное сопровождение процедуры приватизации квартиры. Сбор документов, подача заявления, получение свидетельства о праве собственности.",
      price: 6000,
      lawyerIndex: 3,
      categoryIndex: 3,
    },
    {
      title: "Спор с застройщиком",
      description:
        "Претензионная работа и судебное разбирательство с застройщиком. Взыскание неустойки за просрочку, устранение недостатков, расторжение ДДУ.",
      price: 18000,
      lawyerIndex: 3,
      categoryIndex: 3,
    },

    // Морозов — наследственное право
    {
      title: "Оформление наследства",
      description:
        "Сопровождение процедуры вступления в наследство. Сбор документов, обращение к нотариусу, регистрация права собственности. Помощь при пропуске сроков.",
      price: 8000,
      lawyerIndex: 4,
      categoryIndex: 4,
    },
    {
      title: "Составление завещания",
      description:
        "Юридически грамотное составление завещания с учётом всех нюансов. Консультация по вопросам обязательной доли и налогообложения наследства.",
      price: 4000,
      lawyerIndex: 4,
      categoryIndex: 4,
    },
    {
      title: "Спор между наследниками",
      description:
        "Разрешение конфликтов между наследниками. Оспаривание завещания, раздел наследственного имущества, признание наследника недостойным.",
      price: 15000,
      lawyerIndex: 4,
      categoryIndex: 4,
    },

    // Волкова — корпоративное право
    {
      title: "Регистрация ООО",
      description:
        "Полное сопровождение регистрации общества с ограниченной ответственностью. Подготовка учредительных документов, подача в налоговую, получение выписки ЕГРЮЛ.",
      price: 5000,
      lawyerIndex: 5,
      categoryIndex: 5,
    },
    {
      title: "Составление договора",
      description:
        "Разработка или правовая экспертиза договоров любой сложности. Договоры поставки, оказания услуг, аренды, подряда и другие.",
      price: 4000,
      lawyerIndex: 5,
      categoryIndex: 5,
    },
    {
      title: "Налоговый спор",
      description:
        "Представительство в налоговых спорах. Обжалование решений ФНС, участие в проверках, подготовка возражений и жалоб.",
      price: 20000,
      lawyerIndex: 5,
      categoryIndex: 5,
    },

    // Доп. услуги
    {
      title: "Возврат некачественного товара",
      description:
        "Помогу вернуть деньги за некачественный товар или услугу. Составление претензии, обращение в Роспотребнадзор, исковое заявление.",
      price: 3500,
      lawyerIndex: 2,
      categoryIndex: 6,
    },
    {
      title: "Защита прав потребителя в суде",
      description:
        "Полное ведение дела по защите прав потребителя. Взыскание стоимости товара, неустойки, морального вреда и штрафа.",
      price: 9000,
      lawyerIndex: 5,
      categoryIndex: 6,
    },
  ];

  const services = [];
  for (const data of servicesData) {
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        lawyerId: lawyers[data.lawyerIndex].id,
        categoryId: categories[data.categoryIndex].id,
      },
    });
    services.push(service);
  }

  // ═══════════════════════════════════════
  // 7. СЛОТЫ
  // ═══════════════════════════════════════
  const now = new Date();

  function createSlotDate(daysOffset: number, hour: number): Date {
    const date = new Date(now);
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  // Прошлые слоты (для завершённых бронирований)
  const pastSlots = [];
  for (let i = 0; i < lawyers.length; i++) {
    for (let day = -14; day <= -1; day += 2) {
      for (const hour of [10, 14]) {
        const startAt = createSlotDate(day, hour);
        const endAt = new Date(startAt);
        endAt.setHours(endAt.getHours() + 1);

        const slot = await prisma.slot.create({
          data: {
            lawyerId: lawyers[i].id,
            startAt,
            endAt,
            status: SlotStatus.BLOCKED,
          },
        });
        pastSlots.push({ slot, lawyerIndex: i });
      }
    }
  }

  // Будущие слоты (открытые для бронирования)
  for (let i = 0; i < lawyers.length; i++) {
    for (let day = 1; day <= 14; day++) {
      const hours = [9, 10, 11, 14, 15, 16];
      for (const hour of hours) {
        const startAt = createSlotDate(day, hour);
        const endAt = new Date(startAt);
        endAt.setHours(endAt.getHours() + 1);

        // Пропускаем выходные
        const dayOfWeek = startAt.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        await prisma.slot.create({
          data: {
            lawyerId: lawyers[i].id,
            startAt,
            endAt,
            status: SlotStatus.OPEN,
          },
        });
      }
    }
  }

  // Несколько забронированных будущих слотов
  const bookedFutureSlots = [];
  for (let i = 0; i < 3; i++) {
    const startAt = createSlotDate(3 + i, 12);
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + 1);

    const slot = await prisma.slot.create({
      data: {
        lawyerId: lawyers[i].id,
        startAt,
        endAt,
        status: SlotStatus.BOOKED,
      },
    });
    bookedFutureSlots.push({ slot, lawyerIndex: i });
  }

  // ═══════════════════════════════════════
  // 8. ЗАВЕРШЁННЫЕ БРОНИРОВАНИЯ
  // ═══════════════════════════════════════
  const completedBookings = [];

  // Берём по несколько прошлых слотов для каждого юриста
  let slotIndex = 0;
  for (let i = 0; i < Math.min(pastSlots.length, 20); i++) {
    const { slot, lawyerIndex } = pastSlots[i];
    const clientIndex = i % clients.length;
    const serviceIndex = servicesData.findIndex(
      (s) => s.lawyerIndex === lawyerIndex,
    );

    if (serviceIndex === -1) continue;

    const service =
      services[
        serviceIndex +
          (i % 2 === 0
            ? 0
            : Math.min(
                1,
                services.filter(
                  (_, idx) => servicesData[idx]?.lawyerIndex === lawyerIndex,
                ).length - 1,
              ))
      ];

    const booking = await prisma.booking.create({
      data: {
        clientId: clients[clientIndex].id,
        serviceId: service.id,
        slotId: slot.id,
        status: BookingStatus.COMPLETED,
        completedAt: slot.endAt,
        paidAmount: service.price,
        serviceTitleSnapshot: service.title,
        lawyerNameSnapshot: lawyers[lawyerIndex].name,
        categoryNameSnapshot:
          categories[servicesData[serviceIndex].categoryIndex].name,
        slotStartSnapshot: slot.startAt,
        slotEndSnapshot: slot.endAt,
      },
    });

    completedBookings.push({
      booking,
      clientIndex,
      serviceIndex,
      lawyerIndex,
    });

    // Транзакция оплаты клиентом
    await prisma.walletTransaction.create({
      data: {
        userId: clients[clientIndex].id,
        bookingId: booking.id,
        type: "BOOKING_PAYMENT",
        status: "COMPLETED",
        amount: service.price,
        description: `Оплата услуги "${service.title}"`,
        createdAt: slot.startAt,
      },
    });

    // Транзакция выплаты юристу
    await prisma.walletTransaction.create({
      data: {
        userId: lawyers[lawyerIndex].id,
        bookingId: booking.id,
        type: "SERVICE_PAYOUT",
        status: "COMPLETED",
        amount: service.price,
        description: `Выплата за услугу "${service.title}"`,
        createdAt: slot.endAt,
      },
    });
  }

  // ═══════════════════════════════════════
  // 9. АКТИВНЫЕ БРОНИРОВАНИЯ
  // ═══════════════════════════════════════
  for (let i = 0; i < bookedFutureSlots.length; i++) {
    const { slot, lawyerIndex } = bookedFutureSlots[i];
    const clientIndex = i + 3;
    const serviceIndex = servicesData.findIndex(
      (s) => s.lawyerIndex === lawyerIndex,
    );

    if (serviceIndex === -1 || clientIndex >= clients.length) continue;

    const service = services[serviceIndex];

    const booking = await prisma.booking.create({
      data: {
        clientId: clients[clientIndex].id,
        serviceId: service.id,
        slotId: slot.id,
        status: BookingStatus.BOOKED,
        paidAmount: service.price,
        serviceTitleSnapshot: service.title,
        lawyerNameSnapshot: lawyers[lawyerIndex].name,
        categoryNameSnapshot:
          categories[servicesData[serviceIndex].categoryIndex].name,
        slotStartSnapshot: slot.startAt,
        slotEndSnapshot: slot.endAt,
      },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: clients[clientIndex].id,
        bookingId: booking.id,
        type: "BOOKING_PAYMENT",
        status: "COMPLETED",
        amount: service.price,
        description: `Оплата услуги "${service.title}"`,
      },
    });
  }

  // ═══════════════════════════════════════
  // 10. ОТМЕНЁННОЕ БРОНИРОВАНИЕ
  // ═══════════════════════════════════════
  if (pastSlots.length > 20) {
    const cancelSlot = pastSlots[20];
    const serviceIdx = servicesData.findIndex(
      (s) => s.lawyerIndex === cancelSlot.lawyerIndex,
    );

    if (serviceIdx !== -1) {
      const service = services[serviceIdx];

      await prisma.booking.create({
        data: {
          clientId: clients[0].id,
          serviceId: service.id,
          slotId: cancelSlot.slot.id,
          status: BookingStatus.CANCELED,
          cancellationReason: "Изменились планы, не смогу прийти",
          cancelledAt: new Date(cancelSlot.slot.startAt.getTime() - 86400000),
          paidAmount: service.price,
          serviceTitleSnapshot: service.title,
          lawyerNameSnapshot: lawyers[cancelSlot.lawyerIndex].name,
          categoryNameSnapshot:
            categories[servicesData[serviceIdx].categoryIndex].name,
          slotStartSnapshot: cancelSlot.slot.startAt,
          slotEndSnapshot: cancelSlot.slot.endAt,
        },
      });
    }
  }

  // ═══════════════════════════════════════
  // 11. ОТЗЫВЫ
  // ═══════════════════════════════════════
  const comments = [
    "Отличный специалист! Всё объяснил понятно и помог решить вопрос быстро.",
    "Очень профессиональный подход. Рекомендую всем.",
    "Спасибо за помощь! Дело было сложное, но юрист справился отлично.",
    "Хорошая консультация, получил ответы на все вопросы.",
    "Быстро и качественно. Буду обращаться ещё.",
    "Внимательный юрист, вникает в детали. Результатом доволен.",
    "Всё прошло хорошо, спасибо за профессионализм.",
    "Немного долго ждал ответа, но в целом всё хорошо.",
    "Превосходная работа! Выиграли дело в суде.",
    "Грамотный специалист, советую обратиться.",
    null,
    null,
    null,
  ];

  const ratings = [5, 5, 5, 4, 5, 4, 5, 3, 5, 4, 5, 4, 5];

  for (let i = 0; i < Math.min(completedBookings.length, ratings.length); i++) {
    const { booking, clientIndex, serviceIndex } = completedBookings[i];

    await prisma.rating.create({
      data: {
        bookingId: booking.id,
        clientId: clients[clientIndex].id,
        serviceId: services[serviceIndex].id,
        value: ratings[i],
        comment: comments[i] || null,
      },
    });
  }

  // ═══════════════════════════════════════
  // 12. ТРАНЗАКЦИИ ПОПОЛНЕНИЯ
  // ═══════════════════════════════════════
  for (const client of clients) {
    await prisma.walletTransaction.create({
      data: {
        userId: client.id,
        type: "DEPOSIT",
        status: "COMPLETED",
        amount: 50000,
        description: "Пополнение баланса",
        createdAt: new Date(now.getTime() - 30 * 86400000),
      },
    });
  }

  // Транзакция вывода для юриста
  await prisma.walletTransaction.create({
    data: {
      userId: lawyers[0].id,
      type: "WITHDRAWAL",
      status: "COMPLETED",
      amount: 10000,
      description: "Вывод средств на банковскую карту",
      createdAt: new Date(now.getTime() - 5 * 86400000),
    },
  });

  // ═══════════════════════════════════════
  // ИТОГИ
  // ═══════════════════════════════════════
  console.log("\n✅ Seed завершён!\n");
  console.log("═══════════════════════════════════════");
  console.log("  АККАУНТЫ ДЛЯ ВХОДА");
  console.log("═══════════════════════════════════════");
  console.log("");
  console.log("  👑 Админ:");
  console.log("     admin@pactum.ru / admin123");
  console.log("");
  console.log("  ⚖️  Юристы (пароль: password123):");
  for (const l of lawyersData) {
    console.log(`     ${l.email}`);
  }
  console.log("");
  console.log("  👤 Клиенты (пароль: password123):");
  for (const c of clientsData) {
    console.log(`     ${c.email}`);
  }
  console.log("");
  console.log("═══════════════════════════════════════");
  console.log(`  Категорий: ${categories.length}`);
  console.log(`  Услуг: ${services.length}`);
  console.log(`  Завершённых бронирований: ${completedBookings.length}`);
  console.log(`  Активных бронирований: ${bookedFutureSlots.length}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
