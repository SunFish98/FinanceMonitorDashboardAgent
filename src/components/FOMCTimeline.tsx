'use client';

import { FOMCMeeting } from '@/lib/types';
import { formatDate, getDaysUntil, cn } from '@/lib/utils';

interface FOMCTimelineProps {
  meetings: FOMCMeeting[];
}

export default function FOMCTimeline({ meetings }: FOMCTimelineProps) {
  const now = new Date();
  // Show recent past + all upcoming
  const visible = meetings.filter((m) => {
    const meetingDate = new Date(m.date);
    const daysDiff = (now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 120 || m.status === 'upcoming';
  });

  return (
    <section className="bg-dashboard-card border border-dashboard-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text-primary font-semibold text-base">FOMC会议时间线</h2>
        <span className="text-text-muted text-xs">联邦公开市场委员会</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-dashboard-border" />

        <div className="space-y-3">
          {visible.map((meeting, idx) => {
            const isUpcoming = meeting.status === 'upcoming';
            const isCurrent = meeting.status === 'current';
            const daysUntil = isUpcoming ? getDaysUntil(meeting.date) : null;

            return (
              <div key={meeting.id} className="flex gap-3 relative">
                {/* Dot */}
                <div
                  className={cn(
                    'w-9 h-9 shrink-0 rounded-full border-2 flex items-center justify-center z-10',
                    isCurrent
                      ? 'border-accent-green bg-accent-green/20 animate-pulse-slow'
                      : isUpcoming
                      ? 'border-accent-blue bg-accent-blue/10'
                      : meeting.rateDecision && meeting.rateDecision < 0
                      ? 'border-accent-green bg-accent-green/10'
                      : meeting.rateDecision && meeting.rateDecision > 0
                      ? 'border-accent-red bg-accent-red/10'
                      : 'border-dashboard-border-light bg-dashboard-card'
                  )}
                >
                  {isUpcoming ? (
                    <span className="text-accent-blue text-[9px] font-bold">?</span>
                  ) : meeting.rateDecision != null ? (
                    <span
                      className={cn(
                        'text-[9px] font-bold font-mono',
                        meeting.rateDecision < 0
                          ? 'text-accent-green'
                          : meeting.rateDecision > 0
                          ? 'text-accent-red'
                          : 'text-text-secondary'
                      )}
                    >
                      {meeting.rateDecision === 0
                        ? '='
                        : meeting.rateDecision < 0
                        ? `↓${Math.abs(meeting.rateDecision)}`
                        : `↑${meeting.rateDecision}`}
                    </span>
                  ) : (
                    <span className="text-text-muted text-[9px]">—</span>
                  )}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2',
                    isCurrent
                      ? 'border-accent-green/30 bg-accent-green/5'
                      : isUpcoming
                      ? 'border-accent-blue/20 bg-accent-blue/5'
                      : 'border-dashboard-border bg-dashboard-card-alt'
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary">
                        {formatDate(meeting.date)}
                        {meeting.endDate && ` - ${formatDate(meeting.endDate)}`}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-green/20 text-accent-green border border-accent-green/30">
                          进行中
                        </span>
                      )}
                      {isUpcoming && daysUntil !== null && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                          {daysUntil > 0 ? `${daysUntil}天后` : '今日'}
                        </span>
                      )}
                    </div>
                    {meeting.currentRate != null && (
                      <span className="text-xs font-mono text-text-secondary">
                        联邦基金利率: <span className="text-accent-gold">{meeting.currentRate.toFixed(2)}%</span>
                      </span>
                    )}
                  </div>
                  {meeting.notes && (
                    <div className="text-[11px] text-text-secondary mt-1">{meeting.notes}</div>
                  )}
                  {isUpcoming && (
                    <div className="text-[11px] text-text-muted mt-1">待定 — 关注经济数据</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
