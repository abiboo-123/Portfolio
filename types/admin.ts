export interface ContactMessage {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = "new" | "read" | "replied" | "archived";
