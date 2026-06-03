'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const QUICK_PROMPTS = [
  { emoji: '🥗', label: 'High protein lunch idea' },
  { emoji: '🍳', label: 'Quick breakfast recipe' },
  { emoji: '💪', label: 'Post-workout meal' },
  { emoji: '😴', label: 'Foods for better sleep' },
  { emoji: '🎯', label: 'Tips to stay focused' },
  { emoji: '🥤', label: 'Healthy smoothie recipe' },
];

interface Props {
  onClose: () => void;
}

export default function AiChat({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi Lee! 🌸 I\'m here to help with meal ideas, recipes, and wellness tips. What can I help you with today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.reply || data.error || 'Sorry, something went wrong.'
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#fdf6f0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-pink-100">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#4a3f35' }}>Ask AI 🤖</h2>
          <p className="text-xs text-gray-400">Recipes, nutrition & wellness tips</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
          style={{ background: '#f3f4f6' }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? '#f9a8c9' : '#ffffff',
                color: '#4a3f35',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-pink-300"
                    style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => send(p.label)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm font-medium active:scale-95"
                style={{ background: '#ffffff', color: '#4a3f35', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
              >
                <span>{p.emoji}</span>
                <span className="text-xs">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 pt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask about recipes, nutrition..."
          className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: '#ffffff', border: '1.5px solid #fce7f3', color: '#4a3f35' }}
          disabled={loading}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold disabled:opacity-40 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #f9a8c9, #e879a0)' }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
