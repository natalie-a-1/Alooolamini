/**
 * Advisors API service.
 */
import { apiGet, apiPost } from './api';

export interface Advisor {
  id: string;
  name: string;
  bio: string | null;
  timezone: string;
  specialties: string[];
}

export interface AdvisorSlot {
  id: string;
  advisorId: string;
  startAt: string;
  endAt: string;
  status: string;
}

export interface AdvisorAppointment {
  id: string;
  advisorId: string;
  slotId: string;
  status: string;
  notes: string | null;
  advisor: Advisor;
  slot: AdvisorSlot;
}

/**
 * Get all advisors.
 */
export async function getAdvisors(): Promise<Advisor[]> {
  return apiGet<Advisor[]>('/advisors');
}

/**
 * Get available slots for an advisor.
 */
export async function getAdvisorSlots(advisorId: string): Promise<AdvisorSlot[]> {
  return apiGet<AdvisorSlot[]>(`/advisors/${advisorId}/slots`);
}

/**
 * Book an appointment with an advisor.
 */
export async function bookAppointment(
  advisorId: string,
  slotId: string,
  notes?: string
): Promise<AdvisorAppointment> {
  return apiPost<AdvisorAppointment>('/appointments', { advisorId, slotId, notes });
}

/**
 * Get user's appointments.
 */
export async function getMyAppointments(): Promise<AdvisorAppointment[]> {
  return apiGet<AdvisorAppointment[]>('/appointments/me');
}
