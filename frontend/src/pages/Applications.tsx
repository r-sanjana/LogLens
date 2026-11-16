
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Boxes,
  Search,
  RefreshCw,
  Trash2,
  Pencil,
  X,
  CalendarDays,
  AlertCircle,
  KeyRound,
} from "lucide-react";

import api from "../services/api";
import APIKeyManager from "../components/dashboard/APIKeyManager";

interface Application {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<Application[]>("/applications/");
      setApplications(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Reset application form
  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingApp(null);
    setFormError("");
    setShowForm(false);
  };

  // Open create form
  const openCreateForm = () => {
    setEditingApp(null);
    setName("");
    setDescription("");
    setFormError("");
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (app: Application) => {
    setEditingApp(app);
    setName(app.name);
    setDescription(app.description || "");
    setFormError("");
    setShowForm(true);
  };

  // Create or update application
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setFormError("");

    if (name.trim().length < 2) {
      setFormError(
        "Application name must contain at least 2 characters."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (editingApp) {
        await api.put(
          `/applications/${editingApp.id}`,
          payload
        );
      } else {
        await api.post("/applications/", payload);
      }

      resetForm();
      await fetchApplications();
    } catch (err: any) {
      setFormError(
        err.response?.data?.detail ||
          "Unable to save application."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete application
  const handleDelete = async (app: Application) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${app.name}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(`/applications/${app.id}`);

      await fetchApplications();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete application."
      );
    }
  };

  // Search applications
  const filteredApplications = applications.filter((app) => {
    const query = search.toLowerCase();

    return (
      app.name.toLowerCase().includes(query) ||
      (app.description || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-7">

      {/* Page header */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Applications
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Register and manage your monitored applications.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={17} />
          Add Application
        </button>

      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Total Applications
              </p>

              <h2 className="text-3xl text-white font-bold mt-2">
                {applications.length}
              </h2>
            </div>

            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <Boxes size={23} />
            </div>

          </div>

        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Recently Registered
              </p>

              <h2 className="text-lg text-white font-semibold mt-3">
                {applications.length
                  ? new Date(
                      applications[0].created_at
                    ).toLocaleDateString("en-IN")
                  : "No applications"}
              </h2>
            </div>

            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <CalendarDays size={23} />
            </div>

          </div>

        </div>

      </div>

      {/* Search and refresh */}
      <div className="flex flex-wrap gap-3">

        <div className="flex items-center gap-3 flex-1 min-w-[220px] bg-[#111827] border border-slate-800 rounded-lg px-4">

          <Search size={18} className="text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="w-full bg-transparent py-3 outline-none text-white text-sm"
          />

        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-slate-800 rounded-lg text-slate-300 hover:border-violet-500 text-sm"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Applications table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">

          <h3 className="text-white font-semibold">
            Registered Applications
          </h3>

          <p className="text-slate-500 text-xs mt-1">
            Applications associated with your account.
          </p>

        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center gap-3 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">

            <Boxes
              size={35}
              className="mx-auto text-slate-600 mb-4"
            />

            <h3 className="text-white font-medium">
              {search
                ? "No matching applications"
                : "No applications yet"}
            </h3>

            <p className="text-slate-500 text-sm mt-2">
              {search
                ? "Try another search term."
                : "Register your first application to start monitoring."}
            </p>

            {!search && (
              <button
                onClick={openCreateForm}
                className="mt-5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add your first application
              </button>
            )}

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#0d1422] text-slate-400 text-xs uppercase">

                <tr>
                  <th className="px-5 py-4">Application</th>
                  <th className="px-5 py-4">Application ID</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/30 transition"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="bg-violet-500/10 text-violet-400 p-2 rounded-lg">
                          <Boxes size={19} />
                        </div>

                        <div>
                          <p className="text-white font-medium text-sm">
                            {app.name}
                          </p>

                          <p className="text-slate-500 text-xs mt-1">
                            {app.description ||
                              "No description provided"}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      #{app.id}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(
                        app.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => setSelectedApp(app)}
                          title="Manage API keys"
                          className="p-2 text-violet-400 hover:bg-violet-500/10 rounded-lg"
                        >
                          <KeyRound size={17} />
                        </button>

                        <button
                          onClick={() => openEditForm(app)}
                          title="Edit application"
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(app)}
                          title="Delete application"
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Create / Edit application modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="w-full max-w-lg bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl">

            <div className="flex justify-between items-center p-5 border-b border-slate-800">

              <div>
                <h2 className="text-white text-lg font-semibold">
                  {editingApp
                    ? "Edit Application"
                    : "Register Application"}
                </h2>

                <p className="text-slate-500 text-xs mt-1">
                  Enter your application details.
                </p>
              </div>

              <button
                onClick={resetForm}
                aria-label="Close form"
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-5"
            >

              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Application Name *
                </label>

                <input
                  required
                  minLength={2}
                  maxLength={150}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-commerce Monitoring Service"
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
                />

              </div>

              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this application does..."
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 resize-none"
                />

              </div>

              {formError && (
                <p className="text-red-400 text-sm">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium"
                >
                  {saving
                    ? "Saving..."
                    : editingApp
                      ? "Save Changes"
                      : "Create Application"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* API Key Manager */}
      {selectedApp && (
        <APIKeyManager
          applicationId={selectedApp.id}
          applicationName={selectedApp.name}
          onClose={() => setSelectedApp(null)}
        />
      )}

    </div>
  );
}
