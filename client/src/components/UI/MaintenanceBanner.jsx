export default function MaintenanceBanner({ message, type }) {
  const bg = type === 'warning' ? 'bg-yellow-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  return <div className={`px-4 py-1 text-sm text-center ${bg}`}>{message}</div>;
}
