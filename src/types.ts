export interface MiniCRMConfig {
  systemId: string;
  apiKey: string;
  baseUrl: string;
}

export interface Contact {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  Name?: string;
  Email?: string;
  Phone?: string;
  Type?: string;
  [key: string]: unknown;
}

export interface Project {
  Id?: number;
  Name?: string;
  CategoryId?: number;
  StatusId?: number;
  ContactId?: number;
  UserId?: number;
  [key: string]: unknown;
}

export interface ToDo {
  Id?: number;
  ProjectId?: number;
  UserId?: number;
  Deadline?: string;
  Type?: string;
  Comment?: string;
  Status?: string;
  [key: string]: unknown;
}

export interface Invoice {
  Id?: string;
  Number?: string;
  Type?: string;
  ProjectId?: string;
  Issued?: string;
  Prompt?: string;
  Paid?: string;
  CurrencyCode?: string;
  AmountNet?: string;
  AmountVat?: string;
  Amount?: string;
  Status?: string;
  StatusGroup?: string;
  DocumentUrl?: string;
  [key: string]: unknown;
}

export interface ListResponse<T> {
  Results: Record<string, T>;
  Count: number;
}