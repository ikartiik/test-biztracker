'use client';

import { useState } from 'react';
<<<<<<< HEAD
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  UserCircleIcon, 
  LockClosedIcon, 
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  SparklesIcon
} from '@heroicons/react/24/outline';
=======
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
>>>>>>> blackboxai/login-mongodb-fix

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
<<<<<<< HEAD

=======
>>>>>>> blackboxai/login-mongodb-fix
    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });
<<<<<<< HEAD

      if (result.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success('Login successful');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed');
=======
      if (result.error) {
        toast.error('Invalid username or password');
      } else {
        router.push('/dashboard');
      }
    } catch {
      toast.error('Login failed. Please try again.');
>>>>>>> blackboxai/login-mongodb-fix
    } finally {
      setLoading(false);
    }
  };

  const seedAdmin = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
<<<<<<< HEAD
      
      if (response.ok) {
        toast.success('Default admin created! Username: admin, Password: admin123');
      } else {
        toast.error(data.error || data.message);
      }
    } catch (error) {
=======
      if (response.ok) {
        toast.success('Admin created — username: admin / password: admin123');
      } else {
        toast.error(data.error || data.message);
      }
    } catch {
>>>>>>> blackboxai/login-mongodb-fix
      toast.error('Error creating admin');
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="relative max-w-md w-full">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl mb-4">
            <BuildingOffice2Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Concentric</h1>
          <p className="text-blue-300 text-lg">Company Tracking System</p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-blue-200 text-sm mt-1">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100 ml-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircleIcon className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Enter your username"
=======
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <LockClosedIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Concentric Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
>>>>>>> blackboxai/login-mongodb-fix
                />
              </div>
            </div>

<<<<<<< HEAD
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Enter your password"
=======
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
>>>>>>> blackboxai/login-mongodb-fix
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
<<<<<<< HEAD
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={seedAdmin}
              className="w-full bg-white/5 hover:bg-white/10 text-blue-100 py-2.5 px-4 rounded-xl transition duration-200 text-sm border border-white/10 hover:border-white/20 flex items-center justify-center space-x-2"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Create Default Admin User</span>
            </button>
            <p className="text-xs text-blue-200/60 text-center mt-3">
              Click if you haven&apos;t created an admin account yet
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-200/40 text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p>© 2024 Concentric Company. All rights reserved.</p>
        </div>
=======
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={seedAdmin}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1.5 transition-colors"
            >
              First time? Create default admin account
            </button>
          </div>
        </div>
>>>>>>> blackboxai/login-mongodb-fix
      </div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> blackboxai/login-mongodb-fix
