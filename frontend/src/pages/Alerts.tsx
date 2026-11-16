
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Mail,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Send,
  CircleAlert,
} from "lucide-react";

import api from "../services/api";

interface AlertItem {
  id: number;
  incident_id: number;
  channel: string;
  message: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

interface Incident {
  id: number;
  application_id: number;
  title: string;
  severity: string;
  status: string;
}

const PAGE_SIZE = 50;

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [selectedAlert, setSelectedAlert] =
    useState<AlertItem | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch alerts and incidents
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, string | number> = {
        skip,
        limit: PAGE_SIZE,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const [alertResponse, incidentResponse] = await Promise.all([
        api.get<AlertItem[]>("/alerts/", { params }),
        api.get<Incident[]>("/incidents/", {
          params: { skip: 0, limit: 100 },
        }),
      ]);

      setAlerts(alertResponse.data);
      setIncidents(incidentResponse.data);
      setHasMore(alertResponse.data.length === PAGE_SIZE);
    } catch (err: any) {
      setAlerts([]);
      setIncidents([]);
      setHasMore(false);

      setError(
        err.response?.data?.detail ||
          "Unable to retrieve alerts."
      );
    } finally {
      setLoading(false);
    }
  }, [skip, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Find related incident
  const getIncident = (incidentId: number) => {
    return incidents.find(
      (incident) => incident.id === incidentId
    );
  };

  // View alert details
  const handleViewDetails = async (alert: AlertItem) => {
    setDetailsLoading(true);
    setError("");

    try {
      const response = await api.get<AlertItem>(
        `/alerts/${alert.id}`
      );

      setSelectedAlert(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load alert details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Date formatting
  const formatDate = (value: string | null) => {
    if (!value) return "Not available";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Status styles
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";

      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  // Search current page
  const filteredAlerts = alerts.filter((alert) => {
    const incident = getIncident(alert.incident_id);
    const query = search.toLowerCase();

    return (
      String(alert.id).includes(query) ||
      String(alert.incident_id).includes(query) ||
      alert.message.toLowerCase().includes(query) ||
      (incident?.title || "").toLowerCase().includes(query)
    );
  });

  // Current page statistics
  const pendingCount = alerts.filter(
    (alert) => alert.status.toLowerCase() === "pending"
  ).length;

  const sentCount = alerts.filter(
    (alert) => alert.status.toLowerCase() === "sent"
  ).length;

  const failedCount = alerts.filter(
    (alert) => alert.status.toLowerCase() === "failed"
  ).length;

  const handleFilterChange = (value: string) => {
    setSkip(0);
    setStatusFilter(value);
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Alert Management
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Monitor email notifications and track alert delivery status.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Total Alerts
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {alerts.length}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
              <Bell size={23} />
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Pending Alerts
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {pendingCount}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock size={23} />
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Sent Alerts
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {sentCount}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={23} />
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Failed Alerts
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {failedCount}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
              <CircleAlert size={23} />
            </div>
          </div>
        </div>

      </div>

      {/* Email notification information */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
          <Mail size={22} />
        </div>

        <div>
          <h3 className="text-white font-semibold">
            Email Notification Service
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Alert notifications are processed asynchronously using
            Celery and Redis. Successful email submissions are
            reflected with a Sent status.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

        <div className="flex items-center gap-2 mb-5">
          <Search size={18} className="text-violet-400" />

          <h3 className="text-white font-semibold">
            Filter Alerts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Search Alerts
            </label>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert message or incident ID..."
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Alert Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setSkip(0);
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
          >
            <X size={15} />
            Clear filters
          </button>
        </div>

      </div>

      {/* Alert records */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold">
              Alert Records
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              View notification history and delivery status.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Page {Math.floor(skip / PAGE_SIZE) + 1}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell
              size={36}
              className="mx-auto mb-3 text-slate-600"
            />

            <p className="text-white font-medium">
              No alerts found
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Alerts will appear here when incidents generate notifications.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#0d1422] text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-5 py-4">Alert</th>
                  <th className="px-5 py-4">Incident</th>
                  <th className="px-5 py-4">Channel</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created At</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">

                {filteredAlerts.map((alert) => {
                  const incident = getIncident(alert.incident_id);

                  return (
                    <tr
                      key={alert.id}
                      className="hover:bg-slate-800/30 transition"
                    >

                      <td className="px-5 py-4">
                        <p className="text-white font-medium text-sm">
                          Alert #{alert.id}
                        </p>

                        <p className="text-slate-500 text-xs mt-1 max-w-[250px] truncate">
                          {alert.message}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-white text-sm">
                          {incident?.title || `Incident #${alert.incident_id}`}
                        </p>

                        <p className="text-slate-500 text-xs mt-1">
                          Incident #{alert.incident_id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail size={15} className="text-blue-400" />
                          {alert.channel.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 border rounded-full text-xs font-medium ${getStatusStyle(alert.status)}`}
                        >
                          {alert.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                        {formatDate(alert.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleViewDetails(alert)}
                            title="View alert details"
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                          >
                            <Eye size={17} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-t border-slate-800">

          <p className="text-xs text-slate-500">
            Showing {filteredAlerts.length} records on this page
          </p>

          <div className="flex gap-2">

            <button
              disabled={skip === 0 || loading}
              onClick={() =>
                setSkip((previous) =>
                  Math.max(0, previous - PAGE_SIZE)
                )
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              disabled={!hasMore || loading}
              onClick={() =>
                setSkip((previous) => previous + PAGE_SIZE)
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>

          </div>
        </div>

      </div>

      {/* Alert details modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">

          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl">

            <div className="flex items-center justify-between p-5 border-b border-slate-800">

              <div>
                <h2 className="text-white font-semibold text-lg">
                  Alert Details
                </h2>

                <p className="text-slate-500 text-xs mt-1">
                  Alert #{selectedAlert.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                aria-label="Close alert details"
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-5 space-y-5">

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                  <Bell size={23} />
                </div>

                <div>
                  <h3 className="text-white font-semibold">
                    Alert #{selectedAlert.id}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Notification details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Incident ID
                  </p>

                  <p className="text-white text-sm">
                    #{selectedAlert.incident_id}
                  </p>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Notification Channel
                  </p>

                  <p className="text-white text-sm uppercase">
                    {selectedAlert.channel}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Related Incident
                </p>

                <p className="text-white text-sm">
                  {getIncident(selectedAlert.incident_id)?.title ||
                    `Incident #${selectedAlert.incident_id}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Alert Message
                </p>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap break-words">
                  {selectedAlert.message}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Delivery Status
                </p>

                <span
                  className={`inline-flex px-3 py-1 border rounded-full text-xs font-medium ${getStatusStyle(selectedAlert.status)}`}
                >
                  {selectedAlert.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Created At
                  </p>

                  <p className="text-slate-200 text-sm">
                    {formatDate(selectedAlert.created_at)}
                  </p>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Sent At
                  </p>

                  <p className="text-slate-200 text-sm">
                    {formatDate(selectedAlert.sent_at)}
                  </p>
                </div>

              </div>

            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-[#111827] border border-slate-700 rounded-xl p-5 text-slate-300">
            <RefreshCw size={18} className="animate-spin" />
            Loading alert details...
          </div>
        </div>
      )}

    </div>
  );
}
