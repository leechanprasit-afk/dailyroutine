'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '@/lib/data';

interface Props {
  exercises: Exercise[];
  onComplete: () => void;
  onClose: () => void;
}

// ─── Audio beeps via Web Audio API ───────────────────────────────────────────
function useBeep() {
  const ctx = useRef<AudioContext | null>(null);

  function getCtx() {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctx.current;
  }

  function beep(freq: number, duration: number, vol = 0.3) {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch { /* silent fail */ }
  }

  return {
    countdown: () => beep(440, 0.12),
    start: () => { beep(660, 0.08); setTimeout(() => beep(880, 0.2), 100); },
    rest: () => beep(330, 0.3, 0.2),
    complete: () => {
      beep(523, 0.15); setTimeout(() => beep(659, 0.15), 160);
      setTimeout(() => beep(784, 0.15), 320); setTimeout(() => beep(1047, 0.4), 480);
    },
  };
}

// ─── SVG Fitness Avatars ──────────────────────────────────────────────────────
// Proportional 3D-style avatar with skin, pink top, dark leggings

function Avatar({ name, size = 220 }: { name: string; size?: number }) {
  const n = name.toLowerCase();

  if (n.includes('squat')) return <SquatAvatar size={size} />;
  if (n.includes('push') || n.includes('wall')) return <WallPushupAvatar size={size} />;
  if (n.includes('march')) return <MarchAvatar size={size} />;
  if (n.includes('leg') || n.includes('lift')) return <SideLegAvatar size={size} />;
  return <ShoulderAvatar size={size} />;
}

const SKIN = '#f4c5a0';
const SKIN_D = '#e8a87c';
const TOP = '#e879a0';
const TOP_D = '#c0246e';
const LEG = '#2d2d3a';
const LEG_D = '#1a1a24';
const SHOE = '#f0f0f0';
const HAIR = '#2d1a0a';

function SquatAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 220">
      <style>{`
        @keyframes sq-body { 0%,100%{transform:translateY(0)} 50%{transform:translateY(28px)} }
        @keyframes sq-la { 0%,100%{transform:rotate(-10deg);transform-origin:72px 82px} 50%{transform:rotate(-45deg);transform-origin:72px 82px} }
        @keyframes sq-ra { 0%,100%{transform:rotate(10deg);transform-origin:128px 82px} 50%{transform:rotate(45deg);transform-origin:128px 82px} }
        @keyframes sq-ll { 0%,100%{transform:rotate(0deg);transform-origin:88px 132px} 50%{transform:rotate(30deg);transform-origin:88px 132px} }
        @keyframes sq-rl { 0%,100%{transform:rotate(0deg);transform-origin:112px 132px} 50%{transform:rotate(-30deg);transform-origin:112px 132px} }
        .sq-b{animation:sq-body 1.8s ease-in-out infinite}
        .sq-la{animation:sq-la 1.8s ease-in-out infinite}
        .sq-ra{animation:sq-ra 1.8s ease-in-out infinite}
        .sq-ll{animation:sq-ll 1.8s ease-in-out infinite}
        .sq-rl{animation:sq-rl 1.8s ease-in-out infinite}
      `}</style>
      {/* Shadow */}
      <ellipse cx="100" cy="212" rx="38" ry="6" fill="#e8ddd4" opacity="0.6"/>
      <g className="sq-b">
        {/* Hair bun */}
        <ellipse cx="100" cy="24" rx="18" ry="16" fill={HAIR}/>
        <circle cx="100" cy="16" r="7" fill={HAIR}/>
        {/* Head */}
        <ellipse cx="100" cy="38" rx="18" ry="20" fill={SKIN}/>
        {/* Ear */}
        <ellipse cx="82" cy="38" rx="4" ry="5" fill={SKIN_D}/>
        <ellipse cx="118" cy="38" rx="4" ry="5" fill={SKIN_D}/>
        {/* Face */}
        <circle cx="93" cy="36" r="2.5" fill="#3d2b1a" opacity="0.7"/>
        <circle cx="107" cy="36" r="2.5" fill="#3d2b1a" opacity="0.7"/>
        <path d="M94 45 Q100 50 106 45" stroke="#c0246e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Neck */}
        <rect x="94" y="57" width="12" height="12" rx="4" fill={SKIN}/>
        {/* Torso - sports bra/top */}
        <path d="M72 68 Q100 62 128 68 L130 108 Q100 115 70 108 Z" fill={TOP}/>
        <path d="M72 68 Q100 62 128 68 L126 78 Q100 72 74 78 Z" fill={TOP_D}/>
        {/* Waistband */}
        <rect x="70" y="106" width="60" height="8" rx="4" fill={LEG_D}/>
        {/* Left arm */}
        <g className="sq-la">
          <rect x="60" y="76" width="14" height="42" rx="7" fill={SKIN}/>
          <rect x="62" y="114" width="10" height="14" rx="5" fill={SKIN_D}/>
        </g>
        {/* Right arm */}
        <g className="sq-ra">
          <rect x="126" y="76" width="14" height="42" rx="7" fill={SKIN}/>
          <rect x="128" y="114" width="10" height="14" rx="5" fill={SKIN_D}/>
        </g>
        {/* Left leg */}
        <g className="sq-ll">
          <rect x="78" y="114" width="22" height="52" rx="11" fill={LEG}/>
          <rect x="78" y="114" width="22" height="18" rx="9" fill={LEG_D}/>
          {/* Knee cap */}
          <ellipse cx="89" cy="152" rx="11" ry="8" fill={LEG}/>
          {/* Calf */}
          <rect x="80" y="152" width="18" height="34" rx="9" fill={LEG}/>
          {/* Shoe */}
          <ellipse cx="89" cy="186" rx="14" ry="8" fill={SHOE}/>
          <ellipse cx="95" cy="185" rx="8" ry="5" fill="#ddd"/>
        </g>
        {/* Right leg */}
        <g className="sq-rl">
          <rect x="100" y="114" width="22" height="52" rx="11" fill={LEG}/>
          <rect x="100" y="114" width="22" height="18" rx="9" fill={LEG_D}/>
          <ellipse cx="111" cy="152" rx="11" ry="8" fill={LEG}/>
          <rect x="102" y="152" width="18" height="34" rx="9" fill={LEG}/>
          <ellipse cx="111" cy="186" rx="14" ry="8" fill={SHOE}/>
          <ellipse cx="117" cy="185" rx="8" ry="5" fill="#ddd"/>
        </g>
      </g>
    </svg>
  );
}

function WallPushupAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220">
      <style>{`
        @keyframes wp-body { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-16px)} }
        .wp-b{animation:wp-body 1.8s ease-in-out infinite}
      `}</style>
      {/* Wall */}
      <rect x="175" y="20" width="20" height="190" rx="6" fill="#f0ebe4"/>
      <rect x="175" y="20" width="6" height="190" rx="3" fill="#e0d8ce"/>
      {/* Shadow */}
      <ellipse cx="90" cy="212" rx="40" ry="6" fill="#e8ddd4" opacity="0.6"/>
      <g className="wp-b">
        {/* Hair */}
        <ellipse cx="38" cy="42" rx="18" ry="15" fill={HAIR}/>
        <circle cx="38" cy="34" r="6" fill={HAIR}/>
        {/* Head - facing right */}
        <ellipse cx="40" cy="54" rx="18" ry="19" fill={SKIN}/>
        <ellipse cx="56" cy="54" rx="4" ry="5" fill={SKIN_D}/>
        <circle cx="46" cy="51" r="2.5" fill="#3d2b1a" opacity="0.7"/>
        <path d="M44 62 Q50 67 56 62" stroke="#c0246e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Neck */}
        <rect x="48" y="72" width="12" height="10" rx="4" fill={SKIN}/>
        {/* Torso - angled */}
        <path d="M38 82 L90 68 L96 100 L44 118 Z" fill={TOP}/>
        <path d="M38 82 L90 68 L88 78 L36 92 Z" fill={TOP_D}/>
        {/* Waistband */}
        <path d="M44 116 L96 100 L98 108 L46 124 Z" fill={LEG_D}/>
        {/* Arms reaching wall */}
        <path d="M84 72 L174 72" stroke={SKIN} strokeWidth="13" strokeLinecap="round"/>
        <path d="M84 72 L174 72" stroke={SKIN_D} strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
        {/* Hands on wall */}
        <ellipse cx="174" cy="72" rx="8" ry="10" fill={SKIN}/>
        {/* Legs */}
        <path d="M44 118 L28 185" stroke={LEG} strokeWidth="20" strokeLinecap="round"/>
        <path d="M60 112 L70 180" stroke={LEG} strokeWidth="20" strokeLinecap="round"/>
        {/* Shoes */}
        <ellipse cx="24" cy="188" rx="14" ry="7" fill={SHOE}/>
        <ellipse cx="68" cy="183" rx="13" ry="7" fill={SHOE}/>
      </g>
    </svg>
  );
}

function MarchAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 230">
      <style>{`
        @keyframes m-lleg { 0%,100%{transform:rotate(0deg);transform-origin:88px 128px} 25%{transform:rotate(-38deg);transform-origin:88px 128px} 75%{transform:rotate(12deg);transform-origin:88px 128px} }
        @keyframes m-rleg { 0%,100%{transform:rotate(0deg);transform-origin:112px 128px} 25%{transform:rotate(12deg);transform-origin:112px 128px} 75%{transform:rotate(-38deg);transform-origin:112px 128px} }
        @keyframes m-larm { 0%,100%{transform:rotate(0deg);transform-origin:78px 82px} 25%{transform:rotate(30deg);transform-origin:78px 82px} 75%{transform:rotate(-22deg);transform-origin:78px 82px} }
        @keyframes m-rarm { 0%,100%{transform:rotate(0deg);transform-origin:122px 82px} 25%{transform:rotate(-22deg);transform-origin:122px 82px} 75%{transform:rotate(30deg);transform-origin:122px 82px} }
        @keyframes m-body { 0%,50%,100%{transform:translateY(0)} 25%,75%{transform:translateY(-3px)} }
        .m-ll{animation:m-lleg 0.9s ease-in-out infinite}
        .m-rl{animation:m-rleg 0.9s ease-in-out infinite}
        .m-la{animation:m-larm 0.9s ease-in-out infinite}
        .m-ra{animation:m-rarm 0.9s ease-in-out infinite}
        .m-b{animation:m-body 0.9s ease-in-out infinite}
      `}</style>
      <ellipse cx="100" cy="218" rx="34" ry="6" fill="#e8ddd4" opacity="0.6"/>
      <g className="m-b">
        {/* Hair bun */}
        <ellipse cx="100" cy="22" rx="18" ry="14" fill={HAIR}/>
        <circle cx="100" cy="15" r="6" fill={HAIR}/>
        {/* Head */}
        <ellipse cx="100" cy="36" rx="18" ry="20" fill={SKIN}/>
        <ellipse cx="82" cy="36" rx="4" ry="5" fill={SKIN_D}/>
        <ellipse cx="118" cy="36" rx="4" ry="5" fill={SKIN_D}/>
        <circle cx="93" cy="34" r="2.5" fill="#3d2b1a" opacity="0.7"/>
        <circle cx="107" cy="34" r="2.5" fill="#3d2b1a" opacity="0.7"/>
        <path d="M94 44 Q100 49 106 44" stroke="#c0246e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Neck */}
        <rect x="94" y="54" width="12" height="10" rx="4" fill={SKIN}/>
        {/* Torso */}
        <path d="M74 64 Q100 58 126 64 L128 104 Q100 110 72 104 Z" fill={TOP}/>
        <path d="M74 64 Q100 58 126 64 L124 74 Q100 68 76 74 Z" fill={TOP_D}/>
        <rect x="72" y="102" width="56" height="8" rx="4" fill={LEG_D}/>
        {/* Left arm */}
        <g className="m-la">
          <rect x="60" y="72" width="14" height="40" rx="7" fill={SKIN}/>
          <rect x="61" y="108" width="12" height="14" rx="6" fill={SKIN_D}/>
        </g>
        {/* Right arm */}
        <g className="m-ra">
          <rect x="126" y="72" width="14" height="40" rx="7" fill={SKIN}/>
          <rect x="127" y="108" width="12" height="14" rx="6" fill={SKIN_D}/>
        </g>
        {/* Left leg */}
        <g className="m-ll">
          <rect x="78" y="110" width="22" height="52" rx="11" fill={LEG}/>
          <rect x="80" y="152" width="18" height="36" rx="9" fill={LEG}/>
          <ellipse cx="89" cy="188" rx="14" ry="7" fill={SHOE}/>
          <ellipse cx="95" cy="187" rx="7" ry="4" fill="#ddd"/>
        </g>
        {/* Right leg */}
        <g className="m-rl">
          <rect x="100" y="110" width="22" height="52" rx="11" fill={LEG}/>
          <rect x="102" y="152" width="18" height="36" rx="9" fill={LEG}/>
          <ellipse cx="111" cy="188" rx="14" ry="7" fill={SHOE}/>
          <ellipse cx="117" cy="187" rx="7" ry="4" fill="#ddd"/>
        </g>
      </g>
    </svg>
  );
}

function SideLegAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 230">
      <style>{`
        @keyframes sl-leg { 0%,100%{transform:rotate(0deg);transform-origin:116px 128px} 50%{transform:rotate(-42deg);transform-origin:116px 128px} }
        @keyframes sl-arm { 0%,100%{transform:rotate(0deg);transform-origin:78px 82px} 50%{transform:rotate(8deg);transform-origin:78px 82px} }
        .sl-l{animation:sl-leg 1.8s ease-in-out infinite}
        .sl-a{animation:sl-arm 1.8s ease-in-out infinite}
      `}</style>
      <ellipse cx="100" cy="218" rx="34" ry="6" fill="#e8ddd4" opacity="0.6"/>
      {/* Hair */}
      <ellipse cx="100" cy="22" rx="18" ry="14" fill={HAIR}/>
      <circle cx="100" cy="15" r="6" fill={HAIR}/>
      {/* Head */}
      <ellipse cx="100" cy="36" rx="18" ry="20" fill={SKIN}/>
      <ellipse cx="82" cy="36" rx="4" ry="5" fill={SKIN_D}/>
      <ellipse cx="118" cy="36" rx="4" ry="5" fill={SKIN_D}/>
      <circle cx="93" cy="34" r="2.5" fill="#3d2b1a" opacity="0.7"/>
      <circle cx="107" cy="34" r="2.5" fill="#3d2b1a" opacity="0.7"/>
      <path d="M94 44 Q100 49 106 44" stroke="#c0246e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Neck */}
      <rect x="94" y="54" width="12" height="10" rx="4" fill={SKIN}/>
      {/* Torso */}
      <path d="M74 64 Q100 58 126 64 L128 104 Q100 110 72 104 Z" fill={TOP}/>
      <path d="M74 64 Q100 58 126 64 L124 74 Q100 68 76 74 Z" fill={TOP_D}/>
      <rect x="72" y="102" width="56" height="8" rx="4" fill={LEG_D}/>
      {/* Left arm - balance/wall */}
      <g className="sl-a">
        <rect x="56" y="70" width="14" height="46" rx="7" fill={SKIN}/>
        <rect x="57" y="112" width="12" height="14" rx="6" fill={SKIN_D}/>
      </g>
      {/* Right arm - out for balance */}
      <rect x="126" y="74" width="14" height="38" rx="7" fill={SKIN} transform="rotate(-20 133 93)"/>
      {/* Standing left leg */}
      <rect x="80" y="110" width="22" height="52" rx="11" fill={LEG}/>
      <rect x="82" y="152" width="18" height="36" rx="9" fill={LEG}/>
      <ellipse cx="91" cy="188" rx="14" ry="7" fill={SHOE}/>
      <ellipse cx="97" cy="187" rx="7" ry="4" fill="#ddd"/>
      {/* Lifting right leg */}
      <g className="sl-l">
        <rect x="104" y="110" width="22" height="52" rx="11" fill={LEG}/>
        <rect x="106" y="152" width="18" height="36" rx="9" fill={LEG}/>
        <ellipse cx="115" cy="188" rx="14" ry="7" fill={SHOE}/>
        <ellipse cx="121" cy="187" rx="7" ry="4" fill="#ddd"/>
      </g>
    </svg>
  );
}

function ShoulderAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 230">
      <style>{`
        @keyframes sh-roll { 0%{transform:rotate(0deg) translateY(0);transform-origin:100px 85px} 25%{transform:rotate(-6deg) translateY(-3px);transform-origin:100px 85px} 50%{transform:rotate(0deg) translateY(-5px);transform-origin:100px 85px} 75%{transform:rotate(6deg) translateY(-3px);transform-origin:100px 85px} 100%{transform:rotate(0deg) translateY(0);transform-origin:100px 85px} }
        @keyframes sh-larm { 0%,100%{transform:rotate(0deg);transform-origin:75px 80px} 50%{transform:rotate(-25deg);transform-origin:75px 80px} }
        @keyframes sh-rarm { 0%,100%{transform:rotate(0deg);transform-origin:125px 80px} 50%{transform:rotate(25deg);transform-origin:125px 80px} }
        @keyframes sh-breathe { 0%,100%{transform:scaleY(1);transform-origin:100px 85px} 50%{transform:scaleY(1.08);transform-origin:100px 85px} }
        @keyframes sh-ring { 0%{r:28;opacity:0.5} 100%{r:52;opacity:0} }
        .sh-s{animation:sh-roll 3s ease-in-out infinite}
        .sh-la{animation:sh-larm 3s ease-in-out infinite}
        .sh-ra{animation:sh-rarm 3s ease-in-out infinite}
        .sh-c{animation:sh-breathe 3s ease-in-out infinite}
        .sh-ring{animation:sh-ring 3s ease-out infinite}
      `}</style>
      {/* Breath ring */}
      <circle className="sh-ring" cx="100" cy="36" r="28" fill="none" stroke="#a8c8e8" strokeWidth="2.5"/>
      <ellipse cx="100" cy="218" rx="34" ry="6" fill="#e8ddd4" opacity="0.6"/>
      {/* Hair */}
      <ellipse cx="100" cy="20" rx="18" ry="14" fill={HAIR}/>
      <circle cx="100" cy="14" r="6" fill={HAIR}/>
      {/* Head */}
      <ellipse cx="100" cy="36" rx="18" ry="19" fill={SKIN}/>
      <ellipse cx="82" cy="36" rx="4" ry="5" fill={SKIN_D}/>
      <ellipse cx="118" cy="36" rx="4" ry="5" fill={SKIN_D}/>
      <circle cx="93" cy="33" r="2.5" fill="#3d2b1a" opacity="0.7"/>
      <circle cx="107" cy="33" r="2.5" fill="#3d2b1a" opacity="0.7"/>
      {/* Peaceful eyes - closed */}
      <path d="M90 33 Q93 36 96 33" stroke="#3d2b1a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M104 33 Q107 36 110 33" stroke="#3d2b1a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M94 43 Q100 48 106 43" stroke="#c0246e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Neck */}
      <rect x="94" y="54" width="12" height="10" rx="4" fill={SKIN}/>
      <g className="sh-s">
        {/* Torso */}
        <g className="sh-c">
          <path d="M72 64 Q100 58 128 64 L130 106 Q100 112 70 106 Z" fill={TOP}/>
          <path d="M72 64 Q100 58 128 64 L126 74 Q100 68 74 74 Z" fill={TOP_D}/>
          <rect x="70" y="104" width="60" height="8" rx="4" fill={LEG_D}/>
        </g>
        {/* Left arm */}
        <g className="sh-la">
          <rect x="54" y="70" width="16" height="50" rx="8" fill={SKIN}/>
          <rect x="55" y="116" width="14" height="16" rx="7" fill={SKIN_D}/>
        </g>
        {/* Right arm */}
        <g className="sh-ra">
          <rect x="130" y="70" width="16" height="50" rx="8" fill={SKIN}/>
          <rect x="131" y="116" width="14" height="16" rx="7" fill={SKIN_D}/>
        </g>
      </g>
      {/* Legs - still */}
      <rect x="78" y="112" width="22" height="56" rx="11" fill={LEG}/>
      <rect x="100" y="112" width="22" height="56" rx="11" fill={LEG}/>
      <rect x="80" y="156" width="18" height="34" rx="9" fill={LEG}/>
      <rect x="102" y="156" width="18" height="34" rx="9" fill={LEG}/>
      <ellipse cx="89" cy="190" rx="14" ry="7" fill={SHOE}/>
      <ellipse cx="111" cy="190" rx="14" ry="7" fill={SHOE}/>
      <ellipse cx="95" cy="189" rx="7" ry="4" fill="#ddd"/>
      <ellipse cx="117" cy="189" rx="7" ry="4" fill="#ddd"/>
    </svg>
  );
}

