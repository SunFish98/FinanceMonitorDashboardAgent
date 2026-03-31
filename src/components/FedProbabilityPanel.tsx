'use client';

import { FedProbability } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface FedProbabilityPanelProps {
  probabilities: FedProbability[];
}

function getBarColor(change: number): string {
  if (change < 0) return '#00d4aa';
  if (change > 0) return '#ff4d6d';
  return '#8892b0';
}

function MeetingCard({ fp }: { fp: FedProbability }) {
  const sorted = [...fp.probabilities].sort((a, b) => b.probability - a.probability);
  const top = sorted[0];

  return (
    <div className="bg-dashboard-card-alt border border-dashboard-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-text-primary">{fp.meetingLabel}</div>
          <div className="text-xs text-text-muted mt-0.5">{fp.meetingDate}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-secondary">最可能结果</div>
          <div className="text-xs font-medium text-accent-gold mt-0.5">{fp.mostLikelyOutcome}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={fp.probabilities}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <XAxis
              dataKey="rate"
              tick={{ fontSize: 9, fill: '#8892b0' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#8892b0' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as FedProbability['probabilities'][0];
                  return (
                    <div className="bg-dashboard-card border border-dashboard-border px-2 py-1.5 rounded text-xs">
                      <div className="text-text-primary font-mono">{d.rate}%</div>
                      <div className="text-accent-blue">{d.probability.toFixed(1)}%</div>
                      <div className="text-text-muted">
                        {d.change > 0 ? '+' : ''}{d.change} bp
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="probability" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {fp.probabilities.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.change)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Probability rows */}
      <div className="mt-2 space-y-1">
        {sorted.slice(0, 3).map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-1.5 rounded-full flex-1"
              style={{
                background: `linear-gradient(to right, ${getBarColor(p.change)}${Math.round(p.probability * 2.55).toString(16).padStart(2,'0')}, transparent)`,
                width: `${p.probability}%`,
                maxWidth: '100%',
              }}
            />
            <span className="text-[10px] font-mono text-text-secondary w-8 text-right">
              {p.probability.toFixed(0)}%
            </span>
            <span className="text-[10px] text-text-muted w-20 truncate">{p.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FedProbabilityPanel({ probabilities }: FedProbabilityPanelProps) {
  if (!probabilities || probabilities.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full bg-accent-gold" />
        <h2 className="text-sm font-semibold text-text-primary">CME FedWatch — 降息概率</h2>
        <div className="flex-1 h-px bg-dashboard-border" />
        <a
          href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
        >
          查看原始数据 →
        </a>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent-green" />
          <span>降息</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-text-secondary" />
          <span>维持不变</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent-red" />
          <span>加息</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {probabilities.map((fp) => (
          <MeetingCard key={fp.meetingDate} fp={fp} />
        ))}
      </div>
    </section>
  );
}
