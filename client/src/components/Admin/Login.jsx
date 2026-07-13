import { useState } from 'react';
import { adminLogin } from '../../utils/api';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await adminLogin(password);
      onLogin(token);
    } catch {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-xl shadow-2xl w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">EVIL MOD Admin</h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-3 bg-gray-800 rounded focus:outline-none"
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
