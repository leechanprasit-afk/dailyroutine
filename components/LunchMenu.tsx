'use client';

import { useState } from 'react';
import { LunchMenuItem } from '@/lib/data';
import { getLunchMenu, saveLunchMenu } from '@/lib/storage';

interface Props {
  onClose: () => void;
}

export default function LunchMenu({ onClose }: Props) {
  const [menu, setMenu] = useState<LunchMenuItem[]>(getLunchMenu);
  const [newName, setNewName] = useState('');
  const [newProtein, setNewProtein] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  function addItem() {
    if (!newName.trim()) return;
    const item: LunchMenuItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      protein: newProtein.trim() || 'protein-rich',
      emoji: '🍱',
    };
    const updated = [...menu, item];
    setMenu(updated);
    saveLunchMenu(updated);
    setNewName('');
    setNewProtein('');
    setShowAdd(false);
  }

  function removeItem(id: string) {
    const updated = menu.filter(m => m.id !== id);
    setMenu(updated);
    saveLunchMenu(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#4a3f35' }}>🥗 Lunch Menu</h2>
            <p className="text-xs text-gray-400">High-protein, easy to prepare</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-2 mb-4">
          {menu.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-2xl group"
              style={{ background: '#fef9c3' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#4a3f35' }}>{item.name}</p>
                  <p className="text-xs text-amber-600">{item.protein}</p>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-sm transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {showAdd ? (
          <div className="border-t pt-4 space-y-2">
            <input
              type="text"
              placeholder="Menu name (e.g. Chicken salad)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-300"
            />
            <input
              type="text"
              placeholder="Protein info (e.g. ~25g protein)"
              value={newProtein}
              onChange={e => setNewProtein(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-300"
            />
            <div className="flex gap-2">
              <button
                onClick={addItem}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#f59e0b' }}
              >
                Add Menu
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3 rounded-2xl text-sm font-semibold border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50"
          >
            + Add My Menu
          </button>
        )}
      </div>
    </div>
  );
}
