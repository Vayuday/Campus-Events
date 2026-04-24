export type Role = "student" | "organizer" | "admin";
export type EventStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: Category | null;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: number;
  posterUrl?: string;
  organizer: { id: string; name: string; email: string } | string;
  status: EventStatus;
  rejectionReason?: string;
  registeredCount?: number;
  createdAt: string;
}

export interface RegistrationStudent {
  id: string;
  name: string;
  email: string;
}

export interface Registration {
  id: string;
  event: string | EventItem;
  student: string | RegistrationStudent;
  ticketCode: string;
  checkedInAt?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
