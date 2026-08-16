import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/forms/FormField';
import { User, KeyRound, Mail, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';

type AuthTab = 'password' | 'magic-link' | 'phone-otp';

export const MemberLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [activeTab, setActiveTab] = useState<AuthTab>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // In live environment, wires to supabase.auth.signInWithPassword
      const fakeToken = `mock-member-jwt-${Date.now()}`;
      setAuth(fakeToken, {
        id: '11111111-1111-1111-1111-111111111111',
        email: email || 'member@example.com',
        role: 'member',
      });
      navigate(ROUTES.MEMBER_DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // In live environment, wires to supabase.auth.signInWithOtp({ email })
      await new Promise((r) => setTimeout(r, 600));
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter a valid phone number.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // In live environment, wires to supabase.auth.signInWithOtp({ phone })
      await new Promise((r) => setTimeout(r, 600));
      setOtpSent(true);
      setCountdown(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // In live environment, wires to supabase.auth.verifyOtp({ phone, token, type: 'sms' })
      const fakeToken = `mock-member-jwt-${Date.now()}`;
      setAuth(fakeToken, {
        id: '11111111-1111-1111-1111-111111111111',
        email: phone,
        role: 'member',
      });
      navigate(ROUTES.MEMBER_DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance focus to next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 border-garage-mid bg-garage-dark/95">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center mx-auto mb-4 text-garage-chrome">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            MEMBER <span className="text-garage-chrome">/</span> PORTAL
          </h2>
          <p className="text-xs text-garage-muted mt-1 font-body">
            Access your membership credentials, renewal countdown, and official PDF invoices.
          </p>
        </div>

        {/* 3-Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-garage-black rounded-lg border border-garage-mid mb-6 text-xs font-semibold uppercase">
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setError(null); }}
            className={`py-2 px-1 rounded-md transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'password'
                ? 'bg-garage-chrome text-garage-black font-bold shadow'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Password</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('magic-link'); setError(null); }}
            className={`py-2 px-1 rounded-md transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'magic-link'
                ? 'bg-garage-chrome text-garage-black font-bold shadow'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Magic Link</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('phone-otp'); setError(null); }}
            className={`py-2 px-1 rounded-md transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'phone-otp'
                ? 'bg-garage-chrome text-garage-black font-bold shadow'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-status-expired/10 border border-status-expired/30 rounded-lg text-xs text-status-expired text-center">
            {error}
          </div>
        )}

        {/* TAB 1: EMAIL & PASSWORD */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <FormField
              label="Email Address"
              type="email"
              required
              placeholder="athlete@fitnessgarage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="Account Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Sign In with Password
            </Button>
          </form>
        )}

        {/* TAB 2: MAGIC LINK */}
        {activeTab === 'magic-link' && (
          <div>
            {magicLinkSent ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-status-active mx-auto" />
                <h4 className="text-lg font-bold font-display uppercase tracking-wider text-garage-white">
                  Magic Link Dispatched
                </h4>
                <p className="text-xs text-garage-muted font-body">
                  We have sent an instant login link to <span className="text-garage-white font-semibold">{email}</span>. Click the link in your inbox to enter your portal.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMagicLinkSent(false)}
                  className="mt-4"
                >
                  Send to different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <FormField
                  label="Registered Email"
                  type="email"
                  required
                  placeholder="athlete@fitnessgarage.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-[11px] text-garage-muted">
                  No password required. We will send a secure one-click authentication link directly to your inbox.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Send Magic Link
                </Button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: PHONE OTP */}
        {activeTab === 'phone-otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <FormField
                  label="Mobile Number"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-[11px] text-garage-muted">
                  Enter your registered phone number to receive a 6-digit verification PIN via SMS.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<Smartphone className="w-4 h-4" />}
                >
                  Send Verification SMS
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <p className="text-xs text-garage-muted">
                    Enter the 6-digit code sent to <span className="text-garage-white font-semibold">{phone}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-11 h-12 text-center text-xl font-bold rounded-lg bg-garage-black border border-garage-mid text-garage-white focus:border-garage-chrome focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Verify &amp; Enter Portal
                </Button>

                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <span className="text-xs text-garage-muted">
                      Resend code in <span className="text-garage-chrome font-mono font-bold">{countdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-garage-chrome hover:underline font-semibold"
                    >
                      Resend SMS Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-garage-mid text-center text-xs text-garage-muted space-y-2">
          <p>
            Need help? Contact gym front desk at{' '}
            <span className="text-garage-white font-semibold">+91 98765 43210</span>
          </p>
          <p>
            Are you gym staff?{' '}
            <Link to={ROUTES.ADMIN_LOGIN} className="text-garage-chrome hover:underline font-bold">
              Staff Portal Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
