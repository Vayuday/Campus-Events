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
  category: Category | string | null;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: number;
  posterUrl?: string;
  organizer: Pick<User, "id" | "name" | "email"> | string;
  status: EventStatus;
  rejectionReason?: string;
  registeredCount?: number;
  createdAt: string;
}

export interface Registration {
  id: string;
  event: EventItem | string;
  student: User | string;
  ticketCode: string;
  checkedInAt?: string | null;
  createdAt: string;
}

export interface Notification {
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
