
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface LogTrend {
  date: string;
  errors: number;
  warnings: number;
  info: number;
  total: number;
}

interface Props {
  data: LogTrend[];
}

export default function LogTrendChart({ data }: Props) {
  const chartData = data.map((item) => ({
    ...item,
    displayDate: new Date(`${item.date}T00:00:00`).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "short" }
    ),
  }));

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
      <div className="mb-6">
        <h3 className="text-white font-semibold text-lg">
          Log Activity Trends
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Daily log volume by severity · Last 7 days
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
          No log activity recorded during this period.
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#273449" />

              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />

              <YAxis
                stroke="#64748b"
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />

              <Legend />

              <Area
                type="monotone"
                dataKey="errors"
                name="Errors"
                stroke="#f87171"
                fill="url(#errorGradient)"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="warnings"
                name="Warnings"
                stroke="#fbbf24"
                fill="url(#warningGradient)"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="info"
                name="Info"
                stroke="#60a5fa"
                fill="url(#infoGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
