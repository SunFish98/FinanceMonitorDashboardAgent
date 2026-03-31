'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { FedProbability, RateProbability } from '@/lib/types';

interface RateProbabilityChartProps {
  probabilities: FedProbability[];
  isLoading?: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RateProbability }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-text-primary font-semibold mb-1">{data.rate}%</p>
        <p className="text-accent-blue">概率: {data.probability.toFixed(1)}%</p>
        <p className="text-text-secondary">变化: {data.change > 0 ? '+' : ''}{data.change} BP</p>
      </div>
    );
  }
  return null;
}

function getBarColor(change: number): string {
  if (change > 0) return '#ff4d6d';
  if (change === 0) return '#ffd60a';
  if (change <= -50) return '#4d9fff';
  return '#00d4aa';
}

function MeetingCard({ fedProb }: { fedProb: FedProbability }) {
  const sortedProbs = [...fedProb.probabilities].sort((a, b) => b.probability - a.probability);
  const topProb = sortedProbs[0];

  return (
    <div className="bg-dashboard-card-alt border border-dashboard-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">{fedProb.meetingLabel}</h4>
          <p className="text-xs text-text-muted mt-0.5">
            最可能结果: <span className="text-accent-yellow">{fedProb.mostLikelyOutcome}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold font-terminal text-accent-blue">{topProb?.probability.toFixed(0)}%</div>
          <div className="text-xs text-text-muted">最高概率</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={fedProb.probabilities} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
          <XAxis dataKey="rate" tick={{ fontSize: 10, fill: '#8892b0' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#8892b0' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
            {fedProb.probabilities.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.change)} fillOpacity={entry === topProb ? 1 : 0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap gap-2">
        {sortedProbs.map((prob, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(14, 22, 41, 0.8)', border: `1px solid ${prob === topProb ? '#2a3f63' : '#1e2d4a'}` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: getBarColor(prob.change) }} />
            <span className="text-text-secondary">{prob.rate}%</span>
            <span className="font-bold font-mono" style={{ color: prob === topProb ? '#e8eaf0' : '#8892b0' }}>{prob.probability.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RateProbabilityChart({ probabilities, isLoading = false }: RateProbabilityChartProps) {
  if (isLoading) {
    return (
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-5 animate-pulse">
        <div className="h-5 bg-dashboard-border rounded w-2/3 mb-4" />
        {[1, 2].map((i) => <div key={i} className="h-48 bg-dashboard-border rounded mb-4" />)}
      </div>
    );
  }

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <span>📊</span>CME FedWatch 降息概率
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">基于联邦基金期货隐含概率</p>
        </div>
        <a href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline">
          查看完整数据 →
        </a>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent-red" /><span className="text-text-secondary">加息</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent-yellow" /><span className="text-text-secondary">维持</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent-green" /><span className="text-text-secondary">降息25BP</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent-blue" /><span className="text-text-secondary">降息50BP+</span></div>
      </div>

      <div className="space-y-4">
        {probabilities.slice(0, 3).map((prob, index) => (
          <MeetingCard key={index} fedProb={prob} />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-dashboard-border text-xs text-text-muted">
        数据来源: CME FedWatch Tool | 仅供参考，不构成投资建议
      </div>
    </div>
  );
}
