import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Lead } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fallbackSubject(l: Lead) {
  return `Quick question for ${l.first_name ?? ""} at ${l.company ?? ""}`.trim();
}

export function fallbackBody(l: Lead) {
  return `Hi ${l.first_name ?? ""},

I put together a 60 second demo that teams like ${l.company ?? "yours"} use to speed up evaluations.

If helpful, can I send it over?

Best,
Your Name`;
}
