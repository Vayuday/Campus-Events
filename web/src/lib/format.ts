import { format, formatDistanceToNow, isAfter } from "date-fns";

export function fmtDate(d: string | Date, pattern = "EEE, MMM d · h:mm a") {
  return format(new Date(d), pattern);
}

export function fmtRel(d: string | Date) {
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function isUpcoming(endAt: string | Date) {
  return isAfter(new Date(endAt), new Date());
}
