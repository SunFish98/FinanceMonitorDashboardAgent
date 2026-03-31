'use client';

import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { FredObservation, IndicatorStatus } from '@/lib/types';

interface MiniChartProps {
  observations: FredObservation[];
  status?: IndicatorStatus;
}

const STATUS_COLORS: Record<string, string> = {
  beat: '#00d4aa',
  miss: '#ff4d6d',
  inline: '#ffd60a',
  pending: '#8892b0',
};

export default function MiniChart({ observations, status }: MiniChartProps) {
  const color = STATUS_COLORS[status || 'pending'];

  const data = observations.map((obs) => ({
    date: obs.date,
    value: parseFloat(obs.value),
  })).filter((d) => !isNaN(d.value));

  if (data.length < 2) return null;

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${status}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-dashboard-card border border-dashboard-border px-2 py-1 rounded text-[10px] text-text-secondary">
                    {payload[0].payload.date}: {Number(payload[0].value).toFixed(2)}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${status})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
