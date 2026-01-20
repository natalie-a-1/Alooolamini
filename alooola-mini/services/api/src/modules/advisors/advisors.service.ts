/**
 * Business logic for the advisors module.
 */
import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../lib/errors";

/** List advisors. */
export async function listAdvisors() {
  return prisma.advisor.findMany({ orderBy: { createdAt: "asc" } });
}

/** List advisor slots. */
export async function listAdvisorSlots(advisorId: string) {
  return prisma.advisorSlot.findMany({
    where: { advisorId },
    orderBy: { startAt: "asc" },
  });
}

/** Book appointment. */
export async function bookAppointment(userId: string, data: { advisorId: string; slotId: string; notes?: string }) {
  const slot = await prisma.advisorSlot.findUnique({ where: { id: data.slotId } });
  if (!slot) {
    throw notFound("Slot not found");
  }
  if (slot.advisorId !== data.advisorId) {
    throw badRequest("Slot does not match advisor");
  }
  if (slot.status !== "available") {
    throw badRequest("Slot not available");
  }

  const appointment = await prisma.advisorAppointment.create({
    data: {
      advisorId: data.advisorId,
      userId,
      slotId: data.slotId,
      status: "booked",
      notes: data.notes,
    },
  });

  await prisma.advisorSlot.update({
    where: { id: data.slotId },
    data: { status: "booked", heldByUserId: userId },
  });

  return appointment;
}
