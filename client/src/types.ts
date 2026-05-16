export interface URLData {
  id: string;
  original_url: string;
  short_code: string;
  clicks: string;
  created_at: string;
}

export interface AnalyticsData {
  Data: {
    original_url: string;
    clicks: string;
    created_at: string;
  };
  message: string;
}