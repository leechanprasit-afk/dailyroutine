'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoutineItem, RoutineStatus, DEFAULT_EXERCISES, DEFAULT_FOCUS_BLOCKS, DEFAULT_ROUTINES } from '@/lib/data';
import {
  getDailyStatus,
  setRoutineStatus,
  getRoutines,
  saveWeeklySnapshot,
} from '@/lib/storage';

import RoutineCard from '@/components/RoutineCard';
import AlarmPopup from '@/components/AlarmPopup';
import WorkoutTimer from '@/components/WorkoutTimer';
import FocusMode from '@/components/FocusMode';
import LunchMenu from '@/components/LunchMenu';
import WeeklyProgress from '@/components/WeeklyProgress';

export default function Home() {
  const [routines, setRoutines] = useState<RoutineItem[]>(DEFAULT_ROUTINES);
  const [statuses, setStatuses] = useState<Record<string, RoutineStatus>>({});
  const [now, setNow] = useState(new Date());

  // Modals
  const [alarmRoutine, setAlarmRoutine] = useState<RoutineItem | null>(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [showLunch, setShowLunch] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);

  // Track which alarms already fired today
  const [firedAlarms, setFiredAlarms] = useState<Set<string>>(new Set());

  // Snooze registry: { routineId: snoozeEndTime }
  const [snoozeMap, setSnoozeMap] = useState<Record<string, number>>({});

  // Load data from localStorage (client only)
  useEffect(() => {
    setRoutines(getRoutines());
    setStatuses(getDailyStatus());
  }, []);

  // Clock tick every 30 seconds
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Save weekly snapshot whenever statuses change
  useEffect(() => {
    if (routines.length === 0) return;
    const done = Object.values(statuses).filter(s => s === 'done').length;
    saveWeeklySnapshot(routines.length, done);
  }, [statuses, routines]);

  // Check for due alarms
  const checkAlarms = useCallback(() => {
    if (routines.length === 0) return;
    const nowMins = now.getHours() * 60 + now.getMinutes();

    for (const r of routines) {
      const [h, m] = r.time.split(':').map(Number);
      const routineMins = h * 60 + m;
      const diff = nowMins - routineMins;

      // Fire if within 0–2 minutes of scheduled time, not already fired, not done/skipped
      if (
        diff >= 0 &&
        diff <= 2 &&
        !firedAlarms.has(r.id) &&
        statuses[r.id] !== 'done' &&
        statuses[r.id] !== 'skip'
      ) {
        // Check snooze
        if (snoozeMap[r.id] && Date.now() < snoozeMap[r.id]) continue;

        setFiredAlarms(prev => new Set(prev).add(r.id));
        setAlarmRoutine(r);
        // Try browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Focus with Lee — ${r.title}`, { body: r.message });
        }
        break; // show one at a time
      }
    }
  }, [routines, now, firedAlarms, statuses, snoozeMap]);

  useEffect(() => {
    checkAlarms();
  }, [checkAlarms]);

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  function updateStatus(id: string, status: RoutineStatus) {
    setStatuses(prev => ({ ...prev, [id]: status }));
    setRoutineStatus(id, status);
  }

  function handleSnooze(routine: RoutineItem, minutes: number) {
    setSnoozeMap(prev => ({ ...prev, [routine.id]: Date.now() + minutes * 60 * 1000 }));
    updateStatus(routine.id, 'snoozed');
    setAlarmRoutine(null);
    // Remove from fired so it can re-fire after snooze
    setFiredAlarms(prev => {
      const s = new Set(prev);
      s.delete(routine.id);
      return s;
    });
  }

  // Determine active routines (within ±30 min window)
  function isActiveNow(routine: RoutineItem) {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [h, m] = routine.time.split(':').map(Number);
    const routineMins = h * 60 + m;
    return Math.abs(nowMins - routineMins) <= 30;
  }

  // Group routines into upcoming vs past
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const upcoming = routines.filter(r => {
    const [h, m] = r.time.split(':').map(Number);
    return h * 60 + m >= nowMins - 60;
  });
  const past = routines.filter(r => {
    const [h, m] = r.time.split(':').map(Number);
    return h * 60 + m < nowMins - 60;
  });

  const doneCount = Object.values(statuses).filter(s => s === 'done').length;
  const totalCount = routines.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  function openDetail(routine: RoutineItem) {
    setAlarmRoutine(null);
    if (routine.type === 'exercise') setShowWorkout(true);
    else if (routine.type === 'focus') setShowFocus(true);
    else if (routine.type === 'lunch') setShowLunch(true);
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#fdf6f0' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-6 pb-4" style={{ background: '#fdf6f0' }}>
        <div className="max-w-md mx-auto">
          {/* App title + weekly button */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#4a3f35' }}>Focus with Lee 🌸</h1>
              <p className="text-xs text-gray-400">{dateStr}</p>
            </div>
            <div className="flex gap-2">
              {/* Test alarm button */}
              <button
                onClick={() => routines.length > 0 && setAlarmRoutine(routines[0])}
                title="Test alarm sound"
                className="flex flex-col items-center px-3 py-2 rounded-2xl shadow-sm hover:opacity-90 active:scale-95"
                style={{ background: '#fef3e2' }}
              >
                <span className="text-lg">🔔</span>
                <span className="text-xs font-medium" style={{ color: '#92400e' }}>Test</span>
              </button>
              <button
                onClick={() => setShowWeekly(true)}
                className="flex flex-col items-center px-3 py-2 rounded-2xl shadow-sm hover:opacity-90 active:scale-95"
                style={{ background: '#f9a8c9' }}
              >
                <span className="text-lg">📊</span>
                <span className="text-xs text-white font-medium">Week</span>
              </button>
            </div>
          </div>

          {/* Current time + progress */}
          <div className="flex items-center justify-between p-4 rounded-2xl shadow-sm" style={{ background: '#ffffff' }}>
            <div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: '#4a3f35' }}>{timeStr}</p>
              <p className="text-xs text-gray-400 mt-0.5">{doneCount} of {totalCount} routines done</p>
            </div>
            {/* Circular progress */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke="#f9a8c9"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: '#4a3f35' }}>{pct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routine list */}
      <div className="max-w-md mx-auto px-4 space-y-3">
        {/* Upcoming / current */}
        {upcoming.length > 0 && (
          <div className="space-y-3">
            {upcoming.map(r => (
              <RoutineCard
                key={r.id}
                routine={r}
                status={statuses[r.id] || 'pending'}
                isActive={isActiveNow(r)}
                onDone={() => updateStatus(r.id, statuses[r.id] === 'done' ? 'pending' : 'done')}
                onSkip={() => updateStatus(r.id, 'skip')}
                onOpen={() => openDetail(r)}
              />
            ))}
          </div>
        )}

        {/* Past routines */}
        {past.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 mt-4">Earlier today</p>
            <div className="space-y-2">
              {past.map(r => (
                <RoutineCard
                  key={r.id}
                  routine={r}
                  status={statuses[r.id] || 'pending'}
                  isActive={false}
                  onDone={() => updateStatus(r.id, statuses[r.id] === 'done' ? 'pending' : 'done')}
                  onSkip={() => updateStatus(r.id, 'skip')}
                  onOpen={() => openDetail(r)}
                />
              ))}
            </div>
          </div>
        )}

        {routines.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌸</p>
            <p>Loading your routines...</p>
          </div>
        )}
      </div>

      {/* Bottom quick-action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-6 pt-3" style={{ background: 'linear-gradient(to top, #fdf6f0, transparent)' }}>
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => setShowWorkout(true)}
            className="flex-1 flex flex-col items-center py-3 rounded-2xl shadow-sm active:scale-95"
            style={{ background: '#dcfce7' }}
          >
            <span className="text-xl">🏃‍♀️</span>
            <span className="text-xs font-medium mt-0.5" style={{ color: '#166534' }}>Workout</span>
          </button>
          <button
            onClick={() => setShowFocus(true)}
            className="flex-1 flex flex-col items-center py-3 rounded-2xl shadow-sm active:scale-95"
            style={{ background: '#ede9fe' }}
          >
            <span className="text-xl">🎯</span>
            <span className="text-xs font-medium mt-0.5" style={{ color: '#7c3aed' }}>Focus</span>
          </button>
          <button
            onClick={() => setShowLunch(true)}
            className="flex-1 flex flex-col items-center py-3 rounded-2xl shadow-sm active:scale-95"
            style={{ background: '#fef9c3' }}
          >
            <span className="text-xl">🥗</span>
            <span className="text-xs font-medium mt-0.5" style={{ color: '#92400e' }}>Lunch</span>
          </button>
          <button
            onClick={() => setShowWeekly(true)}
            className="flex-1 flex flex-col items-center py-3 rounded-2xl shadow-sm active:scale-95"
            style={{ background: '#fce7f3' }}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs font-medium mt-0.5" style={{ color: '#9d174d' }}>Progress</span>
          </button>
        </div>
      </div>

      {/* Alarm popup */}
      {alarmRoutine && (
        <AlarmPopup
          routine={alarmRoutine}
          onDone={() => {
            updateStatus(alarmRoutine.id, 'done');
            setAlarmRoutine(null);
          }}
          onSkip={() => {
            updateStatus(alarmRoutine.id, 'skip');
            setAlarmRoutine(null);
          }}
          onSnooze={(minutes) => handleSnooze(alarmRoutine, minutes)}
          onOpenDetail={() => openDetail(alarmRoutine)}
        />
      )}

      {/* Workout timer modal */}
      {showWorkout && (
        <WorkoutTimer
          exercises={
            routines.find(r => r.type === 'exercise')?.exercises ||
            DEFAULT_EXERCISES
          }
          onComplete={() => {
            const ex = routines.find(r => r.type === 'exercise');
            if (ex) updateStatus(ex.id, 'done');
          }}
          onClose={() => setShowWorkout(false)}
        />
      )}

      {/* Focus mode modal */}
      {showFocus && (
        <FocusMode
          blocks={
            routines.find(r => r.type === 'focus')?.focusBlocks ||
            DEFAULT_FOCUS_BLOCKS
          }
          onComplete={() => {
            const f = routines.find(r => r.type === 'focus');
            if (f) updateStatus(f.id, 'done');
          }}
          onClose={() => setShowFocus(false)}
        />
      )}

      {/* Lunch menu modal */}
      {showLunch && <LunchMenu onClose={() => setShowLunch(false)} />}

      {/* Weekly progress modal */}
      {showWeekly && <WeeklyProgress onClose={() => setShowWeekly(false)} />}
    </div>
  );
}
