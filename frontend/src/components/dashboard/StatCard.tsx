
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  accent: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent,
}: StatCardProps) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h2 className="text-3xl font-bold text-white mt-3">
            {value.toLocaleString()}
          </h2>
        </div>

        <div className={`p-3 rounded-xl ${accent}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4">{description}</p>
    </div>
  );
}
