import React, { useState } from 'react';
import { User } from '../types';
import { BrainCircuit, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate JWT Auth
    onLogin({
      username,
      role: 'student',
      token: 'mock-jwt-token-xyz'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3">
            <BrainCircuit className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">SmartPrep AI</h1>
          <p className="text-slate-500">Your intelligent interview roadmap</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Demo Credentials: student / password</p>
        </div>
      </div>
    </div>
  );
};