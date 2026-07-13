import { FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function ConversationItem({ conv, isActive, onSelect, onDelete, onRename }) {
  const handleRename = (e) => {
    e.stopPropagation();
    const newTitle = prompt('Rename chat', conv.title);
    if (newTitle) onRename(newTitle);
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-2 mx-1 rounded cursor-pointer group ${
        isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
      }`}
    >
      <span className="truncate text-sm flex-1">{conv.title}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={handleRename} className="text-gray-400 hover:text-white p-0.5">
          <FiEdit2 size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-400 hover:text-red-400 p-0.5">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}
