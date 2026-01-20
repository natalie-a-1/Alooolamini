"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdvisors = listAdvisors;
exports.listAdvisorSlots = listAdvisorSlots;
exports.bookAppointment = bookAppointment;
const prisma_1 = require("../../db/prisma");
const errors_1 = require("../../lib/errors");
async function listAdvisors() {
    return prisma_1.prisma.advisor.findMany({ orderBy: { createdAt: "asc" } });
}
async function listAdvisorSlots(advisorId) {
    return prisma_1.prisma.advisorSlot.findMany({
        where: { advisorId },
        orderBy: { startAt: "asc" },
    });
}
async function bookAppointment(userId, data) {
    const slot = await prisma_1.prisma.advisorSlot.findUnique({ where: { id: data.slotId } });
    if (!slot) {
        throw (0, errors_1.notFound)("Slot not found");
    }
    if (slot.advisorId !== data.advisorId) {
        throw (0, errors_1.badRequest)("Slot does not match advisor");
    }
    if (slot.status !== "available") {
        throw (0, errors_1.badRequest)("Slot not available");
    }
    const appointment = await prisma_1.prisma.advisorAppointment.create({
        data: {
            advisorId: data.advisorId,
            userId,
            slotId: data.slotId,
            status: "booked",
            notes: data.notes,
        },
    });
    await prisma_1.prisma.advisorSlot.update({
        where: { id: data.slotId },
        data: { status: "booked", heldByUserId: userId },
    });
    return appointment;
}
