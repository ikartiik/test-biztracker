'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });
      if (result.error) {
        toast.error('Invalid username or password');
      } else {
        router.push('/dashboard');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Admin created — username: admin / password: admin123');
      } else {
        toast.error(data.error || data.message);
      }
    } catch {
      toast.error('Error creating admin');
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background circles */}
        <div className="absolute top-1/4 -left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="relative text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-white text-3xl font-black">B</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">BizTracker</h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xs">
            All your business operations,<br />in one clean dashboard.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Purchases',  value: 'Track' },
              { label: 'Shipping',   value: 'Monitor' },
              { label: 'Expenses',   value: 'Manage' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/60 rounded-xl px-4 py-4 border border-slate-700/50">
                <p className="text-white font-bold text-sm">{item.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        {/* Mobile-only brand */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white text-xl font-black">B</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">BizTracker</h1>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  style={{ width: '1.125rem', height: '1.125rem' }} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  style={{ width: '1.125rem', height: '1.125rem' }} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md text-sm mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={createAdmin}
              disabled={loading}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm py-2.5 px-4 rounded-lg transition-all font-medium"
            >
              Create admin account
            </button>
            <p className="text-xs text-slate-400 text-center mt-3">
              Default credentials: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
