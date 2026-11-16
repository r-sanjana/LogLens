
import { Search, Bell, CircleUserRound } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 px-8">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Application Monitoring
        </h2>
        <p className="text-xs text-slate-500">
          Monitor logs, incidents and application health
        </p>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-slate-400 hover:text-white">
          <Search size={20} />
        </button>

        <button className="relative text-slate-400 hover:text-white">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2">
          <CircleUserRound size={27} className="text-indigo-400" />
          <span className="text-sm text-slate-300">Admin</span>
        </div>
      </div>
    </header>
  );
}
