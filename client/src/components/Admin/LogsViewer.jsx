export default function LogsViewer({ logs }) {
  return (
    <div className="mt-6 bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Usage Logs</h2>
      <div className="text-xs space-y-1">
        {logs.map(log => (
          <div key={log.id} className="flex gap-4 text-gray-400">
            <span>{new Date(log.timestamp?.toDate?.() || log.timestamp).toLocaleString()}</span>
            <span className="text-blue-400">{log.alias}</span>
            <span className="truncate">{log.ip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
