export interface Email {
  bcc?: string[];
  bodyType: string;
  body: string;
  cc?: string[];
  delayTS?: number;
  encoding?: string;
  from: string;
  priority?: string;
  subject: string;
  to: string[];
  tag?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  content: string;
  contentType: string;
  encoding: string;
  filename: string;
}
