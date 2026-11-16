
import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  X,
  RefreshCw,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

interface APIKey {
  id: number;
  application_id: number;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface APIKeyCreated extends APIKey {
  api_key: string;
}

interface APIKeyManagerProps {
  applicationId: number;
  applicationName: string;
  onClose: () => void;
}

export default function APIKeyManager({
  applicationId,
  applicationName,
  onClose,
}: APIKeyManagerProps) {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);

  const [generatedKey, setGeneratedKey] =
    useState<APIKeyCreated | null>(null);

  const [copied, setCopied] = useState(false);

  // Fetch existing API keys
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<APIKey[]>(
        `/applications/${applicationId}/api-keys/`
      );

      setKeys(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load API keys."
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Generate a new API key
  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (keyName.trim().length < 2) {
      setError("API key name must contain at least 2 characters.");
      return;
    }

    setCreating(true);

    try {
      const response = await api.post<APIKeyCreated>(
        `/applications/${applicationId}/api-keys/`,
        {
          name: keyName.trim(),
        }
      );

      setGeneratedKey(response.data);
      setKeyName("");
      setCopied(false);

      await fetchKeys();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to generate API key."
      );
    } finally {
      setCreating(false);
    }
  };

  // Copy generated secret
  const handleCopy = async () => {
    if (!generatedKey) return;

    try {
      await navigator.clipboard.writeText(
        generatedKey.api_key
      );

      setCopied(true);
    } catch {
      setError(
        "Clipboard access failed. Please copy the key manually."
      );
    }
  };

  // Revoke an API key
  const handleRevoke = async (key: APIKey) => {
    const confirmed = window.confirm(
      `Are you sure you want to revoke "${key.name}"? Applications using this key will no longer be able to authenticate log ingestion.`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(
        `/applications/${applicationId}/api-keys/${key.id}`
      );

      await fetchKeys();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to revoke API key."
      );
    }
  };

  const closeGeneratedKey = () => {
    setGeneratedKey(null);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">

      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
              <KeyRound size={22} />
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg">
                API Key Management
              </h2>

              <p className="text-slate-400 text-xs mt-1">
                {applicationName} · Application ID: #{applicationId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close API key manager"
            className="text-slate-400 hover:text-white"
          >
            <X size={21} />
          </button>

        </div>

        <div className="p-5 space-y-6">

          {/* Newly generated key */}
          {generatedKey && (
            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-5 space-y-4">

              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck size={20} />

                <h3 className="font-semibold">
                  API Key Generated Successfully
                </h3>
              </div>

              <p className="text-sm text-slate-300">
                Copy and securely store this key now. You cannot
                retrieve the secret again after closing this message.
              </p>

              <div className="bg-[#090d16] border border-slate-700 rounded-lg p-3 flex flex-wrap items-center gap-3">

                <code className="flex-1 min-w-0 break-all text-sm text-emerald-300">
                  {generatedKey.api_key}
                </code>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-3 py-2 rounded-lg text-white text-sm"
                >
                  {copied ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}

                  {copied ? "Copied" : "Copy"}
                </button>

              </div>

              <button
                onClick={closeGeneratedKey}
                className="text-sm text-slate-300 hover:text-white underline"
              >
                I've saved the key
              </button>

            </div>
          )}

          {/* Generate API key */}
          <div className="bg-[#0d1422] border border-slate-800 rounded-xl p-5">

            <h3 className="text-white font-semibold mb-1">
              Generate New API Key
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Create a credential for authenticating log ingestion.
            </p>

            <form
              onSubmit={handleCreate}
              className="flex flex-wrap gap-3"
            >

              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                minLength={2}
                maxLength={100}
                required
                placeholder="e.g. Production Backend"
                className="flex-1 min-w-[180px] bg-[#090d16] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500"
              />

              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 px-4 py-3 rounded-lg text-white text-sm font-medium"
              >
                {creating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}

                {creating ? "Generating..." : "Generate Key"}
              </button>

            </form>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {/* Existing API keys */}
          <div>

            <div className="flex items-center justify-between mb-4">

              <div>
                <h3 className="text-white font-semibold">
                  Existing API Keys
                </h3>

                <p className="text-slate-500 text-xs mt-1">
                  {keys.length} key(s) registered
                </p>
              </div>

              <button
                onClick={fetchKeys}
                disabled={loading}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

            </div>

            {loading ? (
              <div className="p-8 flex justify-center gap-3 text-slate-400">
                <RefreshCw size={18} className="animate-spin" />
                Loading API keys...
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center border border-dashed border-slate-700 rounded-xl p-8">

                <KeyRound
                  size={30}
                  className="mx-auto text-slate-600 mb-3"
                />

                <p className="text-white text-sm font-medium">
                  No API keys generated
                </p>

                <p className="text-slate-500 text-xs mt-2">
                  Generate your first key to authenticate log ingestion.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="bg-[#0d1422] border border-slate-800 rounded-xl p-4"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                          <KeyRound size={19} />
                        </div>

                        <div>
                          <p className="text-white text-sm font-medium">
                            {key.name}
                          </p>

                          <code className="text-slate-500 text-xs">
                            {key.key_prefix}••••••••
                          </code>
                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            key.is_active
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {key.is_active ? "Active" : "Revoked"}
                        </span>

                        {key.is_active && (
                          <button
                            onClick={() => handleRevoke(key)}
                            title="Revoke API key"
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-slate-500">

                      <span>
                        Created:{" "}
                        {new Date(key.created_at).toLocaleDateString("en-IN")}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={13} />

                        Last used:{" "}
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleString("en-IN")
                          : "Never"}
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-sm"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}
