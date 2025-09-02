export type NavProps = {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
};

export interface Lead {
  id: string;
  row_number?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  company?: string | null;
  title?: string | null;
  was_contacted?: boolean | null;
  reply_date?: Date | string | null;
  created_at?: Date | string | null;
  email_subject?: string | null;
  email_body?: string | null;
  email_sent?: boolean | null;
}

export interface LeadDTO {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  title: string | null;
  was_contacted: boolean | null;
  reply_date: string | null;
  created_at: string;
  email_subject: string | null;
  email_body: string | null;
  email_sent: boolean | null;
}

export interface EmailJobProgress {
  total: number;
  sent: number;
  failed: number;
  status: string;
  failures: Array<{ lead_id: string; error: string }>;
}

export interface SendEmailItem {
  lead_id: string;
  to: string | null;
  subject: string;
  body: string;
  schedule_at?: string | null;
  track_opens?: boolean;
}

