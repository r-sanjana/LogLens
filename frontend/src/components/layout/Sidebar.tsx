
import {
  Activity,
  LayoutDashboard,
  Boxes,
  ScrollText,
  AlertTriangle,
  Bell,
  ChartNoAxesCombined,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Applications", path: "/applications", icon: Boxes },
  { name: "Logs Explorer", path: "/logs", icon: ScrollText },
  { name: "Incidents", path: "/incidents", icon: AlertTriangle },
  { name: "Alerts", path: "/alerts", icon: Bell },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#0d1422] px-5 py-6">
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-600 p-2">
          <Activity size={23} className="text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            LogLens
          </h1>
          <p className="text-xs text-slate-500">
            Monitoring Platform
          </p>
        </div>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Workspace
      </p>

      <nav className="flex flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-5">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Settings size={19} />
          Settings
        </NavLink>

        <div className="mt-5 flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
          <ShieldCheck size={20} className="text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-white">
              System Status
            </p>
            <p className="text-xs text-emerald-400">
              Monitoring active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
