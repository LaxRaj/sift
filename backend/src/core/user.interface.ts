export interface User {
  id: string;
  email: string;
  nylasGrantId?: string;
  timezone?: string;
  summaryTimeUtc?: string;
  isPaid: boolean;
}
