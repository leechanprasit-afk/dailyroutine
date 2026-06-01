'use client';

import { getLast7Days } from '@/lib/storage';

interface Props {
  onClose: () => void;
}

export default function WeeklyProgress({ onClose }: Props) {
  const days = getLast7Days();
  const avgPct = days.length > 0
    ? Math.round(days.reduce((s, d) => s + d.pct, 0) / days.filter(d => d.pct > 0).length || 0)
    : 0;

  function getPctColor(pct: number) {
    if (pct >= 80) return '#a8d5b5';
    if (pct >= 50) return '#fde68a';
    if (pct > 0) return '#f9a8c9';
    return '#e5e7eb';
  }

  function getMessage(avg: number) {
    if (avg >= 80) return '🌸 Wonderful week! You are building great habits.';
    if (avg >= 60) return '✨ Good progress, Lee. Keep going!';
    if (avg >= 40) return '💛 Every small step counts. You can do it!';
    if (avg > 0) return '🌱 It\'s a start. Tomorrow is a fresh day.';
    return '📅 Start checking in daily to see your progress here.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#4a3f35' }}>Weekly Progress</h2>
            <p className="text-xs text-gray-400">Last 7 days</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-32 mb-3">
          {days.map((day, i) => {
            const isToday = i === 6;
            const height = day.pct > 0 ? Math.max(day.pct, 8) : 4;
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 gap-1">
                <span className="text-xs text-gray-400">{day.pct > 0 ? `${day.pct}%` : ''}</span>
                <div className="w-full rounded-xl flex-none" style={{
                  height: `${height}%`,
                  minHeight: 4,
                  background: isToday ? '#f9a8c9' : getPctColor(day.pct),
                  border: isToday ? '2px solid #ec4899' : 'none',
                  transition: 'height 0.5s ease',
                }} />
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex gap-2 mb-6">
          {days.map((day, i) => (
            <div key={day.date} className="flex-1 text-center">
              <p className="text-xs" style={{ color: i === 6 ? '#ec4899' : '#9ca3af', fontWeight: i === 6 ? 700 : 400 }}>
                {day.label}
              </p>
            </div>
          ))}
        </div>

        {/* Average badge */}
        <div className="flex items-center justify-between p-4 rounded-2xl mb-4" style={{ background: '#fdf6f0' }}>
          <div>
            <p className="text-xs text-gray-400">Weekly average</p>
            <p className="text-3xl font-bold" style={{ color: '#4a3f35' }}>{isNaN(avgPct) ? 0 : avgPct}%</p>
          </div>
          <div className="text-4xl">
            {(isNaN(avgPct) ? 0 : avgPct) >= 80 ? '🌟' : (isNaN(avgPct) ? 0 : avgPct) >= 50 ? '💪' : '🌱'}
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">{getMessage(isNaN(avgPct) ? 0 : avgPct)}</p>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl font-semibold text-sm"
          style={{ background: '#fdf6f0', color: '#4a3f35' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