// ─── Mini avatar for "Up Next" cards ─────────────────────────────────────────
function MiniAvatar({ name }: { name: string }) {
  return (
    <div style={{ width: 56, height: 56, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: 'scale(0.28)', transformOrigin: 'top center', width: 200, height: 220 }}>
        <Avatar name={name} size={200} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Phase = 'intro' | 'getready' | 'exercise' | 'rest' | 'done';

export default function WorkoutTimer({ exercises, onComplete, onClose }: Props) {
  const beep = useBeep();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prevBeepRef = useRef(-1);

  const ex = exercises[currentIdx];
  const EX_DUR = ex?.durationSeconds ?? 60;
  const GET_READY_DUR = 3;
  const REST_DUR = 4;

  const totalSecs = exercises.reduce((s, e) => s + e.durationSeconds, 0) +
    (exercises.length * GET_READY_DUR) + ((exercises.length - 1) * REST_DUR);
  const elapsedSecs = exercises.slice(0, currentIdx).reduce((s, e) => s + e.durationSeconds + GET_READY_DUR + REST_DUR, 0) +
    (phase === 'exercise' ? GET_READY_DUR + (EX_DUR - secondsLeft) :
     phase === 'rest' ? GET_READY_DUR + EX_DUR + (REST_DUR - secondsLeft) : 0);
  const overallPct = Math.min(100, Math.round((elapsedSecs / totalSecs) * 100));

  const totalMinSec = `${String(Math.floor(totalSecs / 60)).padStart(2, '0')}:${String(totalSecs % 60).padStart(2, '0')}`;
  const elapsedMinSec = `${String(Math.floor(elapsedSecs / 60)).padStart(2, '0')}:${String(elapsedSecs % 60).padStart(2, '0')}`;

  const startExercise = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setPhase('getready');
    setSecondsLeft(GET_READY_DUR);
    setIsPaused(false);
    prevBeepRef.current = -1;
  }, []);

  // Beep on countdown seconds
  useEffect(() => {
    if (isPaused) return;
    if (phase === 'getready' && secondsLeft <= 3 && secondsLeft !== prevBeepRef.current) {
      prevBeepRef.current = secondsLeft;
      if (secondsLeft > 0) beep.countdown();
      else beep.start();
    }
    if (phase === 'rest' && secondsLeft === REST_DUR) beep.rest();
    if (phase === 'exercise' && secondsLeft <= 3 && secondsLeft > 0 && secondsLeft !== prevBeepRef.current) {
      prevBeepRef.current = secondsLeft;
      beep.countdown();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase, isPaused]);

  // Tick
  useEffect(() => {
    if (isPaused || phase === 'intro' || phase === 'done' || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isPaused, phase, secondsLeft]);

  // Phase transitions
  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (phase === 'getready') {
      setPhase('exercise');
      setSecondsLeft(EX_DUR);
      prevBeepRef.current = -1;
    } else if (phase === 'exercise') {
      const next = currentIdx + 1;
      if (next < exercises.length) {
        setPhase('rest');
        setSecondsLeft(REST_DUR);
        setCurrentIdx(next);
      } else {
        setPhase('done');
        beep.complete();
      }
    } else if (phase === 'rest') {
      setPhase('getready');
      setSecondsLeft(GET_READY_DUR);
      prevBeepRef.current = -1;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Circle timer
  const R = 58;
  const CIRC = 2 * Math.PI * R;
  const phaseDur = phase === 'exercise' ? EX_DUR : phase === 'getready' ? GET_READY_DUR : REST_DUR;
  const circleFill = phase === 'exercise' ? secondsLeft / EX_DUR :
                     phase === 'getready' ? secondsLeft / GET_READY_DUR :
                     secondsLeft / REST_DUR;
  const timerColor = phase === 'exercise'
    ? (secondsLeft <= 10 ? '#f9a8c9' : '#7c3aed')
    : phase === 'getready' ? '#7c3aed' : '#a8d5b5';

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const upNext = exercises.slice(currentIdx + 1);

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#faf8ff' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-3" style={{ borderBottom: '1px solid #f0eaf8' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2d1a6e' }}>5-Minute Workout 🏃‍♀️</h2>
            <p className="text-xs" style={{ color: '#9ca3af' }}>5 exercises · 1 minute each</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
            style={{ background: '#fce7f3', color: '#9d174d' }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Total time card */}
        <div className="mx-5 mt-4 p-4 rounded-2xl flex items-center justify-between" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(124,58,237,0.08)' }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Total Time</p>
            <p className="text-3xl font-bold mt-0.5" style={{ color: '#2d1a6e', fontVariantNumeric: 'tabular-nums' }}>05:00</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>of 05:00</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#ede9fe" strokeWidth="6"/>
              <circle cx="32" cy="32" r="26" fill="none" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*26}`} strokeDashoffset={`${2*Math.PI*26*0}`}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>0%</span>
            </div>
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-3 pb-4">
          {exercises.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold" style={{ background: '#7c3aed' }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: '#2d1a6e' }}>{e.name}</p>
                <p className="text-xs leading-tight mt-0.5" style={{ color: '#9ca3af' }}>{e.description}</p>
              </div>
              <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ background: '#faf8ff', width: 56, height: 56 }}>
                <MiniAvatar name={e.name} />
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: '#c4b5fd' }}>01:00</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <div className="px-5 pb-8 pt-3">
          <button
            onClick={() => startExercise(0)}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            ▶ Start 5-Minute Workout
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center"
        style={{ background: 'linear-gradient(160deg, #ede9fe 0%, #fdf6f0 60%)' }}>
        <div className="text-7xl mb-4">🌸</div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#7c3aed' }}>Workout Complete!</h2>
        <p className="text-lg mb-1" style={{ color: '#4a3f35' }}>Amazing work, Lee!</p>
        <p className="text-sm mb-2" style={{ color: '#9ca3af' }}>You completed all 5 exercises in 5 minutes.</p>
        <div className="flex gap-6 mb-8 mt-2">
          {exercises.map((e, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white text-sm">✓</div>
              <span className="text-xs" style={{ color: '#9ca3af' }}>{e.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { onComplete(); onClose(); }}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-bold text-lg shadow-md mb-3"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
          ✓ Mark Done
        </button>
        <button onClick={onClose} className="text-sm" style={{ color: '#9ca3af' }}>Close</button>
      </div>
    );
  }

  // ── GET READY / REST ───────────────────────────────────────────────────────
  if (phase === 'getready' || phase === 'rest') {
    const isRest = phase === 'rest';
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: isRest ? '#f0fdf4' : '#faf8ff' }}>
        <p className="text-xs uppercase tracking-widest font-bold mb-2"
          style={{ color: isRest ? '#16a34a' : '#7c3aed' }}>
          {isRest ? `✅ Exercise ${currentIdx} done!` : `Exercise ${currentIdx + 1} of ${exercises.length}`}
        </p>
        <h2 className="text-4xl font-black mb-1" style={{ color: '#2d1a6e' }}>
          {isRest ? 'Rest' : 'Get Ready'}
        </h2>
        <p className="text-xl mb-6" style={{ color: '#6b7280' }}>
          {isRest ? `Next: ${ex?.name}` : ex?.name}
        </p>
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="60" fill="none" stroke={isRest ? '#dcfce7' : '#ede9fe'} strokeWidth="10"/>
            <circle cx="72" cy="72" r="60" fill="none"
              stroke={isRest ? '#4ade80' : '#7c3aed'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*60}`}
              strokeDashoffset={`${2*Math.PI*60*(1 - secondsLeft/phaseDur)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black" style={{ color: isRest ? '#16a34a' : '#7c3aed' }}>{secondsLeft}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE EXERCISE ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#fff' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex gap-1 items-center">
          {exercises.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === currentIdx ? 24 : 8, background: i < currentIdx ? '#7c3aed' : i === currentIdx ? '#a855f7' : '#e5e7eb' }}/>
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
          {currentIdx + 1} of {exercises.length}
        </span>
        <button onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: '#fce7f3', color: '#9d174d' }}>
          ✕ Exit
        </button>
      </div>

      {/* Total time + overall progress */}
      <div className="mx-4 mb-1 p-3 rounded-2xl flex items-center justify-between"
        style={{ background: '#faf8ff', border: '1px solid #ede9fe' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Total Time</p>
          <p className="text-xl font-black" style={{ color: '#2d1a6e', fontVariantNumeric: 'tabular-nums' }}>
            {elapsedMinSec}
          </p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>of {totalMinSec}</p>
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="#ede9fe" strokeWidth="5"/>
            <circle cx="28" cy="28" r="22" fill="none" stroke="#7c3aed" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2*Math.PI*22}`}
              strokeDashoffset={`${2*Math.PI*22*(1-overallPct/100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* Current exercise label */}
      <div className="px-4 mb-0">
        <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Current Exercise</p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black" style={{ color: '#2d1a6e' }}>{ex?.name}</h3>
          {/* Big timer */}
          <span className="text-3xl font-black" style={{ color: timerColor, fontVariantNumeric: 'tabular-nums', minWidth: 80, textAlign: 'right' }}>
            {fmtTime(secondsLeft)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full mt-1" style={{ background: '#ede9fe' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(1 - secondsLeft / EX_DUR) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}/>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex-1 flex items-center justify-center py-1">
        <Avatar name={ex?.name || ''} size={210} />
      </div>

      {/* Countdown ring */}
      <div className="flex justify-center mb-2">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${R*2+16} ${R*2+16}`}>
            <circle cx={R+8} cy={R+8} r={R} fill="none" stroke="#f3f4f6" strokeWidth="8"/>
            <circle cx={R+8} cy={R+8} r={R} fill="none"
              stroke={timerColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - circleFill)}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color: '#2d1a6e', fontVariantNumeric: 'tabular-nums' }}>
              {secondsLeft}
            </span>
            <span className="text-xs" style={{ color: '#9ca3af' }}>sec</span>
          </div>
        </div>
      </div>

      {/* Pause / Next buttons */}
      <div className="flex gap-3 px-4 mb-3">
        <button
          onClick={() => { if (currentIdx > 0) startExercise(currentIdx - 1); }}
          disabled={currentIdx === 0}
          className="px-4 py-3 rounded-2xl font-semibold text-sm disabled:opacity-30"
          style={{ background: '#f3f4f6', color: '#6b7280' }}
        >
          ⏮ Prev
        </button>
        <button
          onClick={() => setIsPaused(p => !p)}
          className="flex-1 py-3 rounded-2xl font-bold text-base text-white shadow-md"
          style={{ background: isPaused ? '#7c3aed' : '#7c3aed' }}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={() => {
            const next = currentIdx + 1;
            if (next < exercises.length) { setPhase('rest'); setCurrentIdx(next); setSecondsLeft(REST_DUR); }
            else { setPhase('done'); beep.complete(); }
          }}
          className="px-5 py-3 rounded-2xl font-semibold text-sm"
          style={{ background: '#ede9fe', color: '#7c3aed' }}
        >
          Next ⏭
        </button>
      </div>

      {/* Up Next */}
      {upNext.length > 0 && (
        <div className="px-4 pb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>Up Next</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upNext.map((e, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center p-2 rounded-xl"
                style={{ background: '#faf8ff', border: '1px solid #ede9fe', width: 80 }}>
                <div className="w-10 h-10 rounded-lg overflow-hidden mb-1" style={{ background: '#fff' }}>
                  <MiniAvatar name={e.name} />
                </div>
                <p className="text-center leading-tight" style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600 }}>
                  {e.name.replace(' + ', '\n+')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
