export type Email = {
  bcc: Array<string> | undefined;
  bodyType: string;
  body: string;
  cc: Array<string> | undefined;
  delayTS: number | undefined;
  encoding: string | undefined;
  from: string;
  priority: string | undefined;
  subject: string;
  to: Array<string>;
  tag: string | undefined;
  attachments: Array<string> | undefined;
};
