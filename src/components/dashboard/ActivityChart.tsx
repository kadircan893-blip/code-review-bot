"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";

// Generate mock activity data for demo
function generateDemoData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), "MMM d"),
    reviews: Math.floor(Math.random() * 8),
    score: Math.floor(Math.random() * 30) + 65,
  }));
}

const DEMO_DATA = generateDemoData();

interface ActivityChartProps {
  data?: { date: string; reviews: number; score: number | null }[];
}

export function ActivityChart({ data = DEMO_DATA }: ActivityChartProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Review Activity</h3>
        <span className="text-zinc-500 text-sm">Last 30 days</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="reviewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "0.75rem",
              color: "#fafafa",
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 2" }}
          />
          <Area
            type="monotone"
            dataKey="reviews"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#reviewsGradient)"
            name="Reviews"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
