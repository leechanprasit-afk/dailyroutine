'use client';

import { useState, useEffect, useCallback } from 'react';
import { FocusBlock, FOCUS_QUOTES } from '@/lib/data';

interface Props {
  blocks: FocusBlock[];
  onComplete: () => void;
  onClose: () => void;
}

export default function FocusMode({ blocks, onComplete, onClose }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<FocusBlock | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Rotate quote every 30 seconds during focus
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => {
      setQuoteIdx(i => (i + 1) % FOCUS_QUOTES.length);
    }, 30000);
    return () => clearInterval(t);
  }, [isRunning]);

  const startBlock = useCallback((block: FocusBlock) => {
    const secs = block.durationMinutes * 60;
    setSelectedBlock(block);
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setIsRunning(true);
    setFinished(false);
  }, []);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          setIsRunning(false);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, secondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  // Block selector screen
  if (!selectedBlock && !finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#4a3f35' }}>Focus Block</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Choose what you want to focus on today:</p>
          <div className="space-y-3 mb-4">
            {blocks.map((block, i) => (
              <button
                key={i}
                onClick={() => startBlock(block)}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-left hover:opacity-90 active:scale-95 transition-transform"
                style={{ background: block.color + '40', border: `2px solid ${block.color}` }}
              >
                <div>
                  <p className="font-semibold" style={{ color: '#4a3f35' }}>{block.label}</p>
                  <p className="text-xs text-gray-500">{block.durationMinutes} minutes</p>
                </div>
                <span className="text-2xl">🎯</span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#7c3aed' }}>
            Focus session complete!
          </h2>
          <p className="text-gray-500 mb-2">{selectedBlock?.label}</p>
          <p className="text-sm text-gray-400 mb-6">You stayed focused for {selectedBlock?.durationMinutes} minutes. Well done, Lee.</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSelectedBlock(null); setFinished(false); }}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: '#ede9fe', color: '#7c3aed' }}
            >
              Another Block
            </button>
            <button
              onClick={() => { onComplete(); onClose(); }}
              className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: '#7c3aed' }}
            >
              Done ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active focus screen
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: `linear-gradient(135deg, ${selectedBlock!.color}30, #fdf6f0)` }}
    >
      {/* Minimal header */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <div className="text-center max-w-xs">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Focus Session</p>
        <h2 className="text-2xl font-bold mb-8" style={{ color: '#4a3f35' }}>
          {selectedBlock!.label}
        </h2>

        {/* Big timer */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={selectedBlock!.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: '#4a3f35' }}>
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs text-gray-400 mt-1">remaining</span>
          </div>
        </div>

        {/* Motivational quote */}
        <p
          key={quoteIdx}
          className="text-lg italic text-gray-500 mb-10"
          style={{ transition: 'opacity 0.5s ease' }}
        >
          "{FOCUS_QUOTES[quoteIdx]}"
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setIsRunning(r => !r)}
            className="flex-1 py-4 rounded-2xl font-semibold text-lg shadow-sm"
            style={{
              background: isRunning ? '#fef9c3' : selectedBlock!.color,
              color: '#4a3f35',
            }}
          >
            {isRunning ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button
            onClick={() => { onComplete(); onClose(); }}
            className="px-5 py-4 rounded-2xl font-semibold text-sm bg-white shadow-sm"
            style={{ color: '#4a3f35' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
