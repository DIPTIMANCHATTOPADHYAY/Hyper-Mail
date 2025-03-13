export interface Email {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_timestamp: number;
  mail_read: number;
  mail_date: string;
  content: {
    mail_body: string;
  };
}