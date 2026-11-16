 
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  ShieldCheck,
  LockKeyhole,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";

import api from "../services/api";

interface UserProfile {
  id: number;
  email: string;
  is_active: boolean;
}

export default function Settings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<UserProfile>("/users/me");
      setProfile(response.data);

      // Keep the displayed email synchronized with the backend.
      sessionStorage.setItem("loglens_email", response.data.email);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your account information."
      );

      if (err.response?.status === 401) {
        sessionStorage.removeItem("loglens_token");
        sessionStorage.removeItem("loglens_email");
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    setLoggingOut(true);

    sessionStorage.removeItem("loglens_token");
    sessionStorage.removeItem("loglens_email");

    navigate("/login", { replace: true });
  };

  const accountEmail =
    profile?.email ||
    sessionStorage.getItem("loglens_email") ||
    "Not available";

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Settings
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Manage your LogLens account and security preferences.
          </p>
        </div>

        <button
          onClick={fetchProfile}
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-white font-semibold">
                Profile Information
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Your registered LogLens account details.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#0d1422] text-slate-400">
                <Mail size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Email Address
                </p>

                <p className="text-sm text-white mt-1">
                  {loading ? "Loading..." : accountEmail}
                </p>
              </div>
            </div>

            <span className="text-xs text-slate-500">
              Registered account
            </span>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#0d1422] text-slate-400">
                <UserRound size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  User ID
                </p>

                <p className="text-sm text-white mt-1">
                  {loading ? "Loading..." : profile?.id ?? "—"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Account Status */}
      <section className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-white font-semibold">
                Account Status
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Current account activation status.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">

          {loading ? (
            <p className="text-sm text-slate-400">
              Checking account status...
            </p>
          ) : profile ? (
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={20}
                  className={
                    profile.is_active
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                />

                <div>
                  <p className="text-sm text-white">
                    {profile.is_active
                      ? "Your account is active"
                      : "Your account is inactive"}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Account status retrieved from the backend.
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.is_active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {profile.is_active ? "Active" : "Inactive"}
              </span>

            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Account information is unavailable.
            </p>
          )}

        </div>
      </section>

      {/* Security Section */}
      <section className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">

        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <LockKeyhole size={22} />
            </div>

            <div>
              <h2 className="text-white font-semibold">
                Security
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Authentication and session information.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">

          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="text-emerald-400 mt-0.5"
            />

            <div>
              <p className="text-sm text-white">
                JWT Authentication
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Protected API requests use Bearer token authentication.
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-start gap-3">
            <Activity
              size={19}
              className="text-blue-400 mt-0.5"
            />

            <div>
              <p className="text-sm text-white">
                Session Storage
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Your access token is stored in the current browser session.
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-start gap-3">
            <LockKeyhole
              size={19}
              className="text-violet-400 mt-0.5"
            />

            <div>
              <p className="text-sm text-white">
                Password Protection
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Passwords are managed securely by the backend authentication system.
                Password changes are not currently available in this version.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Logout Section */}
      <section className="bg-[#111827] border border-red-500/20 rounded-xl p-5">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-white font-semibold">
              Sign Out
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              End your current LogLens browser session.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50 text-sm font-medium"
          >
            <LogOut size={17} />
            {loggingOut ? "Signing out..." : "Sign Out"}
          </button>

        </div>
      </section>

      {/* Footer */}
      <p className="text-xs text-slate-500 text-center">
        LogLens Monitoring Platform · Account Settings
      </p>

    </div>
  );
}
