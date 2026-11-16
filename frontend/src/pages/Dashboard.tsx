
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Boxes,
  AlertTriangle,
  Bell,
  RefreshCw,
  CheckCircle2,
  Clock,
} from "lucide-react";

import api from "../services/api";
import StatCard from "../components/dashboard/StatCard";
import LogTrendChart from "../components/dashboard/LogTrendChart";
import type { LogTrend } from "../components/dashboard/LogTrendChart";

interface DashboardSummary {
  applications: {
    total: number;
  };
  logs: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
  incidents: {
    total: number;
    open: number;
    resolved: number;
  };
  alerts: {
    total: number;
    pending: number;
    sent: number;
  };
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<LogTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, trendsResponse] = await Promise.all([
        api.get<DashboardSummary>("/dashboard/summary"),
        api.get("/dashboard/log-trends", {
          params: { days: 7 },
        }),
      ]);

      setSummary(summaryResponse.data);
      setTrends(trendsResponse.data.trends);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <RefreshCw className="animate-spin" size={20} />
        Loading dashboard data...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-[#111827] border border-red-900/50 rounded-xl p-6">
        <p className="text-red-400 mb-4">{error || "Dashboard data unavailable."}</p>
        <button
          onClick={fetchDashboard}
          className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-white text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor your applications and system activity.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 bg-[#111827] border border-slate-700 hover:border-violet-500 px-4 py-2 rounded-lg text-sm text-slate-300"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          title="Total Applications"
          value={summary.applications.total}
          icon={Boxes}
          description="Registered monitoring applications"
          accent="bg-violet-500/10 text-violet-400"
        />

        <StatCard
          title="Total Logs"
          value={summary.logs.total}
          icon={Activity}
          description={`${summary.logs.errors} errors recorded`}
          accent="bg-blue-500/10 text-blue-400"
        />

        <StatCard
          title="Open Incidents"
          value={summary.incidents.open}
          icon={AlertTriangle}
          description={`${summary.incidents.resolved} incidents resolved`}
          accent="bg-red-500/10 text-red-400"
        />

        <StatCard
          title="Pending Alerts"
          value={summary.alerts.pending}
          icon={Bell}
          description={`${summary.alerts.sent} alerts sent`}
          accent="bg-amber-500/10 text-amber-400"
        />

      </div>

      {/* Log trend chart */}
      <LogTrendChart data={trends} />

      {/* Log severity and incident overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-5">
            Log Severity Overview
          </h3>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Errors</span>
                <span className="text-red-400 font-medium">
                  {summary.logs.errors}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full"
                  style={{
                    width: `${summary.logs.total ? (summary.logs.errors / summary.logs.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Warnings</span>
                <span className="text-amber-400 font-medium">
                  {summary.logs.warnings}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: `${summary.logs.total ? (summary.logs.warnings / summary.logs.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Info</span>
                <span className="text-blue-400 font-medium">
                  {summary.logs.info}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{
                    width: `${summary.logs.total ? (summary.logs.info / summary.logs.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-5">
            Incident & Alert Status
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 text-red-400 p-2 rounded-lg">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-slate-300 text-sm">Open incidents</span>
              </div>
              <span className="text-white font-semibold">
                {summary.incidents.open}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-slate-300 text-sm">Resolved incidents</span>
              </div>
              <span className="text-white font-semibold">
                {summary.incidents.resolved}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg">
                  <Clock size={18} />
                </div>
                <span className="text-slate-300 text-sm">Pending alerts</span>
              </div>
              <span className="text-white font-semibold">
                {summary.alerts.pending}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                  <Bell size={18} />
                </div>
                <span className="text-slate-300 text-sm">Sent alerts</span>
              </div>
              <span className="text-white font-semibold">
                {summary.alerts.sent}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
