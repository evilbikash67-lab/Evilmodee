import { useState, useEffect } from 'react';
import ModelConfigCard from './ModelConfigCard';
import LogsViewer from './LogsViewer';
import { fetchLogs, clearLogs, toggleMaintenance } from '../../utils/api';

const MODELS = ["Evil Alpha","Evil Beta","Evil Gamma","Evil Delta","Evil Omega","Evil Titan","Evil Shadow","Evil Phantom","Evil Nova","Evil Inferno","Evil Prime","Evil Ultra"];

export default function AdminDashboard({ token, configs, setConfigs }) {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const loadLogs = async () => {
    const data = await fetchLogs(token);
    setLogs(data);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODELS.map(alias => (
          <ModelConfigCard
            key={alias}
            alias={alias}
            config={configs[alias] || {}}
            token={token}
            onUpdate={(newConfig) => setConfigs(prev => ({ ...prev, [alias]: newConfig }))}
          />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <button onClick={loadLogs} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
          View Logs
        </button>
        <button onClick={() => { toggleMaintenance(token, !configs._maintenance); setConfigs(prev => ({ ...prev, _maintenance: !prev._maintenance })); }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">
          Toggle Maintenance
        </button>
        <button onClick={async () => { await clearLogs(token); setLogs([]); }} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded">
          Clear Logs
        </button>
      </div>
      {logs.length > 0 && <LogsViewer logs={logs} />}
    </div>
  );
}
