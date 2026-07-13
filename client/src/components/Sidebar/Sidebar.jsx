import { useState } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import ConversationItem from './ConversationItem';

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onRename }) {
  const [search, setSearch] = useState('');
  const filtered = conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full flex-shrink-0">
      <div className="p-2 border-b border-gray-700">
        <button onClick={onNew} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-1 transition">
          <FiPlus /> New Chat
        </button>
      </div>
      <div className="p-2">
        <div className="flex items-center bg-gray-800 rounded px-2">
          <FiSearch className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-transparent p-2 text-sm focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(conv => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={conv.id === activeId}
            onSelect={() => onSelect(conv.id)}
            onDelete={() => onDelete(conv.id)}
            onRename={(title) => onRename(conv.id, title)}
          />
        ))}
      </div>
    </div>
  );
}
