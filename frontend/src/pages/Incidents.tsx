
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldAlert,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Check,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

interface Incident {
  id: number;
  application_id: number;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  fingerprint: string;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  resolved_at: string | null;
}

const PAGE_SIZE = 50;

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [search, setSearch] = useState("");

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);

  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Fetch incidents
  const fetchIncidents = useCallback(async () => {
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

      if (severityFilter) {
        params.severity = severityFilter;
      }

      const response = await api.get<Incident[]>("/incidents/", {
        params,
      });

      setIncidents(response.data);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (err: any) {
      setIncidents([]);
      setHasMore(false);

      setError(
        err.response?.data?.detail ||
          "Unable to retrieve incidents."
      );
    } finally {
      setLoading(false);
    }
  }, [skip, statusFilter, severityFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Resolve incident
  const handleResolve = async (incident: Incident) => {
    if (incident.status.toLowerCase() === "resolved") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to resolve incident #${incident.id}?`
    );

    if (!confirmed) return;

    setResolvingId(incident.id);
    setError("");

    try {
      const response = await api.patch<Incident>(
        `/incidents/${incident.id}/resolve`
      );

      // Update the selected incident details
      setSelectedIncident(response.data);

      // Refresh incident listing
      await fetchIncidents();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to resolve incident."
      );
    } finally {
      setResolvingId(null);
    }
  };

  // Fetch complete incident details
  const handleViewDetails = async (incident: Incident) => {
    setError("");

    try {
      const response = await api.get<Incident>(
        `/incidents/${incident.id}`
      );

      setSelectedIncident(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load incident details."
      );
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

  // Severity styles
  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";

      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";

      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  // Status styles
  const getStatusStyle = (status: string) => {
    return status.toLowerCase() === "resolved"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : "bg-red-500/10 text-red-400 border-red-500/30";
  };

  // Client-side title search within the current page
  const filteredIncidents = incidents.filter((incident) => {
    const query = search.toLowerCase();

    return (
      incident.title.toLowerCase().includes(query) ||
      (incident.description || "").toLowerCase().includes(query) ||
      String(incident.id).includes(query)
    );
  });

  const openCount = incidents.filter(
    (incident) => incident.status.toLowerCase() === "open"
  ).length;

  const resolvedCount = incidents.filter(
    (incident) => incident.status.toLowerCase() === "resolved"
  ).length;

  const criticalCount = incidents.filter(
    (incident) =>
      incident.severity.toLowerCase() === "critical"
  ).length;

  const totalOccurrences = incidents.reduce(
    (total, incident) => total + incident.occurrence_count,
    0
  );

  const handleFilterChange = (
    type: "status" | "severity",
    value: string
  ) => {
    setSkip(0);

    if (type === "status") {
      setStatusFilter(value);
    } else {
      setSeverityFilter(value);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Incident Management
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Monitor, investigate and resolve application incidents.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
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
                Open Incidents
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {openCount}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle size={23} />
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Resolved Incidents
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {resolvedCount}
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
                Critical Incidents
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {criticalCount}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
              <ShieldAlert size={23} />
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Total Occurrences
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {totalOccurrences}
              </h2>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Activity size={23} />
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

        <div className="flex items-center gap-2 mb-5">
          <Search size={18} className="text-violet-400" />

          <h3 className="text-white font-semibold">
            Filter Incidents
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Search Incidents
            </label>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or incident ID..."
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Incident Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                handleFilterChange("status", e.target.value)
              }
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Severity
            </label>

            <select
              value={severityFilter}
              onChange={(e) =>
                handleFilterChange("severity", e.target.value)
              }
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setSeverityFilter("");
              setSkip(0);
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
          >
            <X size={15} />
            Clear filters
          </button>
        </div>

      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Incidents table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-white font-semibold">
              Incident Records
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Review and manage detected incidents.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Page {Math.floor(skip / PAGE_SIZE) + 1}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading incidents...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2
              size={36}
              className="mx-auto mb-3 text-slate-600"
            />

            <p className="text-white font-medium">
              No incidents found
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Try changing your filters or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#0d1422] text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-5 py-4">Incident</th>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Occurrences</th>
                  <th className="px-5 py-4">Last Seen</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-slate-800/30 transition"
                  >

                    <td className="px-5 py-4 max-w-[300px]">
                      <p className="text-white font-medium text-sm">
                        {incident.title}
                      </p>

                      <p className="text-slate-500 text-xs mt-1">
                        Incident #{incident.id} · App #{incident.application_id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 border rounded-full text-xs font-medium ${getSeverityStyle(incident.severity)}`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 border rounded-full text-xs font-medium ${getStatusStyle(incident.status)}`}
                      >
                        {incident.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">
                      {incident.occurrence_count}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {formatDate(incident.last_seen)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end items-center gap-2">

                        <button
                          onClick={() => handleViewDetails(incident)}
                          title="View incident details"
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                        >
                          <Eye size={17} />
                        </button>

                        {incident.status.toLowerCase() === "open" && (
                          <button
                            onClick={() => handleResolve(incident)}
                            disabled={resolvingId === incident.id}
                            title="Resolve incident"
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50"
                          >
                            {resolvingId === incident.id ? (
                              <RefreshCw size={17} className="animate-spin" />
                            ) : (
                              <Check size={17} />
                            )}
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-t border-slate-800">

          <p className="text-xs text-slate-500">
            Showing {filteredIncidents.length} records on this page
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

      {/* Incident details modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl">

            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h2 className="text-white font-semibold text-lg">
                  Incident Details
                </h2>

                <p className="text-slate-500 text-xs mt-1">
                  Incident #{selectedIncident.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                aria-label="Close incident details"
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Incident Title
                </p>

                <h3 className="text-white font-semibold">
                  {selectedIncident.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">

                <span
                  className={`px-3 py-1 border rounded-full text-xs ${getSeverityStyle(selectedIncident.severity)}`}
                >
                  {selectedIncident.severity.toUpperCase()}
                </span>

                <span
                  className={`px-3 py-1 border rounded-full text-xs ${getStatusStyle(selectedIncident.status)}`}
                >
                  {selectedIncident.status.toUpperCase()}
                </span>

              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Description
                </p>

                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                  {selectedIncident.description ||
                    "No description available."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Application ID
                  </p>

                  <p className="text-white text-sm">
                    #{selectedIncident.application_id}
                  </p>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Occurrence Count
                  </p>

                  <p className="text-white text-sm">
                    {selectedIncident.occurrence_count}
                  </p>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    First Seen
                  </p>

                  <p className="text-slate-200 text-sm">
                    {formatDate(selectedIncident.first_seen)}
                  </p>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Last Seen
                  </p>

                  <p className="text-slate-200 text-sm">
                    {formatDate(selectedIncident.last_seen)}
                  </p>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 rounded-lg p-4 sm:col-span-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Resolved At
                  </p>

                  <p className="text-slate-200 text-sm">
                    {selectedIncident.resolved_at
                      ? formatDate(selectedIncident.resolved_at)
                      : "Not resolved yet"}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Incident Fingerprint
                </p>

                <code className="block bg-[#090d16] border border-slate-700 rounded-lg p-3 text-xs text-violet-300 break-all">
                  {selectedIncident.fingerprint}
                </code>
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 flex flex-wrap justify-end gap-3">

              <button
                onClick={() => setSelectedIncident(null)}
                className="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm"
              >
                Close
              </button>

              {selectedIncident.status.toLowerCase() === "open" && (
                <button
                  onClick={() => handleResolve(selectedIncident)}
                  disabled={resolvingId === selectedIncident.id}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium"
                >
                  {resolvingId === selectedIncident.id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}

                  Resolve Incident
                </button>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
