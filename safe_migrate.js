const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Running safe manual migration...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PersonalTraining" (
          "id" TEXT NOT NULL,
          "memberId" TEXT NOT NULL,
          "trainerId" TEXT NOT NULL,
          "startDate" TIMESTAMP(3) NOT NULL,
          "endDate" TIMESTAMP(3) NOT NULL,
          "sessions" INTEGER NOT NULL DEFAULT 0,
          "used" INTEGER NOT NULL DEFAULT 0,
          "amount" DOUBLE PRECISION NOT NULL,
          "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "PersonalTraining_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("PersonalTraining table verified.");
  } catch(e) { console.error("Error creating table:", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Payment" ADD COLUMN "personalTrainingId" TEXT;`);
    console.log("Added personalTrainingId to Payment.");
  } catch(e) { console.log("personalTrainingId might already exist."); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "PersonalTraining" ADD CONSTRAINT "PersonalTraining_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
  } catch(e) { console.log("Member FK might already exist."); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "PersonalTraining" ADD CONSTRAINT "PersonalTraining_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`);
  } catch(e) { console.log("TeamMember FK might already exist."); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Payment" ADD CONSTRAINT "Payment_personalTrainingId_fkey" FOREIGN KEY ("personalTrainingId") REFERENCES "PersonalTraining"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
  } catch(e) { console.log("Payment FK might already exist."); }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
