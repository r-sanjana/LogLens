
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Filter,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  Database,
  Eye,
} from "lucide-react";

import api from "../services/api";

interface Application {
  id: number;
  name: string;
}

interface LogRecord {
  id: number;
  application_id: number;
  level: string;
  message: string;
  source: string | null;
  metadata: Record<string, unknown>;
  timestamp: string;
  received_at: string;
}

const PAGE_SIZE = 50;

export default function Logs() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState("");

  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [error, setError] = useState("");

  const [level, setLevel] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    level: "",
    source: "",
    search: "",
    startTime: "",
    endTime: "",
  });

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  // Load applications
  useEffect(() => {
    const fetchApplications = async () => {
      setApplicationsLoading(true);

      try {
        const response = await api.get<Application[]>("/applications/");

        setApplications(response.data);

        if (response.data.length > 0) {
          setSelectedApplication(String(response.data[0].id));
        }
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            "Unable to load applications."
        );
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    if (!selectedApplication) {
      setLogs([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params: Record<string, string | number> = {
        skip,
        limit: PAGE_SIZE,
      };

      if (appliedFilters.level) {
        params.level = appliedFilters.level;
      }

      if (appliedFilters.source) {
        params.source = appliedFilters.source;
      }

      if (appliedFilters.search) {
        params.search = appliedFilters.search;
      }

      if (appliedFilters.startTime) {
        params.start_time = new Date(
          appliedFilters.startTime
        ).toISOString();
      }

      if (appliedFilters.endTime) {
        params.end_time = new Date(
          appliedFilters.endTime
        ).toISOString();
      }

      const response = await api.get<LogRecord[]>(
        `/applications/${selectedApplication}/logs/`,
        { params }
      );

      setLogs(response.data);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (err: any) {
      setLogs([]);
      setHasMore(false);
      setError(
        err.response?.data?.detail ||
          "Unable to retrieve logs."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedApplication, skip, appliedFilters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Apply filters
  const handleApplyFilters = () => {
    if (startTime && endTime && startTime > endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    setSkip(0);

    setAppliedFilters({
      level,
      source: source.trim(),
      search: search.trim(),
      startTime,
      endTime,
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setLevel("");
    setSource("");
    setSearch("");
    setStartTime("");
    setEndTime("");
    setSkip(0);

    setAppliedFilters({
      level: "",
      source: "",
      search: "",
      startTime: "",
      endTime: "",
    });
  };

  const getLevelStyle = (value: string) => {
    switch (value.toUpperCase()) {
      case "ERROR":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "WARNING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";

      case "INFO":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const currentApplication = applications.find(
    (app) => String(app.id) === selectedApplication
  );

  const activeFilterCount = [
    appliedFilters.level,
    appliedFilters.source,
    appliedFilters.search,
    appliedFilters.startTime,
    appliedFilters.endTime,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Logs Explorer
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Search, filter and investigate application logs.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading || !selectedApplication}
          className="flex items-center gap-2 bg-[#111827] border border-slate-700 hover:border-violet-500 px-4 py-2.5 rounded-lg text-sm text-slate-300 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Application selector and log count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <label className="text-sm text-slate-400 block mb-3">
            Select Application
          </label>

          <select
            value={selectedApplication}
            onChange={(e) => {
              setSelectedApplication(e.target.value);
              setSkip(0);
              setSelectedLog(null);
            }}
            disabled={applicationsLoading}
            className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none focus:border-violet-500"
          >
            <option value="">
              {applicationsLoading
                ? "Loading applications..."
                : "Select an application"}
            </option>

            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} (ID: {app.id})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">
                Logs on current page
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {logs.length}
              </h2>
            </div>

            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Database size={24} />
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            {currentApplication?.name || "No application selected"}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-violet-400" />

            <h3 className="text-white font-semibold">
              Filter Logs
            </h3>

            {activeFilterCount > 0 && (
              <span className="bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full text-xs">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
          >
            <X size={15} />
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Search */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Search Message
            </label>

            <div className="flex items-center gap-2 bg-[#090d16] border border-slate-700 rounded-lg px-3">
              <Search size={16} className="text-slate-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search log messages..."
                className="w-full py-3 bg-transparent outline-none text-white text-sm"
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Severity Level
            </label>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            >
              <option value="">All Levels</option>
              <option value="ERROR">ERROR</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Log Source
            </label>

            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. payment-service"
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none focus:border-violet-500"
            />
          </div>

          {/* Start time */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Start Time
            </label>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            />
          </div>

          {/* End time */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              End Time
            </label>

            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-3 py-3 text-white text-sm outline-none"
            />
          </div>

          {/* Apply */}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={!selectedApplication}
              className="w-full flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg text-sm font-medium"
            >
              <Search size={16} />
              Apply Filters
            </button>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Logs table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-white font-semibold">
              Log Records
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {selectedApplication
                ? `Application ID: ${selectedApplication}`
                : "Select an application to view logs"}
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Page {Math.floor(skip / PAGE_SIZE) + 1}
          </span>
        </div>

        {!selectedApplication ? (
          <div className="p-12 text-center text-slate-400">
            <Database size={35} className="mx-auto mb-3 text-slate-600" />
            Select an application to explore its logs.
          </div>
        ) : loading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            Retrieving log records...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={35} className="mx-auto mb-3 text-slate-600" />

            <p className="text-white font-medium">
              No logs found
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Try changing your filters or select another application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#0d1422] text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Message</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/30 transition"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 border rounded-full text-xs font-medium ${getLevelStyle(log.level)}`}
                      >
                        {log.level}
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-[350px]">
                      <p className="text-slate-200 text-sm truncate">
                        {log.message}
                      </p>

                      <p className="text-slate-500 text-xs mt-1">
                        Log ID: #{log.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {log.source || "Unknown"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        title="View log details"
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      >
                        <Eye size={17} />
                      </button>
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
            Showing {logs.length ? skip + 1 : 0}–
            {skip + logs.length} records on this page
          </p>

          <div className="flex gap-2">

            <button
              disabled={skip === 0 || loading}
              onClick={() => setSkip((previous) =>
                Math.max(0, previous - PAGE_SIZE)
              )}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              disabled={!hasMore || loading}
              onClick={() => setSkip((previous) =>
                previous + PAGE_SIZE
              )}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>

          </div>
        </div>

      </div>

      {/* Log detail modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl">

            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h2 className="text-white font-semibold text-lg">
                  Log Details
                </h2>

                <p className="text-slate-500 text-xs mt-1">
                  Log ID: #{selectedLog.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
                aria-label="Close log details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Severity
                </p>

                <span
                  className={`inline-flex px-3 py-1 border rounded-full text-xs font-medium ${getLevelStyle(selectedLog.level)}`}
                >
                  {selectedLog.level}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Message
                </p>

                <p className="text-white text-sm break-words">
                  {selectedLog.message}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Application ID
                  </p>

                  <p className="text-slate-200 text-sm">
                    #{selectedLog.application_id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Source
                  </p>

                  <p className="text-slate-200 text-sm">
                    {selectedLog.source || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Timestamp
                  </p>

                  <p className="text-slate-200 text-sm">
                    {formatDate(selectedLog.timestamp)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Received At
                  </p>

                  <p className="text-slate-200 text-sm">
                    {formatDate(selectedLog.received_at)}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Metadata
                </p>

                <pre className="bg-[#090d16] border border-slate-700 rounded-lg p-4 text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
                </pre>
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
