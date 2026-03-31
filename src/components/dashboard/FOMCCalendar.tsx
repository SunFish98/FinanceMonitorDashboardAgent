'use client';

import { FOMCMeeting } from '@/lib/types';

interface FOMCCalendarProps {
  meetings: FOMCMeeting[];
  currentRate: number;
  currentRateRange: string;
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ date }: { date: string }) {
  const days = getDaysUntil(date);
  if (days < 0) return null;
  if (days === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red border border-accent-red/30 font-medium">今日</span>;
  if (days <= 7) return <span className="text-xs px-2 py-0.5 rounded-full bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30 font-medium">{days}天后</span>;
  if (days <= 30) return <span className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/30">{days}天后</span>;
  return <span className="text-xs text-text-muted">{days}天后</span>;
}

function RateChangeBadge({ change }: { change?: number }) {
  if (change === undefined || change === null) return <span className="text-xs px-2 py-0.5 rounded bg-text-muted/20 text-text-muted">待定</span>;
  if (change === 0) return <span className="text-xs px-2 py-0.5 rounded bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/20">维持不变</span>;
  if (change > 0) return <span className="text-xs px-2 py-0.5 rounded bg-accent-red/20 text-accent-red border border-accent-red/20">+{change}BP 加息</span>;
  return <span className="text-xs px-2 py-0.5 rounded bg-accent-green/20 text-accent-green border border-accent-green/20">{change}BP 降息</span>;
}

export default function FOMCCalendar({ meetings, currentRate, currentRateRange, isLoading = false }: FOMCCalendarProps) {
  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming' || m.status === 'current').slice(0, 6);
  const pastMeetings = meetings.filter((m) => m.status === 'past').slice(-3).reverse();
  const nextMeeting = upcomingMeetings[0];

  if (isLoading) {
    return (
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-5 animate-pulse">
        <div className="h-5 bg-dashboard-border rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-dashboard-border rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <span className="text-accent-blue">🏦</span>FOMC会议日历
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">美联储联邦公开市场委员会会议安排</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted">当前利率目标区间</div>
          <div className="text-lg font-bold font-terminal text-accent-gold">{currentRateRange}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-dashboard-card-alt rounded-lg p-3 text-center">
          <div className="text-xs text-text-muted mb-1">联邦基金利率</div>
          <div className="text-xl font-bold font-terminal text-accent-gold">{currentRate.toFixed(2)}%</div>
          <div className="text-xs text-text-secondary">中间值</div>
        </div>
        <div className="bg-dashboard-card-alt rounded-lg p-3 text-center">
          <div className="text-xs text-text-muted mb-1">2025年降息次数</div>
          <div className="text-xl font-bold font-terminal text-accent-blue">1-2次</div>
          <div className="text-xs text-text-secondary">市场预期</div>
        </div>
        <div className="bg-dashboard-card-alt rounded-lg p-3 text-center">
          <div className="text-xs text-text-muted mb-1">下次会议</div>
          <div className="text-base font-bold font-terminal text-text-primary">
            {nextMeeting ? formatShortDate(nextMeeting.date) : 'N/A'}
          </div>
          <div className="text-xs text-text-secondary">
            {nextMeeting && <CountdownBadge date={nextMeeting.date} />}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">即将召开的会议</h4>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-dashboard-border" />
          <div className="space-y-3">
            {upcomingMeetings.map((meeting, index) => (
              <div key={meeting.id} className="relative pl-10">
                <div className={`absolute left-3 top-3 w-2.5 h-2.5 rounded-full border-2 -translate-x-1/2 ${index === 0 ? 'bg-accent-blue border-accent-blue' : 'bg-dashboard-card-alt border-dashboard-border-light'}`} />
                <div className={`p-3 rounded-lg border ${index === 0 ? 'bg-accent-blue/5 border-accent-blue/30' : 'bg-dashboard-card-alt border-dashboard-border'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-terminal text-text-primary">{formatDate(meeting.date)}</span>
                      <CountdownBadge date={meeting.date} />
                    </div>
                    <RateChangeBadge change={meeting.rateDecision} />
                  </div>
                  {meeting.notes && <p className="text-xs text-text-muted leading-relaxed">{meeting.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pastMeetings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">近期已召开会议</h4>
          <div className="space-y-2">
            {pastMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-2.5 rounded-lg bg-dashboard-card-alt border border-dashboard-border opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                  <span className="text-xs font-terminal text-text-muted">{formatDate(meeting.date)}</span>
                </div>
                <RateChangeBadge change={meeting.rateDecision} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
