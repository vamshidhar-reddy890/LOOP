import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { feedbackService } from '../services/feedback';
import { reportService } from '../services/report';
import { workspaceService } from '../services/workspace';
import { DashboardStats, Feedback, FeedbackFilter, Report, ReportType, Workspace } from '../types';

interface FeedbackContextValue {
  feedbacks: Feedback[];
  stats: DashboardStats | null;
  workspaces: Workspace[];
  reports: Report[];
  loading: boolean;
  error: string | null;
  loadFeedback: (filters?: FeedbackFilter) => Promise<void>;
  loadStats: (workspaceId?: number) => Promise<void>;
  loadWorkspaces: () => Promise<void>;
  loadReports: (workspaceId?: number) => Promise<void>;
  createFeedback: (data: Partial<Feedback>) => Promise<void>;
  updateFeedback: (id: number, data: Partial<Feedback>) => Promise<void>;
  deleteFeedback: (id: number) => Promise<void>;
  importFeedback: (file: File, workspaceId: number) => Promise<void>;
  generateReport: (workspaceId: number, type: ReportType, periodStart: string, periodEnd: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = useCallback(async (filters?: FeedbackFilter) => {
    try {
      setLoading(true);
      const data = await feedbackService.getAll(filters);
      setFeedbacks(data.content);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (workspaceId?: number) => {
    try {
      const data = await feedbackService.getStats(workspaceId);
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load stats');
    }
  }, []);

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load workspaces');
    }
  }, []);

  const loadReports = useCallback(async (workspaceId?: number) => {
    try {
      const data = await reportService.getAll(workspaceId);
      setReports(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load reports');
    }
  }, []);

  const createFeedback = useCallback(async (data: Partial<Feedback>) => {
    const created = await feedbackService.create(data);
    setFeedbacks((previous) => [created, ...previous]);
    await loadStats(created.workspaceId);
  }, [loadStats]);

  const updateFeedback = useCallback(async (id: number, data: Partial<Feedback>) => {
    const updated = await feedbackService.update(id, data);
    setFeedbacks((previous) => previous.map((item) => (item.id === id ? updated : item)));
    await loadStats(updated.workspaceId);
  }, [loadStats]);

  const deleteFeedback = useCallback(async (id: number) => {
    await feedbackService.delete(id);
    setFeedbacks((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const importFeedback = useCallback(async (file: File, workspaceId: number) => {
    await feedbackService.importCSV(file, workspaceId);
    await loadFeedback();
    await loadStats(workspaceId);
  }, [loadFeedback, loadStats]);

  const generateReport = useCallback(async (workspaceId: number, type: ReportType, periodStart: string, periodEnd: string) => {
    const report = await reportService.generate({ workspaceId, type, periodStart, periodEnd });
    setReports((previous) => [report, ...previous]);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      feedbacks,
      stats,
      workspaces,
      reports,
      loading,
      error,
      loadFeedback,
      loadStats,
      loadWorkspaces,
      loadReports,
      createFeedback,
      updateFeedback,
      deleteFeedback,
      importFeedback,
      generateReport,
    }),
    [feedbacks, stats, workspaces, reports, loading, error, loadFeedback, loadStats, loadWorkspaces, loadReports, createFeedback, updateFeedback, deleteFeedback, importFeedback, generateReport]
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
