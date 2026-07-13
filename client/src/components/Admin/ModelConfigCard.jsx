import { useState } from 'react';
import { updateModelConfig } from '../../utils/api';

export default function ModelConfigCard({ alias, config, token, onUpdate }) {
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt || '');
  const [temperature, setTemperature] = useState(config.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(config.maxTokens ?? 512);
  const [topP, setTopP] = useState(config.topP ?? 0.9);
  const [enabled, setEnabled] = useState(config.enabled !== false);

  const handleSave = async () => {
    const newConfig = { systemPrompt, temperature, maxTokens, topP, enabled };
    await updateModelConfig(token, alias, newConfig);
    onUpdate(newConfig);
    alert('Saved!');
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h2 className="font-semibold mb-2">{alias}</h2>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          Enabled
        </label>
        <label className="text-sm">System Prompt</label>
        <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
          className="w-full bg-gray-800 p-2 rounded h-20 text-sm" />
        <label className="text-sm">Temperature: {temperature}</label>
        <input type="range" min="0" max="2" step="0.1" value={temperature}
          onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full" />
        <label className="text-sm">Max Tokens: {maxTokens}</label>
        <input type="number" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))}
          className="w-full bg-gray-800 p-1 rounded text-sm" />
        <label className="text-sm">Top P: {topP}</label>
        <input type="range" min="0" max="1" step="0.05" value={topP}
          onChange={e => setTopP(parseFloat(e.target.value))} className="w-full" />
        <button onClick={handleSave} className="w-full py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mt-2">
          Save
        </button>
      </div>
    </div>
  );
}
