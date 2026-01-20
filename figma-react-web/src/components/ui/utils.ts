/**
 * React UI component.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Helper for cn. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
