'use client';

import { RoutineItem, RoutineStatus, TYPE_ICONS } from '@/lib/data';

interface Props {
  routine: RoutineItem;
  status: RoutineStatus;
  isActive: boolean; // current time window
  onDone: () => void;
  onSkip: () => void;
  onOpen: () => void; // open detail (workout/focus/lunch)
}

const STATUS_STYLE: Record<RoutineStatus, { label: string; dot: string }> = {
  pending: { label: '', dot: '#d1d5db' },
  active: { label: 'Now', dot: '#f59e0b' },
  done: { label: 'Done ✓', dot: '#a8d5b5' },
  skip: { label: 'Skipped', dot: '#e5e7eb' },
  snoozed: { label: 'Snoozed', dot: '#fde68a' },
};

export default function RoutineCard({ routine, status, isActive, onDone, onSkip, onOpen }: Props) {
  const icon = TYPE_ICONS[routine.type];
  const statusInfo = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const isDone = status === 'done';
  const isSkipped = status === 'skip';
  const hasDetail = routine.type === 'exercise' || routine.type === 'focus' || routine.type === 'lunch';

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-200 ${isActive ? 'shadow-md scale-[1.01]' : 'shadow-sm'} ${isDone || isSkipped ? 'opacity-60' : ''}`}
      style={{
        background: routine.color || '#ffffff',
        border: isActive ? '2px solid rgba(0,0,0,0.12)' : '2px solid transparent',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className={`text-2xl mt-0.5 ${isActive && !isDone ? 'animate-pulse-soft' : ''}`}>
          {icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-gray-400 font-medium">{routine.timeLabel}</span>
            {statusInfo.label && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: statusInfo.dot + '60', color: '#4a3f35' }}
              >
                {statusInfo.label}
              </span>
            )}
            {isActive && status === 'pending' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 animate-pulse-soft">
                Now
              </span>
            )}
          </div>
          <h3 className={`font-bold text-base leading-tight ${isDone ? 'line-through text-gray-400' : ''}`} style={{ color: '#4a3f35' }}>
            {routine.title}
          </h3>
          {!isDone && !isSkipped && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{routine.message}</p>
          )}
        </div>
      </div>

      {/* Action buttons — show when active or not yet done */}
      {!isDone && !isSkipped && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onDone}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white active:scale-95"
            style={{ background: '#a8d5b5' }}
          >
            ✓ Done
          </button>
          {hasDetail && (
            <button
              onClick={onOpen}
              className="flex-1 py-2 rounded-xl text-sm font-semibold active:scale-95"
              style={{ background: 'rgba(255,255,255,0.7)', color: '#4a3f35' }}
            >
              {routine.type === 'exercise' ? '🏃 Start' :
               routine.type === 'focus' ? '🎯 Focus' :
               '🥗 Menu'}
            </button>
          )}
          <button
            onClick={onSkip}
            className="px-3 py-2 rounded-xl text-sm text-gray-400 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          >
            Skip
          </button>
        </div>
      )}

      {/* Undo if done */}
      {isDone && (
        <button
          onClick={onDone}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Undo
        </button>
      )}
    </div>
  );
}
