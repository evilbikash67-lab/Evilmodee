export default function ExportMenu({ onExport, onClose }) {
  return (
    <div className="absolute bottom-16 right-4 bg-gray-800 rounded-lg shadow-lg p-2 z-20">
      <button onClick={() => onExport('markdown')} className="block w-full text-left px-3 py-1 hover:bg-gray-700 rounded">
        Export as Markdown
      </button>
      <button onClick={() => onExport('json')} className="block w-full text-left px-3 py-1 hover:bg-gray-700 rounded">
        Export as JSON
      </button>
      <button onClick={onClose} className="block w-full text-left px-3 py-1 hover:bg-gray-700 rounded text-gray-400">
        Cancel
      </button>
    </div>
  );
}
