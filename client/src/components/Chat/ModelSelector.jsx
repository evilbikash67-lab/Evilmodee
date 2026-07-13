export default function ModelSelector({ selected, onChange, models }) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {models.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  );
}
