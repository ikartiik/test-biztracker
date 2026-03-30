'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Admin created — username: admin / password: admin123');
      } else {
        toast.error(data.error || data.message);
      }
    } catch (error) {
      toast.error('Error creating admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / brand */}
        <div className="flex flex-col items-center space-y-3 mb-8">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <SparklesIcon className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              BizTracker
            </h1>
            <p className="text-white/60 text-sm mt-1 tracking-wide">Track your business operations</p>
          </div>
        </div>

        <div className="glass-card">
          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-lg font-bold py-4 px-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="p-8 pt-0 space-y-4">
            <button
              onClick={createAdmin}
              disabled={loading}
              className="w-full border border-white/20 bg-white/5 hover:bg-white/10 text-white py-3 px-6 rounded-xl transition-all font-medium flex items-center justify-center gap-2"
            >
              Create Admin User (Development)
            </button>
            <div className="text-xs text-white/40 text-center">
              Default: admin / admin123
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/30 text-xs">
          © 2024 BizTracker. All rights reserved.
        </div>
      </div>
    </div>
  );
}
