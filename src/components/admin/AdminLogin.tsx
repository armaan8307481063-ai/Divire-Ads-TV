import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AdminProfile } from '../../types.js';

interface AdminLoginProps {
  onLoginSuccess: (token: string, admin: AdminProfile) => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToWebsite }) => {
  const [email, setEmail] = useState('divireadstv@gmail.com');
  const [password, setPassword] = useState('divire2025');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password flow
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('divireadstv@gmail.com');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid administrator credentials.');
      }

      localStorage.setItem('divire_admin_token', json.token);
      onLoginSuccess(json.token, json.admin);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to request reset code.');
      }

      setGeneratedCodeHint(json.code || null);
      setResetMessage(json.message || 'Verification code sent!');
      setView('reset');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: resetCode.trim(), newPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to reset password.');
      }

      setResetMessage('Password reset successfully! You can now log in.');
      setPassword(newPassword);
      setView('login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C4813] via-[#15380e] to-[#0d2208] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-[#D9A51B]/30 selection:text-white">
      {/* Decorative ambient background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#28651B]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D9A51B]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Back to Website */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Divire Ads TV"
            className="w-9 h-9 object-contain rounded-xl bg-white shadow-md p-0.5"
          />
          <div>
            <span className="font-bold tracking-tight text-white text-base">Divire Ads TV</span>
            <span className="text-[10px] text-[#D9A51B] block font-semibold uppercase tracking-widest">
              Executive Console
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer backdrop-blur-xs border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Website</span>
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white/95 backdrop-blur-xl text-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40">
          
          {/* Header Icon */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#28651B] text-[#D9A51B] flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-[#28651B]/10">
              {view === 'login' ? <Lock className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {view === 'login' && 'Administrator Portal'}
              {view === 'forgot' && 'Reset Password'}
              {view === 'reset' && 'Enter Verification Code'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xs mx-auto">
              {view === 'login' && 'Authorized personnel only. Manage leads, projects, media, and site content.'}
              {view === 'forgot' && 'Enter your registered administrator email to receive a 6-digit OTP verification code.'}
              {view === 'reset' && 'Enter the 6-digit code and your new secure administrator password.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{resetMessage}</p>
                {generatedCodeHint && (
                  <p className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 inline-block text-xs font-bold text-[#1C4813]">
                    OTP: {generatedCodeHint}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* VIEW: LOGIN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="divireadstv@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setView('forgot');
                    }}
                    className="text-xs font-medium text-[#28651B] hover:text-[#1C4813] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Default Credentials Helper */}
              <div className="mt-4 p-3 bg-[#F2F5F0] rounded-xl text-xs text-neutral-600 flex items-center justify-between border border-neutral-200/60">
                <span className="font-medium text-neutral-800">Default Access:</span>
                <span className="font-mono text-neutral-700">divireadstv@gmail.com / divire2025</span>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD REQUEST */}
          {view === 'forgot' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="divireadstv@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send 6-Digit Reset Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setView('login');
                }}
                className="w-full py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-center"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* VIEW: VERIFY OTP AND SET NEW PASSWORD */}
          {view === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 849201"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 font-mono tracking-widest text-center text-base font-bold text-neutral-900 border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#28651B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#28651B] hover:bg-[#1C4813] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Password Change'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setView('login');
                }}
                className="w-full py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-center"
              >
                ← Cancel and Return to Login
              </button>
            </form>
          )}

        </div>

        {/* Security watermark */}
        <div className="mt-6 text-center text-xs text-white/50 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#D9A51B]" />
          <span>Protected by Divire Ads TV End-to-End Authentication</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-white/40 max-w-6xl mx-auto w-full pt-4">
        &copy; {new Date().getFullYear()} Divire Ads TV · Kaithal, Haryana · All administrative actions are logged.
      </footer>
    </div>
  );
};
