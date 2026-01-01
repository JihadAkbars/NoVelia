
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: (passkey: string) => boolean;
  isAdmin: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, isAdmin }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAdmin) return <Navigate to="/admin/dashboard" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(passkey)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid passkey. Access denied.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800">
        <h1 className="text-3xl font-black mb-2 text-center">Owner Portal</h1>
        <p className="text-zinc-500 text-center mb-8">Enter the secret passkey to manage NoVelia</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="000000"
              className="w-full text-center text-4xl tracking-[1em] py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};
