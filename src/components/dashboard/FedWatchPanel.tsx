'use client';

import { FOMCMeeting, FedProbability } from '@/lib/types';
import { getDaysUntil, cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface FedWatchPanelProps {
  meetings: FOMCMeeting[];
  probabilities: FedProbability[];
  currentRate: number;
  currentRateRange: string;
  isLoading: boolean;
}

function getBarColor(change: number): string {
  if (change < 0) return '#00d4aa';
  if (change > 0) return '#ff4d6d';
  return '#8892b0';
}

function ProbabilityCard({ fp }: { fp: FedProbability }) {
  return (
    <div className="bg-dashboard-card-alt border border-dashboard-border rounded-lg p-3">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div>
          <div className="text-xs font-medium text-text-primary">{fp.meetingLabel}</div>
          <div className="text-[10px] text-text-muted">{fp.meetingDate}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-text-muted">最可能</div>
          <div className="text-[10px] font-medium text-accent-gold">{fp.mostLikelyOutcome}</div>
        </div>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fp.probabilities} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
            <XAxis dataKey="rate" tick={{ fontSize: 8, fill: '#8892b0' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 8, fill: '#8892b0' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={({ active, payload }) => {
              if (active && payload?.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-dashboard-card border border-dashboard-border px-2 py-1 rounded text-xs">
                    <div className="text-text-primary">{d.rate}%</div>
                    <div className="text-accent-blue">{d.probability.toFixed(1)}%</div>
                  </div>
                );
              }
              return null;
            }} />
            <Bar dataKey="probability" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {fp.probabilities.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.change)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TimelineItem({ meeting }: { meeting: FOMCMeeting }) {
  const isUpcoming = meeting.status === 'upcoming';
  const isCurrent = meeting.status === 'current';
  const daysUntil = isUpcoming ? getDaysUntil(meeting.date) : null;

  return (
    <div className="flex gap-3">
      <div className={cn(
        'w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center z-10',
        isCurrent ? 'border-accent-green bg-accent-green/20' :
        isUpcoming ? 'border-accent-blue bg-accent-blue/10' :
        meeting.rateDecision && meeting.rateDecision < 0 ? 'border-accent-green bg-accent-green/10' :
        meeting.rateDecision && meeting.rateDecision > 0 ? 'border-accent-red bg-accent-red/10' :
        'border-dashboard-border-light bg-dashboard-card'
      )}>
        {isUpcoming ? (
          <span className="text-accent-blue text-[9px] font-bold">?</span>
        ) : meeting.rateDecision != null ? (
          <span className={cn('text-[9px] font-bold font-mono',
            meeting.rateDecision < 0 ? 'text-accent-green' :
            meeting.rateDecision > 0 ? 'text-accent-red' : 'text-text-secondary'
          )}>
            {meeting.rateDecision === 0 ? '=' : meeting.rateDecision < 0 ? `↓${Math.abs(meeting.rateDecision)}` : `↑${meeting.rateDecision}`}
          </span>
        ) : <span className="text-text-muted text-[9px]">—</span>}
      </div>

      <div className={cn(
        'flex-1 rounded-lg border px-3 py-2',
        isCurrent ? 'border-accent-green/30 bg-accent-green/5' :
        isUpcoming ? 'border-accent-blue/20 bg-accent-blue/5' :
        'border-dashboard-border bg-dashboard-card-alt'
      )}>
        <div className="flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-primary">
              {new Date(meeting.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {isCurrent && <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-green/20 text-accent-green border border-accent-green/30">进行中</span>}
            {isUpcoming && daysUntil !== null && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                {daysUntil > 0 ? `${daysUntil}天后` : '今日'}
              </span>
            )}
          </div>
          {meeting.currentRate != null && (
            <span className="text-[10px] font-mono text-text-muted">
              利率: <span className="text-accent-gold">{meeting.currentRate.toFixed(2)}%</span>
            </span>
          )}
        </div>
        {meeting.notes && <div className="text-[10px] text-text-secondary mt-0.5">{meeting.notes}</div>}
      </div>
    </div>
  );
}

export default function FedWatchPanel({ meetings, probabilities, currentRate, currentRateRange, isLoading }: FedWatchPanelProps) {
  const now = new Date();
  const visibleMeetings = meetings.filter((m) => {
    const daysDiff = (now.getTime() - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 90 || m.status === 'upcoming' || m.status === 'current';
  });

  return (
    <div className="space-y-6 mt-6">
      {/* FOMC Timeline */}
      <section className="bg-dashboard-card border border-dashboard-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary">🏦 FOMC会议时间线</h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-muted">当前利率目标区间</div>
            <div className="text-sm font-bold font-mono text-accent-gold">{currentRateRange}</div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-12 bg-dashboard-border rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-dashboard-border" />
            <div className="space-y-3">
              {visibleMeetings.map((m) => <TimelineItem key={m.id} meeting={m} />)}
            </div>
          </div>
        )}
      </section>

      {/* CME FedWatch Probabilities */}
      {probabilities.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-accent-gold" />
            <h2 className="text-sm font-semibold text-text-primary">CME FedWatch — 降息概率</h2>
            <div className="flex-1 h-px bg-dashboard-border" />
            <div className="flex items-center gap-3 text-[10px] text-text-secondary">
              <span><span className="text-accent-green">■</span> 降息</span>
              <span><span className="text-text-secondary">■</span> 维持</span>
              <span><span className="text-accent-red">■</span> 加息</span>
            </div>
            <a href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-blue hover:underline">
              查看原始数据 →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {probabilities.map((fp) => <ProbabilityCard key={fp.meetingDate} fp={fp} />)}
          </div>
        </section>
      )}
    </div>
  );
}
