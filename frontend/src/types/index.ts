export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Feedback {
  id: number;
  content: string;
  source: FeedbackSource;
  sentiment: Sentiment;
  sentimentScore: number;
  themes: string[];
  customerName?: string;
  customerEmail?: string;
  rating?: number;
  createdAt: string;
  workspaceId: number;
}

export type FeedbackSource = 'SUPPORT_TICKET' | 'APP_REVIEW' | 'SURVEY' | 'SALES_NOTE' | 'COMMUNITY_POST';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  memberCount: number;
  feedbackCount: number;
}

export interface Report {
  id: number;
  title: string;
  type: ReportType;
  periodStart: string;
  periodEnd: string;
  summary: string;
  insights: Insight[];
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  workspaceId: number;
}

export type ReportType = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface Insight {
  category: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  metrics: Record<string, number>;
}

export interface DashboardStats {
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  sentimentDistribution: { name: string; value: number; color: string }[];
  feedbackTrend: { date: string; count: number; sentiment: string }[];
  themeDistribution: { name: string; count: number }[];
  recentFeedback: Feedback[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface FeedbackFilter {
  search?: string;
  sentiment?: Sentiment;
  source?: FeedbackSource;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CSVUploadResult {
  totalRows: number;
  importedRows: number;
  errors: string[];
}

