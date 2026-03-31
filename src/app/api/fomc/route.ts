import { NextResponse } from 'next/server';
import { FOMCMeeting } from '@/lib/types';

const FOMC_MEETINGS_2025_2026: FOMCMeeting[] = [
  // 2025 Meetings
  {
    id: 'fomc-2025-01',
    date: '2025-01-29',
    endDate: '2025-01-29',
    status: 'past',
    rateDecision: 0,
    currentRate: 4.25,
    notes: '维持联邦基金利率目标区间4.25%-4.50%不变',
  },
  {
    id: 'fomc-2025-03',
    date: '2025-03-19',
    endDate: '2025-03-19',
    status: 'past',
    rateDecision: 0,
    currentRate: 4.25,
    notes: '维持联邦基金利率目标区间4.25%-4.50%不变，关注通胀和就业双重目标',
  },
  {
    id: 'fomc-2025-05',
    date: '2025-05-07',
    endDate: '2025-05-07',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '市场预期维持不变，关注通胀数据走势',
  },
  {
    id: 'fomc-2025-06',
    date: '2025-06-18',
    endDate: '2025-06-18',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '市场预期可能降息25BP，取决于通胀和就业数据',
  },
  {
    id: 'fomc-2025-07',
    date: '2025-07-30',
    endDate: '2025-07-30',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '降息路径取决于上半年经济数据表现',
  },
  {
    id: 'fomc-2025-09',
    date: '2025-09-17',
    endDate: '2025-09-17',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '经济展望评估，可能调整点阵图预测',
  },
  {
    id: 'fomc-2025-10',
    date: '2025-10-29',
    endDate: '2025-10-29',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '年末政策方向确认',
  },
  {
    id: 'fomc-2025-12',
    date: '2025-12-10',
    endDate: '2025-12-10',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '年终会议，发布最新经济预测摘要（SEP）',
  },
  // 2026 Meetings
  {
    id: 'fomc-2026-01',
    date: '2026-01-28',
    endDate: '2026-01-28',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '2026年首次会议',
  },
  {
    id: 'fomc-2026-03',
    date: '2026-03-18',
    endDate: '2026-03-18',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '季度经济预测更新',
  },
  {
    id: 'fomc-2026-04',
    date: '2026-04-29',
    endDate: '2026-04-29',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '2026年第三次会议',
  },
  {
    id: 'fomc-2026-06',
    date: '2026-06-17',
    endDate: '2026-06-17',
    status: 'upcoming',
    currentRate: 4.25,
    notes: '年中政策展望',
  },
];

function updateMeetingStatuses(meetings: FOMCMeeting[]): FOMCMeeting[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return meetings.map((meeting) => {
    const meetingDate = new Date(meeting.date);
    const daysDiff = Math.floor(
      (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: FOMCMeeting['status'];
    if (meeting.date < todayStr) {
      status = 'past';
    } else if (daysDiff <= 7) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    return { ...meeting, status };
  });
}

export async function GET() {
  const meetings = updateMeetingStatuses(FOMC_MEETINGS_2025_2026);
  const currentRate = 4.25; // Current federal funds rate (mid-point)

  const upcomingMeetings = meetings
    .filter((m) => m.status !== 'past')
    .slice(0, 6);

  const pastMeetings = meetings
    .filter((m) => m.status === 'past')
    .slice(-3)
    .reverse();

  return NextResponse.json({
    meetings,
    upcomingMeetings,
    pastMeetings,
    currentRate,
    currentRateRange: '4.25% - 4.50%',
    lastUpdated: new Date().toISOString(),
  });
}
