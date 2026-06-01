'use client';

import { useEffect, useRef, useState } from 'react';
import { RoutineItem, TYPE_ICONS } from '@/lib/data';
import {
  ALARM_SOUNDS,
  AlarmSoundId,
  PlayingAlarm,
  getAlarmPrefs,
  saveAlarmPrefs,
  playAlarm,
  previewAlarm,
} from '@/lib/alarm-sounds';

interface Props {
  routine: RoutineItem;
  onDone: () => void;
  onSkip: () => void;
  onSnooze: (minutes: number) => void;
  onOpenDetail: () => void;
}

export default function AlarmPopup({ routine, onDone, onSkip, onSnooze, onOpenDetail }: Props) {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Alarm prefs
  const prefs = getAlarmPrefs();
  const [soundId, setSoundId] = useState<AlarmSoundId>(prefs.soundId);
  const [volume, setVolume] = useState<number>(prefs.volume);

  const alarmRef = useRef<PlayingAlarm | null>(null);

  // Start alarm sound on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    // Small delay so browser allows audio after gesture (popup itself counts)
    const at = setTimeout(() => {
      alarmRef.current = playAlarm(soundId, volume);
    }, 300);
    return () => {
      clearTimeout(t);
      clearTimeout(at);
      alarmRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update live volume
  useEffect(() => {
    alarmRef.current?.setVolume(volume);
  }, [volume]);

  function stopAndDo(fn: () => void) {
    alarmRef.current?.stop();
    fn();
  }

  function changeSound(id: AlarmSoundId) {
    alarmRef.current?.stop();
    setSoundId(id);
    saveAlarmPrefs({ soundId: id, volume });
    // restart with new sound
    alarmRef.current = playAlarm(id, volume);
  }

  function changeVolume(v: number) {
    setVolume(v);
    saveAlarmPrefs({ soundId, volume: v });
    alarmRef.current?.setVolume(v);
  }

  const icon = TYPE_ICONS[routine.type];
  const hasDetail = routine.type === 'exercise' || routine.type === 'focus' || routine.type === 'lunch';

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center p-4 bg-black/40">
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300"
        style={{
          background: '#fff',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Colored top band */}
        <div className="px-5 pt-5 pb-4" style={{ background: routine.color || '#fdf6f0' }}>
          <div className="flex items-start gap-3">
            <span className="text-4xl animate-pulse-soft">{icon}</span>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">{routine.timeLabel}</p>
              <h3 className="text-xl font-bold" style={{ color: '#4a3f35' }}>{routine.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{routine.message}</p>
            </div>
            <button
              onClick={() => setShowSettings(s => !s)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.6)', color: '#4a3f35' }}
              title="Sound settings"
            >
              🔊
            </button>
          </div>
        </div>

        {/* Sound settings panel */}
        {showSettings && (
          <div className="px-5 py-4 border-b border-gray-100" style={{ background: '#fafafa' }}>
            {/* Volume slider */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg">🔈</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={e => changeVolume(parseFloat(e.target.value))}
                className="flex-1 accent-pink-400"
              />
              <span className="text-sm font-semibold w-8 text-right" style={{ color: '#4a3f35' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Sound picker */}
            <p className="text-xs text-gray-400 mb-2">Alarm sound</p>
            <div className="grid grid-cols-1 gap-1.5">
              {ALARM_SOUNDS.map(s => (
                <button
                  key={s.id}
                  onClick={() => changeSound(s.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                  style={{
                    background: soundId === s.id ? '#fce7f3' : '#f3f4f6',
                    border: soundId === s.id ? '1.5px solid #f9a8c9' : '1.5px solid transparent',
                  }}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#4a3f35' }}>{s.name}</p>
                    <p className="text-xs text-gray-400">{s.description}</p>
                  </div>
                  {/* Preview button */}
                  <button
                    onClick={e => { e.stopPropagation(); previewAlarm(s.id, volume); }}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: '#fff', color: '#9ca3af' }}
                  >
                    ▶
                  </button>
                  {soundId === s.id && (
                    <span className="text-pink-400 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 py-4 space-y-2">
          {/* Primary: Done */}
          <button
            onClick={() => stopAndDo(onDone)}
            className="w-full py-3.5 rounded-2xl font-bold text-base text-white shadow-sm active:scale-95"
            style={{ background: 'linear-gradient(135deg, #a8d5b5, #6dbf8a)' }}
          >
            ✓ Done
          </button>

          {/* Snooze options */}
          <div className="flex gap-2">
            <button
              onClick={() => stopAndDo(() => onSnooze(5))}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm active:scale-95"
              style={{ background: '#fef3e2', color: '#92400e' }}
            >
              💤 Snooze 5 min
            </button>
            <button
              onClick={() => stopAndDo(() => onSnooze(10))}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm active:scale-95"
              style={{ background: '#fef3e2', color: '#92400e' }}
            >
              💤 Snooze 10 min
            </button>
          </div>

          {/* Skip + Open detail */}
          <div className="flex gap-2">
            <button
              onClick={() => stopAndDo(onSkip)}
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium active:scale-95"
              style={{ background: '#f3f4f6', color: '#6b7280' }}
            >
              Skip
            </button>
            {hasDetail && (
              <button
                onClick={() => stopAndDo(onOpenDetail)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold active:scale-95"
                style={{ background: '#ede9fe', color: '#7c3aed' }}
              >
                {routine.type === 'exercise' ? '🏃 Workout' :
                 routine.type === 'focus' ? '🎯 Focus' : '🥗 Menu'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
