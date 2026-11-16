
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, LockKeyhole, Mail } from "lucide-react";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      sessionStorage.setItem(
        "loglens_token",
        response.data.access_token
      );

      sessionStorage.setItem("loglens_email", email.trim());

      navigate("/", { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        "Unable to connect to the server. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 p-3 rounded-xl">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LogLens</h1>
              <p className="text-xs text-slate-400">
                Monitoring Platform
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white">
            Welcome back
          </h2>

          <p className="text-slate-400 mt-2 mb-7 text-sm">
            Sign in to access your monitoring dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email address
              </label>

              <div className="flex items-center gap-3 bg-[#090d16] border border-slate-700 rounded-lg px-3">
                <Mail size={18} className="text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full py-3 bg-transparent outline-none text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 bg-[#090d16] border border-slate-700 rounded-lg px-3">
                <LockKeyhole size={18} className="text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full py-3 bg-transparent outline-none text-white text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          <p className="text-center text-xs text-slate-500 mt-7">
            Secure application monitoring powered by LogLens
          </p>
        </div>

      </div>
    </div>
  );
}
