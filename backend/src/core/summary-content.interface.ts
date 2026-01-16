export type SummaryCategoryName =
  | 'Urgent'
  | 'Action Needed'
  | 'Newsletter'
  | 'Personal';

export interface SummaryCategory {
  name: SummaryCategoryName;
  emails: Array<{
    subject: string;
    snippet: string;
    heat_score: number;
  }>;
}

export interface SummaryContent {
  summary_title: string;
  overall_sentiment: string;
  categories: SummaryCategory[];
  suggested_actions: string[];
}
