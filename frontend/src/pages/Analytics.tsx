
import { useCallback, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  CheckCircle2,
  RefreshCw,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

import api from "../services/api";

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

interface Trend {
  date: string;
  errors: number;
  warnings: number;
  info: number;
  total: number;
}

interface TrendResponse {
  period_days: number;
  trends: Trend[];
}

const COLORS = {
  errors: "#f87171",
  warnings: "#fbbf24",
  info: "#60a5fa",
  success: "#34d399",
  violet: "#a78bfa",
};

export default function Analytics() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [trends, setTrends] = useState<Trend[]>([]);
  const [days, setDays] = useState(7);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, trendsResponse] = await Promise.all([
        api.get<DashboardSummary>("/dashboard/summary"),
        api.get<TrendResponse>("/dashboard/log-trends", {
          params: { days },
        }),
      ]);

      setSummary(summaryResponse.data);
      setTrends(trendsResponse.data.trends);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to retrieve analytics data."
      );
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (value: string) => {
    const parsed = new Date(`${value}T00:00:00`);

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const logDistribution = summary
    ? [
        { name: "Errors", value: summary.logs.errors, color: COLORS.errors },
        { name: "Warnings", value: summary.logs.warnings, color: COLORS.warnings },
        { name: "Info", value: summary.logs.info, color: COLORS.info },
      ]
    : [];

  const incidentDistribution = summary
    ? [
        { name: "Open", value: summary.incidents.open },
        { name: "Resolved", value: summary.incidents.resolved },
      ]
    : [];

  const alertDistribution = summary
    ? [
        { name: "Pending", value: summary.alerts.pending },
        { name: "Sent", value: summary.alerts.sent },
      ]
    : [];

  const StatCard = ({
    title,
    value,
    description,
    icon,
    iconClass,
  }: {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    iconClass: string;
  }) => (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
      <div className="flex justify-between items-center gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h2 className="text-3xl text-white font-bold mt-2">
            {value.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className={`p-3 rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        {description}
      </p>
    </div>
  );

  const EmptyChart = ({ message }: { message: string }) => (
    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-slate-500">
      <Activity size={30} className="mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Analytics
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Analyze application activity, log severity and incident performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#111827] border border-slate-700 rounded-lg text-slate-300 hover:border-violet-500 disabled:opacity-50 text-sm"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !summary ? (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-12 flex items-center justify-center gap-3 text-slate-400">
          <RefreshCw size={20} className="animate-spin" />
          Loading analytics...
        </div>
      ) : summary ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            <StatCard
              title="Total Applications"
              value={summary.applications.total}
              description="Registered monitoring applications"
              icon={<Boxes size={23} />}
              iconClass="bg-violet-500/10 text-violet-400"
            />

            <StatCard
              title="Total Logs"
              value={summary.logs.total}
              description={`${summary.logs.errors} errors recorded`}
              icon={<FileText size={23} />}
              iconClass="bg-blue-500/10 text-blue-400"
            />

            <StatCard
              title="Total Incidents"
              value={summary.incidents.total}
              description={`${summary.incidents.open} currently open`}
              icon={<AlertTriangle size={23} />}
              iconClass="bg-red-500/10 text-red-400"
            />

            <StatCard
              title="Total Alerts"
              value={summary.alerts.total}
              description={`${summary.alerts.sent} notifications sent`}
              icon={<Bell size={23} />}
              iconClass="bg-amber-500/10 text-amber-400"
            />

          </div>

          {/* Log trends */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

              <div>
                <h3 className="text-white font-semibold">
                  Log Activity Trends
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Daily log volume grouped by severity
                </p>
              </div>

              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>

            </div>

            <div className="h-[320px] w-full">

              {trends.length === 0 ? (
                <EmptyChart message="No log trend data available." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trends}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.errors} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.errors} stopOpacity={0} />
                      </linearGradient>

                      <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.warnings} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.warnings} stopOpacity={0} />
                      </linearGradient>

                      <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.info} stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263247"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />

                    <Tooltip
                      labelFormatter={(label) =>
                        formatDate(String(label))
                      }
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />

                    <Legend />

                    <Area
                      type="monotone"
                      dataKey="errors"
                      name="Errors"
                      stroke={COLORS.errors}
                      fill="url(#errorGradient)"
                      strokeWidth={2}
                    />

                    <Area
                      type="monotone"
                      dataKey="warnings"
                      name="Warnings"
                      stroke={COLORS.warnings}
                      fill="url(#warningGradient)"
                      strokeWidth={2}
                    />

                    <Area
                      type="monotone"
                      dataKey="info"
                      name="Info"
                      stroke={COLORS.info}
                      fill="url(#infoGradient)"
                      strokeWidth={2}
                    />

                  </AreaChart>
                </ResponsiveContainer>
              )}

            </div>
          </div>

          {/* Lower charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Log severity distribution */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

              <h3 className="text-white font-semibold">
                Log Severity Distribution
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Breakdown of all recorded logs
              </p>

              <div className="h-[260px] mt-4">

                {summary.logs.total === 0 ? (
                  <EmptyChart message="No log records available." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={logDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {logDistribution.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                      />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}

              </div>

              <div className="space-y-4 mt-2">

                {logDistribution.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">
                        {item.name}
                      </span>

                      <span className="text-white font-medium">
                        {item.value}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${
                            summary.logs.total
                              ? (item.value / summary.logs.total) * 100
                              : 0
                          }%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Incident and alert status */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

              <h3 className="text-white font-semibold">
                Incident & Alert Status
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Current incident and notification breakdown
              </p>

              <div className="h-[260px] mt-4">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        category: "Incidents",
                        Open: summary.incidents.open,
                        Resolved: summary.incidents.resolved,
                      },
                      {
                        category: "Alerts",
                        Open: summary.alerts.pending,
                        Resolved: summary.alerts.sent,
                      },
                    ]}
                    margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263247"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="Open"
                      fill={COLORS.errors}
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="Resolved"
                      fill={COLORS.success}
                      radius={[5, 5, 0, 0]}
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>

              <div className="space-y-4 mt-3">

                <div className="flex justify-between items-center bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={19} className="text-red-400" />

                    <span className="text-sm text-slate-300">
                      Open Incidents
                    </span>
                  </div>

                  <span className="text-white font-semibold">
                    {summary.incidents.open}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={19} className="text-emerald-400" />

                    <span className="text-sm text-slate-300">
                      Resolved Incidents
                    </span>
                  </div>

                  <span className="text-white font-semibold">
                    {summary.incidents.resolved}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock size={19} className="text-amber-400" />

                    <span className="text-sm text-slate-300">
                      Pending Alerts
                    </span>
                  </div>

                  <span className="text-white font-semibold">
                    {summary.alerts.pending}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={19} className="text-blue-400" />

                    <span className="text-sm text-slate-300">
                      Sent Alerts
                    </span>
                  </div>

                  <span className="text-white font-semibold">
                    {summary.alerts.sent}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Log activity table */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

            <div className="p-5 border-b border-slate-800">
              <h3 className="text-white font-semibold">
                Daily Log Statistics
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Detailed log counts for the selected period
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead className="bg-[#0d1422] text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Errors</th>
                    <th className="px-5 py-4">Warnings</th>
                    <th className="px-5 py-4">Info</th>
                    <th className="px-5 py-4">Total Logs</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {trends.map((item) => (
                    <tr
                      key={item.date}
                      className="hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4 text-sm text-white">
                        {formatDate(item.date)}
                      </td>

                      <td className="px-5 py-4 text-sm text-red-400">
                        {item.errors}
                      </td>

                      <td className="px-5 py-4 text-sm text-amber-400">
                        {item.warnings}
                      </td>

                      <td className="px-5 py-4 text-sm text-blue-400">
                        {item.info}
                      </td>

                      <td className="px-5 py-4 text-sm text-white font-semibold">
                        {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp size={15} />
            Analytics data is retrieved from your authenticated LogLens backend.
          </div>

        </>
      ) : null}

    </div>
  );
}
