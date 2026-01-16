import { SummaryContent } from '../core';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nylas_grant_id: string | null;
          timezone: string;
          summary_time: string;
          is_paid: boolean;
        };
        Insert: {
          id: string;
          nylas_grant_id?: string | null;
          timezone?: string;
          summary_time?: string;
          is_paid?: boolean;
        };
        Update: {
          nylas_grant_id?: string | null;
          timezone?: string;
          summary_time?: string;
          is_paid?: boolean;
        };
        Relationships: [];
      };
      summaries: {
        Row: {
          id: string;
          user_id: string;
          content: SummaryContent;
          heat_vibe: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: SummaryContent;
          heat_vibe?: string | null;
          created_at?: string;
        };
        Update: {
          content?: SummaryContent;
          heat_vibe?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
