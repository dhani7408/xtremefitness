import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@xtremefitness.in";
  const passwordHash = await bcrypt.hash("admin@123", 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: adminEmail,
      name: "Xtreme Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.adminUser.updateMany({
    where: { role: "ADMIN" },
    data: { role: "SUPER_ADMIN" },
  });

  // Plans
  const plans = [
    { name: "1 Month", months: 1, price: 1500 },
    { name: "3 Months", months: 3, price: 4000 },
    { name: "6 Months", months: 6, price: 7500 },
    { name: "12 Months", months: 12, price: 13000 },
    { name: "Personal Training - 1 Month", months: 1, price: 5000 },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({
      where: { id: p.name },
      update: {},
      create: { id: p.name, ...p },
    });
  }

  // Remove any previously seeded dummy team (soft-delete)
  await prisma.teamMember.updateMany({
    where: {
      employeeCode: { in: ["XF-T001", "XF-T002", "XF-T003", "XF-T004"] },
      deletedAt: null,
    },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });

  // Real team: Owners + lead trainer
  const team = [
    {
      employeeCode: "XF-O001",
      firstName: "Bikramjeet",
      lastName: "",
      phone: "9876500001",
      role: "OWNER",
      salary: 0,
      photoUrl:
        "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop",
      bio: "Co-founder of Xtreme Fitness. Passionate about building a world-class fitness community in Mohali.",
    },
    {
      employeeCode: "XF-O002",
      firstName: "Sunit",
      lastName: "Kumar",
      phone: "9876500002",
      role: "OWNER",
      salary: 0,
      photoUrl:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
      bio: "Co-founder of Xtreme Fitness. Driving force behind the gym's modern equipment and training programs.",
    },
    {
      employeeCode: "XF-T101",
      firstName: "Rakesh",
      lastName: "",
      phone: "9876500003",
      role: "TRAINER",
      salary: 30000,
      photoUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
      bio: "Certified personal trainer specializing in strength training, body transformation and functional fitness.",
    },
  ];
  for (const t of team) {
    await prisma.teamMember.upsert({
      where: { employeeCode: t.employeeCode },
      update: { ...t, deletedAt: null, status: "ACTIVE" },
      create: t,
    });
  }

  // Gallery
  const gallery = [
    { title: "Cardio Zone", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop", category: "GYM", order: 1 },
    { title: "Free Weights Area", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop", category: "GYM", order: 2 },
    { title: "Functional Training", url: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1600&auto=format&fit=crop", category: "GYM", order: 3 },
    { title: "Group Class", url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop", category: "CLASSES", order: 4 },
    { title: "Yoga Session", url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1600&auto=format&fit=crop", category: "CLASSES", order: 5 },
    { title: "Zumba Energy", url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1600&auto=format&fit=crop", category: "CLASSES", order: 6 },
    { title: "HIIT Workout", url: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=1600&auto=format&fit=crop", category: "CLASSES", order: 7 },
    { title: "Heavy Iron", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1600&auto=format&fit=crop", category: "GYM", order: 8 },
    { title: "Strength Session", url: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=1600&auto=format&fit=crop", category: "GYM", order: 9 },
  ];
  for (const g of gallery) {
    const existing = await prisma.galleryImage.findFirst({ where: { url: g.url } });
    if (!existing) {
      await prisma.galleryImage.create({ data: g });
    }
  }

  // Members
  const now = new Date();
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);

  const members = [
    { memberCode: "XF-M001", firstName: "Karan", lastName: "Mehta", phone: "9000000001", gender: "MALE" },
    { memberCode: "XF-M002", firstName: "Simran", lastName: "Kaur", phone: "9000000002", gender: "FEMALE" },
    { memberCode: "XF-M003", firstName: "Arjun", lastName: "Patel", phone: "9000000003", gender: "MALE" },
    { memberCode: "XF-M004", firstName: "Riya", lastName: "Gupta", phone: "9000000004", gender: "FEMALE" },
    { memberCode: "XF-M005", firstName: "Vikram", lastName: "Rao", phone: "9000000005", gender: "MALE" },
  ];

  const plan3 = await prisma.plan.findFirst({ where: { name: "3 Months" } });
  const plan1 = await prisma.plan.findFirst({ where: { name: "1 Month" } });

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const member = await prisma.member.upsert({
      where: { memberCode: m.memberCode },
      update: {},
      create: m,
    });
    const plan = i % 2 === 0 ? plan3! : plan1!;
    const start = addDays(now, -30 * (i % 3));
    const end = addDays(start, plan.months * 30);
    const paymentAmount = i === 2 ? plan.price / 2 : plan.price;

    // Idempotent seed: reuse the same member+plan+dates subscription if it already exists.
    let sub = await prisma.subscription.findFirst({
      where: {
        memberId: member.id,
        planId: plan.id,
        startDate: start,
        endDate: end,
      },
    });
    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          startDate: start,
          endDate: end,
          amount: plan.price,
          amountPaid: paymentAmount,
          status: end < now ? "EXPIRED" : "ACTIVE",
        },
      });
    } else {
      sub = await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          amount: plan.price,
          amountPaid: paymentAmount,
          status: end < now ? "EXPIRED" : "ACTIVE",
        },
      });
    }

    // Stable invoice numbers prevent duplicate payments on repeated seeds.
    const seedInvoiceNo = `SEED-${m.memberCode}-${plan.name.replace(/\s+/g, "-").toUpperCase()}`;
    await prisma.payment.upsert({
      where: { invoiceNo: seedInvoiceNo },
      update: {
        memberId: member.id,
        subscriptionId: sub.id,
        amount: paymentAmount,
        method: "UPI",
        payType: i === 2 ? "PARTIAL" : "FULL",
      },
      create: {
        memberId: member.id,
        subscriptionId: sub.id,
        amount: paymentAmount,
        method: "UPI",
        payType: i === 2 ? "PARTIAL" : "FULL",
        invoiceNo: seedInvoiceNo,
      },
    });
  }

  // Expenses (replace prior seeded entries by title to keep seed idempotent)
  const seededExpenseTitles = ["Shop Rent - Mar", "Electricity Bill", "Dumbbells set"];
  await prisma.expense.deleteMany({
    where: { title: { in: seededExpenseTitles } },
  });
  await prisma.expense.createMany({
    data: [
      { title: "Shop Rent - Mar", category: "RENT", amount: 45000 },
      { title: "Electricity Bill", category: "UTILITIES", amount: 8200 },
      { title: "Dumbbells set", category: "EQUIPMENT", amount: 21000 },
    ],
  });

  // Settings
  await prisma.setting.upsert({
    where: { key: "gym_name" },
    update: { value: "Xtreme Fitness Gym" },
    create: { key: "gym_name", value: "Xtreme Fitness Gym" },
  });

  console.log("Seed complete. Admin login: admin@xtremefitness.in / admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
